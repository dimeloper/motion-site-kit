/**
 * Vortex — fitness-ring WebGL hero driven by ScrollTrigger + Lenis.
 * Scene is one torus: land, puff, seat. No product GLB.
 */

import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CONFIG } from '../config.js';
import { createVortexScene } from './scene.js?v=26';

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
  window.__vortexLenis = lenis;
  window.__harborLenis = lenis; // page.js in-page anchors
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

function updateProximity(hero, progress) {
  const items = hero.querySelectorAll('[data-proximity]');
  if (!items.length) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobile = window.matchMedia('(max-width: 1023px)').matches;
  items.forEach((el) => {
    const index = Number(el.dataset.proximity) || 0;
    const start = (mobile ? 0.1 : 0.22) + index * (mobile ? 0.14 : 0.18);
    const end = start + (mobile ? 0.14 : 0.16);
    const t = reduce ? 1 : Math.min(1, Math.max(0, (progress - start) / (end - start)));
    const eased = t * t * (3 - 2 * t);
    el.style.opacity = String(eased);
    el.style.transform = `translateY(${((1 - eased) * 10).toFixed(2)}px)`;
  });
}

function showStaticFallback(root, reason) {
  root.dataset.motion = 'static';
  root.dataset.fallbackReason = reason;
  const poster = root.querySelector('.hero__poster');
  if (poster) poster.style.opacity = '';
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
  scene.render(0);

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

  root.dataset.motion = 'preloading';
  const poster = root.querySelector('.hero__poster');
  if (poster) poster.style.opacity = '0';
  setLoaderProgress(bar, 0.08);

  let scene;
  try {
    setLoaderProgress(bar, 0.12);
    scene = await createVortexScene(canvas, {
      maxDpr: CONFIG.motion.maxDpr,
      onProgress: (n) => setLoaderProgress(bar, 0.12 + 0.78 * n),
    });
    setLoaderProgress(bar, 0.92);
    scene.resize();
    scene.render(0);
    setLoaderProgress(bar, 1);
  } catch (error) {
    console.warn('[vortex] WebGL hero failed, falling back to poster', error);
    scene?.dispose?.();
    showStaticFallback(root, 'webgl-failed');
    return;
  }

  const lenis = initSmoothScroll();
  wireInPageAnchors(lenis);
  bindScrollScene({ hero: root, canvas, scene });

  root.dataset.motion = 'ready';
  dismissLoader(loader);
  scene.playIntro?.();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMotion, { once: true });
} else {
  initMotion();
}
