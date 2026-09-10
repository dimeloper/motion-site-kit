import { createLifecycle } from '../../shared/lifecycle.js';
/**
 * Halo hero: ScrollTrigger drives ring lift. Stone stays put.
 */

import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CONFIG } from '../config.js?v=11';
import { createHaloScene } from './scene.js?v=11';

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
  const tick = (time) => lenis.raf(time * 1000);
  gsap.ticker.add(tick);
  const destroy = lenis.destroy.bind(lenis);
  lenis.destroy = () => {
    gsap.ticker.remove(tick);
    for (const key of ['__harborLenis', '__vortexLenis', '__haloLenis']) {
      if (window[key] === lenis) window[key] = null;
    }
    destroy();
  };
  gsap.ticker.lagSmoothing(0);
  window.__haloLenis = lenis;
  return lenis;
}

function wireInPageAnchors(lenis, signal) {
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
    { capture: true, signal },
  );
}

function setLoaderProgress(bar, progress) {
  if (bar) bar.style.setProperty('--progress', clamp(progress, 0, 1).toFixed(3));
}

function showStaticFallback(root, reason) {
  root.querySelector('[data-canvas]')?.classList.remove('is-ready');
  root.dataset.motion = 'static';
  root.dataset.fallbackReason = reason;
  root.querySelector('[data-loader]')?.remove();
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

function bindScrollScene({ hero, canvas, scene, signal }) {
  let progress = 0;

  const playhead = { progress: 0 };
  const tween = gsap.to(playhead, {
    progress: 1,
    ease: 'none',
    onUpdate: () => {
      progress = playhead.progress;
      scene.render(progress);
    },
    scrollTrigger: {
      trigger: hero,
      start: 'top top',
      end: () => `+=${window.innerHeight * CONFIG.motion.scrollLengthVh}`,
      pin: true,
      anticipatePin: 1,
      scrub: CONFIG.motion.scrub,
      invalidateOnRefresh: true,
    },
  });

  const onResize = () => {
    scene.resize();
    scene.render(progress);
    ScrollTrigger.refresh();
  };
  window.addEventListener('resize', onResize, { passive: true, signal });
  canvas.classList.add('is-ready');
  return () => { tween.scrollTrigger?.kill(); tween.kill(); };
}

let currentRun;

export async function initMotion() {
  currentRun?.stop('reinitialized');
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

  delete root.dataset.fallbackReason;
  const run = createLifecycle(root, canvas, showStaticFallback, CONFIG.motion.loadTimeoutMs ?? 30000);
  currentRun = run;
  root.dataset.motion = 'preloading';
  setLoaderProgress(bar, 0.08);

  let scene;
  try {
    setLoaderProgress(bar, 0.12);
    scene = await createHaloScene(canvas, {
      maxDpr: CONFIG.motion.maxDpr,
      signal: run.signal,
      modelUrl: CONFIG.motion.modelUrl,
      onProgress: (n) => setLoaderProgress(bar, 0.12 + 0.78 * n),
    });
    if (!run.attach(scene)) return;
    setLoaderProgress(bar, 0.92);
    scene.resize();
    scene.render(0);
    setLoaderProgress(bar, 1);
  } catch (error) {
    console.warn('[motion] WebGL hero failed, falling back to poster', error);
    run.stop('webgl-failed');
    return;
  }

  const lenis = initSmoothScroll();
  run.own(() => lenis.destroy());
  wireInPageAnchors(lenis, run.signal);
  run.own(bindScrollScene({ hero: root, canvas, scene, signal: run.signal }));
  run.ready();

  root.dataset.motion = 'ready';
  dismissLoader(loader);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMotion, { once: true });
} else {
  initMotion();
}

window.addEventListener('pageshow', event => { if (event.persisted) initMotion(); });
