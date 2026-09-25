/**
 * Shared WebGL hero runtime for the examples: fallback decision, loader,
 * lifecycle, Lenis and the ScrollTrigger pin. Each example's motion.js passes
 * its scene factory and config; everything below is identical across them.
 *
 * The frame-scrub template has its own engine in template/src/motion.js and
 * does not use this file.
 */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { createLifecycle } from './lifecycle.js';
import { startSmoothScroll } from './smooth-scroll.js';

gsap.registerPlugin(ScrollTrigger);

const clamp = (n, min, max) => Math.min(Math.max(n, min), max);
const REDUCED = '(prefers-reduced-motion: reduce)';

/** Probe for WebGL, then release the probe: browsers cap live contexts per page. */
function hasWebGL() {
  try {
    const probe = document.createElement('canvas');
    const gl = probe.getContext('webgl2') || probe.getContext('webgl');
    gl?.getExtension('WEBGL_lose_context')?.loseContext();
    return Boolean(gl);
  } catch {
    return false;
  }
}

/** Same signals as the frame template, plus missing WebGL. Never viewport width. */
function staticReason() {
  if (matchMedia(REDUCED).matches) return 'reduced-motion';
  const connection = navigator.connection;
  if (connection?.saveData) return 'save-data';
  if (['slow-2g', '2g'].includes(connection?.effectiveType)) return 'slow-connection';
  if (!hasWebGL()) return 'no-webgl';
  return null;
}

/**
 * Height of one small viewport, measured once from a 100svh probe.
 *
 * innerHeight changes when a mobile URL bar collapses. A pin length tied to it
 * jumps the scene mid-scroll whenever ScrollTrigger re-measures.
 */
let svhProbe;
function screenHeight() {
  if (!svhProbe) {
    svhProbe = document.createElement('div');
    svhProbe.setAttribute('aria-hidden', 'true');
    svhProbe.style.cssText = 'position:absolute;top:0;left:0;width:0;height:100svh;visibility:hidden;pointer-events:none';
    document.body.append(svhProbe);
  }
  return svhProbe.offsetHeight || innerHeight;
}

function setLoaderProgress(bar, progress) {
  if (bar) bar.style.setProperty('--progress', clamp(progress, 0, 1).toFixed(3));
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
  setTimeout(finish, 900);
}

/**
 * Fade [data-proximity] copy in as the hero plays. Timings come from config:
 * { desktop: { start, step, span }, mobile: { ... } }, as fractions of progress.
 */
function createProximity(hero, timings, mobile) {
  const items = [...hero.querySelectorAll('[data-proximity]')];
  return (progress) => {
    if (!items.length || !timings) return;
    const timing = mobile.matches ? timings.mobile : timings.desktop;
    const reduce = matchMedia(REDUCED).matches;
    for (const el of items) {
      const start = timing.start + (Number(el.dataset.proximity) || 0) * timing.step;
      const t = reduce ? 1 : clamp((progress - start) / timing.span, 0, 1);
      const eased = t * t * (3 - 2 * t);
      el.style.opacity = String(eased);
      el.style.transform = `translateY(${((1 - eased) * 10).toFixed(2)}px)`;
    }
  };
}

function bindScrollScene({ hero, canvas, scene, motion, proximity, signal }) {
  let progress = 0;
  const playhead = { progress: 0 };
  const tween = gsap.to(playhead, {
    progress: 1,
    ease: 'none',
    onUpdate: () => {
      progress = playhead.progress;
      scene.render(progress);
      proximity(progress);
    },
    scrollTrigger: {
      trigger: hero,
      start: 'top top',
      end: () => `+=${screenHeight() * motion.scrollLengthVh}`,
      pin: true,
      anticipatePin: 1,
      scrub: motion.scrub,
      invalidateOnRefresh: true,
    },
  });
  scene.render(0);
  proximity(0);

  // Refresh only when the canvas changed size. GSAP already ignores
  // height-only resizes on touch devices; refreshing here anyway would
  // re-measure the pin every time a URL bar moves.
  const onResize = () => {
    const changed = scene.resize();
    scene.render(progress);
    proximity(progress);
    if (changed) ScrollTrigger.refresh();
  };
  addEventListener('resize', onResize, { passive: true, signal });
  canvas.classList.add('is-ready');
  return () => {
    tween.scrollTrigger?.kill();
    tween.kill();
  };
}

/**
 * Run one example's WebGL hero. Returns initMotion so the example can re-run
 * it; bfcache restores and the initial load are wired here.
 */
export function startWebGLHero({ config, createScene, label = 'motion' }) {
  const motion = config.motion;
  const mobile = matchMedia(`(max-width: ${motion.mobileBreakpoint}px)`);
  let currentRun;

  function showStaticFallback(root, reason) {
    root.querySelector('[data-canvas]')?.classList.remove('is-ready');
    root.dataset.motion = 'static';
    root.dataset.fallbackReason = reason;
    root.querySelector('[data-loader]')?.remove();
    const poster = root.querySelector('.hero__poster');
    if (poster) poster.style.opacity = '';
    createProximity(root, motion.proximity, mobile)(1);
  }

  async function initMotion() {
    currentRun?.stop('reinitialized');
    const root = document.querySelector('[data-hero]');
    if (!root) return;
    const canvas = root.querySelector('[data-canvas]');
    const loader = root.querySelector('[data-loader]');
    const bar = root.querySelector('[data-loader-bar]');

    const reason = staticReason();
    if (reason) {
      showStaticFallback(root, reason);
      return;
    }

    // Reveal the loader only after committing to run, never before.
    delete root.dataset.fallbackReason;
    const run = createLifecycle(root, canvas, showStaticFallback, motion.loadTimeoutMs ?? 30000);
    currentRun = run;
    root.dataset.motion = 'preloading';
    setLoaderProgress(bar, 0.12);

    let scene;
    try {
      scene = await createScene(canvas, {
        maxDpr: motion.maxDpr,
        signal: run.signal,
        modelUrl: motion.modelUrl,
        motion,
        mobile,
        onProgress: (n) => setLoaderProgress(bar, 0.12 + 0.78 * n),
      });
      if (!run.attach(scene)) return;
      setLoaderProgress(bar, 0.92);
      scene.resize();
      scene.render(0);
      setLoaderProgress(bar, 1);
    } catch (error) {
      console.warn(`[${label}] WebGL hero failed, falling back to poster`, error);
      run.stop('webgl-failed');
      return;
    }

    run.own(startSmoothScroll(motion.lenisDuration));
    const proximity = createProximity(root, motion.proximity, mobile);
    run.own(bindScrollScene({ hero: root, canvas, scene, motion, proximity, signal: run.signal }));
    run.ready();
    root.dataset.motion = 'ready';
    dismissLoader(loader);
    scene.playIntro?.();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMotion, { once: true });
  } else {
    initMotion();
  }
  addEventListener('pageshow', (event) => { if (event.persisted) initMotion(); });
  return initMotion;
}
