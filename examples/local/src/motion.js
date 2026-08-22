/**
 * Scroll-driven frame sequence engine.
 *
 * This file is the engine. It should not need editing between projects — copy,
 * colors, and section order live in config.js. That separation is what makes the
 * second build a reskin instead of a rebuild.
 */

import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CONFIG } from '../config.js';

gsap.registerPlugin(ScrollTrigger);

/** 1x1 AVIF, used as a decode probe instead of user-agent sniffing. */
const AVIF_PROBE =
  'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAEAAAABAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQAMAAAAABNjb2xybmNseAACAAIABoAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEDQgMgkQAAAAB8dSLfI=';

const clamp = (n, min, max) => Math.min(Math.max(n, min), max);

async function supportsAvif() {
  try {
    const blob = await (await fetch(AVIF_PROBE)).blob();
    const bitmap = await createImageBitmap(blob);
    bitmap.close?.();
    return true;
  } catch {
    return false;
  }
}

/**
 * Reasons to serve the static poster instead of the sequence.
 *
 * Note what is deliberately absent: viewport width. The usual advice is to skip
 * the animation under 768px, but the 640 rung is a few hundred kilobytes and
 * phones are most of the traffic. Serve them the narrow ladder, not a JPEG.
 */
function shouldUseStaticFallback() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return 'reduced-motion';
  const connection = navigator.connection;
  if (connection?.saveData) return 'save-data';
  if (['slow-2g', '2g'].includes(connection?.effectiveType)) return 'slow-connection';
  if (typeof createImageBitmap !== 'function') return 'no-imagebitmap';
  return null;
}

function pickWidth(manifest) {
  const dpr = clamp(window.devicePixelRatio || 1, 1, CONFIG.motion.maxDpr);
  const target = window.innerWidth * dpr;
  return manifest.widths.find((w) => w >= target) ?? manifest.widths.at(-1);
}

function frameUrl(manifest, base, width, format, index) {
  const padded = String(index).padStart(manifest.padding, '0');
  return `${base}/${width}/${format}/${padded}.${format}`;
}

/** Fetch and decode with a concurrency window — 120 parallel requests starve the first frames. */
async function preload(urls, concurrency, onProgress) {
  const bitmaps = new Array(urls.length);
  let cursor = 0;
  let done = 0;

  async function worker() {
    while (cursor < urls.length) {
      const index = cursor++;
      const response = await fetch(urls[index]);
      if (!response.ok) throw new Error(`frame ${index} failed: ${response.status}`);
      bitmaps[index] = await createImageBitmap(await response.blob());
      onProgress(++done / urls.length);
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, urls.length) }, worker));
  return bitmaps;
}

/** Draw with cover semantics, computed in JS — CSS-only scaling blurs canvas on retina. */
function makeRenderer(canvas, bitmaps) {
  const ctx = canvas.getContext('2d', { alpha: false });
  let current = -1;

  function resize() {
    const dpr = clamp(window.devicePixelRatio || 1, 1, CONFIG.motion.maxDpr);
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    if (current >= 0) draw(current, true);
  }

  function draw(index, force = false) {
    if (index === current && !force) return;
    current = index;
    const bitmap = bitmaps[index];
    if (!bitmap) return;
    const scale = Math.max(canvas.width / bitmap.width, canvas.height / bitmap.height);
    const w = bitmap.width * scale;
    const h = bitmap.height * scale;
    ctx.drawImage(bitmap, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h);
  }

  return { draw, resize };
}

function initSmoothScroll() {
  const lenis = new Lenis({
    duration: CONFIG.motion.lenisDuration,
    smoothWheel: true,
    syncTouch: false,
  });
  // One RAF loop, not two. Independent loops desynchronize and the canvas trails
  // the page by a frame or so — legible as "cheap" without looking broken.
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  // Default lag smoothing jumps the timeline after a stall, which on a scrubbed
  // sequence shows as a frame skip right after the preloader finishes.
  gsap.ticker.lagSmoothing(0);
  return lenis;
}

function bindScrollTrigger({ hero, canvas, renderer, frameCount }) {
  ScrollTrigger.create({
    trigger: hero,
    start: 'top top',
    end: () => `+=${window.innerHeight * CONFIG.motion.scrollLengthVh}`,
    pin: true,
    anticipatePin: 1,
    scrub: CONFIG.motion.scrub,
    invalidateOnRefresh: true,
    onUpdate: (self) => {
      // onUpdate fires far more often than the frame index changes; the renderer
      // guards on that internally so this stays at `frameCount` draws, not thousands.
      renderer.draw(Math.round(self.progress * (frameCount - 1)));
    },
  });

  const onResize = () => {
    renderer.resize();
    ScrollTrigger.refresh();
  };
  window.addEventListener('resize', onResize, { passive: true });
  canvas.classList.add('is-ready');
}

function showStaticFallback(root, reason) {
  root.dataset.motion = 'static';
  root.dataset.fallbackReason = reason;
  root.querySelector('[data-loader]')?.remove();
}

export async function initMotion() {
  const root = document.querySelector('[data-hero]');
  if (!root) return;

  const canvas = root.querySelector('[data-canvas]');
  const loader = root.querySelector('[data-loader]');
  const bar = root.querySelector('[data-loader-bar]');

  const fallbackReason = shouldUseStaticFallback();
  if (fallbackReason) {
    showStaticFallback(root, fallbackReason);
    return;
  }

  const base = CONFIG.motion.framesBase;
  let manifest;
  try {
    manifest = await (await fetch(`${base}/manifest.json`)).json();
  } catch {
    showStaticFallback(root, 'manifest-unavailable');
    return;
  }

  const width = pickWidth(manifest);
  const format =
    manifest.formats.includes('avif') && (await supportsAvif()) ? 'avif' : manifest.formats.at(-1);

  const urls = Array.from({ length: manifest.count }, (_, i) =>
    frameUrl(manifest, base, width, format, i),
  );

  let bitmaps;
  try {
    // Reveal the loader only now — everything above this point can bail to the
    // poster, and a loader shown before that is one the visitor may watch forever.
    root.dataset.motion = 'preloading';
    // The loading state gates ScrollTrigger.create, not just the visuals. Gating
    // only the visuals is what produces the blank-canvas flash on first scroll.
    bitmaps = await preload(urls, CONFIG.motion.concurrency, (progress) => {
      if (bar) bar.style.setProperty('--progress', progress.toFixed(3));
    });
  } catch (error) {
    console.warn('[motion] preload failed, falling back to poster', error);
    showStaticFallback(root, 'preload-failed');
    return;
  }

  const renderer = makeRenderer(canvas, bitmaps);
  renderer.resize();
  renderer.draw(0, true);

  initSmoothScroll();
  bindScrollTrigger({ hero: root, canvas, renderer, frameCount: manifest.count });

  root.dataset.motion = 'ready';
  loader?.remove();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMotion, { once: true });
} else {
  initMotion();
}
