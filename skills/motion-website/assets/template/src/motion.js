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
import { createFrameCache } from './frame-cache.js';
import { validateMotionConfig } from './validate-config.js';
import { frameUrl, pickWidth, validateManifest } from './ladder.js';

gsap.registerPlugin(ScrollTrigger);

/** 1x1 AVIF, used as a decode probe instead of user-agent sniffing. */
const AVIF_PROBE =
  'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADrbWV0YQAAAAAAAAAhaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAAAAAAAOcGl0bQAAAAAAAQAAAB5pbG9jAAAAAEQAAAEAAQAAAAEAAAETAAAAIwAAAChpaW5mAAAAAAABAAAAGmluZmUCAAAAAAEAAGF2MDFDb2xvcgAAAABqaXBycAAAAEtpcGNvAAAAFGlzcGUAAAAAAAAAAQAAAAEAAAAQcGl4aQAAAAADCAgIAAAADGF2MUOBAAwAAAAAE2NvbHJuY2x4AAEADQAGgAAAABdpcG1hAAAAAAAAAAEAAQQBAoMEAAAAK21kYXQSAAoIGAAGiAhoNCAyFRTHh4ZlAgggnlAAAABIWtlc1jAXYA==';

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
 * the animation under 768px, but phones fetch the 640 or 960 rung, both held
 * to the 1.5 MB phone ceiling, and phones are most of the traffic. Serve them
 * a ladder, not a JPEG.
 */
function shouldUseStaticFallback() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return 'reduced-motion';
  const connection = navigator.connection;
  if (connection?.saveData) return 'save-data';
  if (['slow-2g', '2g'].includes(connection?.effectiveType)) return 'slow-connection';
  if (typeof createImageBitmap !== 'function') return 'no-imagebitmap';
  return null;
}

/** Fetch compressed frames with a concurrency window; decoding has its own memory budget. */
async function preload(urls, concurrency, onProgress, controller) {
  const blobs = new Array(urls.length);
  let cursor = 0;
  let done = 0;

  async function worker() {
    while (cursor < urls.length && !controller.signal.aborted) {
      const index = cursor++;
      const response = await fetch(urls[index], { signal: controller.signal });
      if (!response.ok) throw new Error(`frame ${index} failed: ${response.status}`);
      blobs[index] = await response.blob();
      if (controller.signal.aborted) throw controller.signal.reason;
      onProgress(++done / urls.length);
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, urls.length) }, () =>
    worker().catch((error) => { controller.abort(error); throw error; }));
  const results = await Promise.allSettled(workers);
  const failed = results.find((result) => result.status === 'rejected');
  if (failed || controller.signal.aborted) {
    blobs.length = 0;
    throw failed?.reason ?? controller.signal.reason;
  }
  return blobs;
}

/** Draw with cover semantics, computed in JS — CSS-only scaling blurs canvas on retina. */
function makeRenderer(canvas, frames) {
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) throw new Error('2D canvas unavailable');
  let current = -1;

  /** Returns false when the backing store already matches, so callers can skip work. */
  function resize() {
    const dpr = clamp(window.devicePixelRatio || 1, 1, CONFIG.motion.maxDpr);
    const rect = canvas.getBoundingClientRect();
    const width = Math.round(rect.width * dpr);
    const height = Math.round(rect.height * dpr);
    // Assigning canvas.width clears the canvas even when the value is unchanged.
    if (width === canvas.width && height === canvas.height) return false;
    canvas.width = width;
    canvas.height = height;
    if (current >= 0) draw(current, true);
    return true;
  }

  function draw(index, force = false) {
    if (index === current && !force) return;
    frames.request(index);
    const bitmap = frames.get(index);
    if (!bitmap) return;
    current = index;
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
  const tick = (time) => lenis.raf(time * 1000);
  gsap.ticker.add(tick);
  // Default lag smoothing jumps the timeline after a stall, which on a scrubbed
  // sequence shows as a frame skip right after the preloader finishes.
  gsap.ticker.lagSmoothing(0);
  return {
    lenis,
    stop() {
      gsap.ticker.remove(tick);
      lenis.destroy();
    },
  };
}

function bindScrollTrigger({ hero, canvas, renderer, frameCount, lenis }) {
  // A visitor who scrolled past the hero while frames downloaded would see the
  // page jump when the pin spacer is inserted above them. Measure the content
  // after the hero before and after pinning, and scroll by the difference.
  const after = hero.nextElementSibling;
  const scrolledPast = hero.getBoundingClientRect().bottom <= 0;
  const anchorTop = after?.getBoundingClientRect().top;

  const playhead = { frame: 0 };
  const tween = gsap.to(playhead, {
    frame: frameCount - 1,
    ease: 'none',
    onUpdate: () => renderer.draw(Math.round(playhead.frame)),
    scrollTrigger: {
      trigger: hero,
      start: 'top top',
      // The hero's own height, not innerHeight. The hero is sized in svh, which
      // does not change when a mobile URL bar collapses; innerHeight does, and
      // a pin length tied to it jumps the sequence mid-scroll on phones.
      end: () => `+=${hero.clientHeight * CONFIG.motion.scrollLengthVh}`,
      pin: true,
      anticipatePin: 1,
      scrub: CONFIG.motion.scrub,
      invalidateOnRefresh: true,
    },
  });

  if (scrolledPast && after) {
    ScrollTrigger.refresh();
    const shift = after.getBoundingClientRect().top - anchorTop;
    if (Math.abs(shift) >= 1) {
      // Lenis clamps targets to a page height it caches and only re-measures
      // from a ResizeObserver, which Safari delivers after this runs. Without
      // re-measuring, the spacer's new height is out of reach and the page
      // still jumps by the difference.
      lenis.resize();
      lenis.scrollTo(window.scrollY + shift, { immediate: true, force: true });
      ScrollTrigger.update();
    }
  }

  // Refresh only when the hero actually changed size. GSAP already ignores
  // height-only resizes on touch devices; an unconditional refresh here would
  // undo that and re-measure the pin every time the URL bar moves.
  const onResize = () => {
    if (renderer.resize()) ScrollTrigger.refresh();
  };
  window.addEventListener('resize', onResize, { passive: true });
  canvas.classList.add('is-ready');
  return () => {
    window.removeEventListener('resize', onResize);
    tween.scrollTrigger?.kill();
    tween.kill();
    canvas.classList.remove('is-ready');
  };
}

function showStaticFallback(root, reason) {
  root.querySelector('[data-canvas]')?.classList.remove('is-ready');
  root.dataset.motion = 'static';
  root.dataset.fallbackReason = reason;
  root.querySelector('[data-loader]')?.remove();
}

let disposeMotion = () => {};
let generation = 0;

export async function initMotion() {
  disposeMotion();
  const run = ++generation;
  const root = document.querySelector('[data-hero]');
  if (!root) return;

  delete root.dataset.fallbackReason;
  const canvas = root.querySelector('[data-canvas]');
  const loader = root.querySelector('[data-loader]');
  const bar = root.querySelector('[data-loader-bar]');

  const fallbackReason = shouldUseStaticFallback();
  if (fallbackReason) {
    showStaticFallback(root, fallbackReason);
    return;
  }

  try { validateMotionConfig(CONFIG.motion); }
  catch (error) {
    console.warn('[motion] invalid config', error);
    showStaticFallback(root, 'invalid-config');
    return;
  }

  const controller = new AbortController();
  // Total loading deadline, not a per-frame timer that can extend indefinitely.
  const timeout = window.setTimeout(() => {
    cleanup();
    if (run === generation) showStaticFallback(root, 'load-timeout');
  },
    CONFIG.motion.loadTimeoutMs ?? 30000);
  let frames;
  let stopScroll = () => {};
  let stopSmooth = () => {};
  let disposed = false;
  const cleanup = () => {
    if (disposed) return;
    disposed = true;
    controller.abort();
    window.clearTimeout(timeout);
    stopScroll();
    stopSmooth();
    frames?.dispose();
    if (run === generation) {
      canvas.classList.remove('is-ready');
      root.dataset.motion = 'static';
    }
  };
  disposeMotion = cleanup;
  const base = CONFIG.motion.framesBase;
  let manifest;
  try {
    const response = await fetch(`${base}/manifest.json`, { signal: controller.signal });
    if (!response.ok) throw new Error('Manifest request failed');
    manifest = validateManifest(await response.json());
  } catch {
    cleanup();
    if (run === generation) showStaticFallback(root, 'manifest-unavailable');
    return;
  }

  const width = pickWidth(manifest.widths, window.innerWidth, window.devicePixelRatio, CONFIG.motion.maxDpr);
  const format =
    manifest.formats.includes('avif') && (await supportsAvif()) ? 'avif' : manifest.formats.at(-1);

  if (controller.signal.aborted || run !== generation) return;

  const urls = Array.from({ length: manifest.count }, (_, i) =>
    frameUrl(manifest, base, width, format, i),
  );

  let blobs;
  try {
    // Reveal the loader only now — everything above this point can bail to the
    // poster, and a loader shown before that is one the visitor may watch forever.
    root.dataset.motion = 'preloading';
    // The loading state gates ScrollTrigger.create, not just the visuals. Gating
    // only the visuals is what produces the blank-canvas flash on first scroll.
    blobs = await preload(urls, CONFIG.motion.concurrency, (progress) => {
      if (bar) bar.style.setProperty('--progress', progress.toFixed(3));
    }, controller);
    if (controller.signal.aborted || run !== generation) {
      blobs.length = 0;
      return;
    }

  } catch (error) {
    cleanup();
    console.warn('[motion] preload failed, falling back to poster', error);
    if (run === generation) showStaticFallback(root, 'preload-failed');
    return;
  }

  try {
    let requested = 0;
    let renderer;
    frames = await createFrameCache(blobs, {
      maxBytes: CONFIG.motion.maxDecodedBytes ?? 128 * 1024 * 1024,
      onFrame: (index) => { if (index === requested) renderer?.draw(requested, true); },
      onError: (error) => {
        cleanup();
        console.warn('[motion] frame decode failed', error);
        if (run === generation) showStaticFallback(root, 'decode-failed');
      },
    });
    if (controller.signal.aborted || run !== generation) { frames.dispose(); return; }
    renderer = makeRenderer(canvas, frames);
    const draw = renderer.draw;
    renderer.draw = (index, force) => { requested = index; draw(index, force); };
    renderer.resize();
    renderer.draw(0, true);
    const smooth = initSmoothScroll();
    stopSmooth = smooth.stop;
    stopScroll = bindScrollTrigger({ hero: root, canvas, renderer, frameCount: manifest.count, lenis: smooth.lenis });
    window.clearTimeout(timeout);
    root.dataset.motion = 'ready';
    loader?.remove();
  } catch (error) {
    cleanup();
    console.warn('[motion] renderer failed', error);
    if (run === generation) showStaticFallback(root, 'renderer-failed');
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMotion, { once: true });
} else {
  initMotion();
}

window.addEventListener('pagehide', () => { disposeMotion(); generation++; });
window.addEventListener('pageshow', (event) => { if (event.persisted) initMotion(); });

window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', () => initMotion());
navigator.connection?.addEventListener('change', () => {
  if (shouldUseStaticFallback()) initMotion();
});
