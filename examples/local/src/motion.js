/**
 * Harbor Oven — live WebGL hero driven by ScrollTrigger.
 *
 * Harbor-only proof of sculptural 3D motion (Lumora-adjacent). Other demos keep
 * the frame-sequence engine. Fallbacks still honor reduced-motion / Save-Data / 2G.
 */

import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CONFIG } from '../config.js';
import { createHarborScene } from './scene.js?v=16';

gsap.registerPlugin(ScrollTrigger);

const clamp = (n, min, max) => Math.min(Math.max(n, min), max);

function shouldUseStaticFallback() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return 'reduced-motion';
  const connection = navigator.connection;
  if (connection?.saveData) return 'save-data';
  if (['slow-2g', '2g'].includes(connection?.effectiveType)) return 'slow-connection';
  if (!hasWebGL()) return 'no-webgl';
  return null;
}

function hasWebGL() {
  try {
    const probe = document.createElement('canvas');
    return Boolean(probe.getContext('webgl2') || probe.getContext('webgl'));
  } catch {
    return false;
  }
}

function initSmoothScroll() {
  const lenis = new Lenis({
    duration: CONFIG.motion.lenisDuration,
    smoothWheel: true,
    syncTouch: false,
  });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  // page.js uses this for in-page anchors (native hash + Lenis otherwise fight).
  window.__harborLenis = lenis;
  return lenis;
}

function wireInPageAnchors(lenis) {
  document.addEventListener(
    'click',
    (event) => {
      const link = event.target.closest('a[href^="#"]');
      if (!link) return;
      const hash = link.getAttribute('href');
      if (!hash || hash.length < 2) return;
      const target = document.querySelector(hash);
      if (!target) return;
      event.preventDefault();
      if (lenis) lenis.scrollTo(target, { offset: -8 });
      else target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },
    { capture: true },
  );
}

function setLoaderProgress(bar, progress) {
  if (bar) bar.style.setProperty('--progress', clamp(progress, 0, 1).toFixed(3));
}

function showStaticFallback(root, reason) {
  root.dataset.motion = 'static';
  root.dataset.fallbackReason = reason;
  root.querySelector('[data-loader]')?.remove();
  updateProximity(root, 1);
}

function dismissLoader(loader) {
  if (!loader) return;
  if (!loader.hasAttribute('data-exit')) {
    loader.remove();
    return;
  }
  loader.classList.add('is-leaving');
  const finish = () => loader.remove();
  loader.addEventListener('animationend', finish, { once: true });
  window.setTimeout(finish, 900);
}

function updateProximity(hero, progress) {
  const items = hero.querySelectorAll('[data-proximity]');
  if (!items.length) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobile = window.matchMedia('(max-width: 1023px)').matches;
  items.forEach((el) => {
    const index = Number(el.dataset.proximity) || 0;
    // Mobile: reveal earlier so meta reads while loaf fills the lower half.
    const start = (mobile ? 0.12 : 0.28) + index * (mobile ? 0.16 : 0.2);
    const end = start + (mobile ? 0.14 : 0.16);
    const t = reduce
      ? 1
      : Math.min(1, Math.max(0, (progress - start) / (end - start)));
    const eased = t * t * (3 - 2 * t);
    el.style.opacity = String(eased);
    el.style.transform = `translateY(${((1 - eased) * 10).toFixed(2)}px)`;
  });
}

function bindScrollScene({ hero, canvas, scene }) {
  let progress = 0;

  ScrollTrigger.create({
    trigger: hero,
    start: 'top top',
    end: () => `+=${window.innerHeight * CONFIG.motion.scrollLengthVh}`,
    pin: true,
    anticipatePin: 1,
    scrub: CONFIG.motion.scrub,
    invalidateOnRefresh: true,
    onUpdate: (self) => {
      progress = self.progress;
      scene.render(progress);
      updateProximity(hero, progress);
    },
  });

  updateProximity(hero, 0);

  const onResize = () => {
    scene.resize();
    scene.render(progress);
    updateProximity(hero, progress);
    ScrollTrigger.refresh();
  };
  window.addEventListener('resize', onResize, { passive: true });
  canvas.classList.add('is-ready');
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

  // Reveal loader only after we commit to running — never before.
  root.dataset.motion = 'preloading';
  setLoaderProgress(bar, 0.08);

  let scene;
  try {
    setLoaderProgress(bar, 0.12);
    scene = await createHarborScene(canvas, {
      maxDpr: CONFIG.motion.maxDpr,
      modelUrl: CONFIG.motion.modelUrl,
      onProgress: (n) => setLoaderProgress(bar, 0.12 + 0.78 * n),
    });
    setLoaderProgress(bar, 0.92);
    scene.resize();
    scene.render(0);
    scene.resize();
    scene.render(0);
    setLoaderProgress(bar, 1);
  } catch (error) {
    console.warn('[motion] WebGL hero failed, falling back to poster', error);
    scene?.dispose?.();
    showStaticFallback(root, 'webgl-failed');
    return;
  }

  const lenis = initSmoothScroll();
  wireInPageAnchors(lenis);
  bindScrollScene({ hero: root, canvas, scene });

  root.dataset.motion = 'ready';
  dismissLoader(loader);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMotion, { once: true });
} else {
  initMotion();
}
