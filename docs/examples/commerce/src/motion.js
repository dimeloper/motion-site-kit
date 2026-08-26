/**
 * Kiln Carry float engine — layered stills drift on scroll.
 * Distinct from Harbor orbit and Ledgerline particles.
 */

import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CONFIG } from '../config.js';

gsap.registerPlugin(ScrollTrigger);

function shouldUseStaticFallback() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return 'reduced-motion';
  const connection = navigator.connection;
  if (connection?.saveData) return 'save-data';
  if (['slow-2g', '2g'].includes(connection?.effectiveType)) return 'slow-connection';
  return null;
}

function renderLayers(host, layers) {
  host.innerHTML = layers
    .map(
      (layer, index) => `
      <figure class="float-layer" data-layer data-depth="${layer.depth}" style="
        --x:${layer.x};
        --y:${layer.y};
        --scale:${layer.scale};
        --rotate:${layer.rotate}deg;
        --z:${index + 1};
      ">
        <img src="${layer.src}" alt="" decoding="async" loading="${index < 2 ? 'eager' : 'lazy'}" />
      </figure>`,
    )
    .join('');
}

async function boot() {
  const hero = document.querySelector('[data-hero]');
  const stage = document.querySelector('[data-float]');
  if (!hero || !stage) return;

  const layers = CONFIG.float?.layers || [];
  renderLayers(stage, layers);

  const reason = shouldUseStaticFallback();
  if (reason) {
    hero.dataset.motion = 'static';
    hero.dataset.fallback = reason;
    return;
  }

  hero.dataset.motion = 'preloading';

  const images = [...stage.querySelectorAll('img')];
  await Promise.all(
    images.map(
      (img) =>
        new Promise((resolve) => {
          if (img.complete) resolve();
          else {
            img.addEventListener('load', resolve, { once: true });
            img.addEventListener('error', resolve, { once: true });
          }
        }),
    ),
  );

  const nodes = [...stage.querySelectorAll('[data-layer]')];
  stage.classList.add('is-ready');
  hero.dataset.motion = 'ready';

  const lenis = new Lenis({
    duration: CONFIG.motion.lenisDuration ?? 1.15,
    smoothWheel: true,
  });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  const scrub = { p: 0 };
  ScrollTrigger.create({
    trigger: hero,
    start: 'top top',
    end: () => `+=${window.innerHeight * (CONFIG.motion.scrollLengthVh ?? 3)}`,
    pin: true,
    scrub: CONFIG.motion.scrub ?? 0.6,
    onUpdate: (self) => {
      scrub.p = self.progress;
      for (const node of nodes) {
        const depth = Number(node.dataset.depth) || 0.5;
        const y = (scrub.p - 0.5) * depth * -120;
        const x = Math.sin(scrub.p * Math.PI) * depth * 36;
        const rot = (scrub.p - 0.5) * depth * 12;
        const scale = 1 + scrub.p * depth * 0.12;
        node.style.setProperty('--drift-x', `${x}px`);
        node.style.setProperty('--drift-y', `${y}px`);
        node.style.setProperty('--drift-rot', `${rot}deg`);
        node.style.setProperty('--drift-scale', String(scale));
      }
    },
  });
}

boot().catch((error) => {
  console.error('[kiln float]', error);
  const hero = document.querySelector('[data-hero]');
  if (hero) {
    hero.dataset.motion = 'static';
    hero.dataset.fallback = 'boot-failed';
  }
});
