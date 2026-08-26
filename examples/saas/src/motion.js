/**
 * Ledgerline particle engine — scroll densifies a signal field.
 * Distinct from Harbor's WebGL orbit and the template's frame scrub.
 */

import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CONFIG } from '../config.js';

gsap.registerPlugin(ScrollTrigger);

const clamp = (n, min, max) => Math.min(Math.max(n, min), max);

function shouldUseStaticFallback() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return 'reduced-motion';
  const connection = navigator.connection;
  if (connection?.saveData) return 'save-data';
  if (['slow-2g', '2g'].includes(connection?.effectiveType)) return 'slow-connection';
  return null;
}

function createParticles(count, width, height) {
  return Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    z: Math.random(),
    r: 0.6 + Math.random() * 1.8,
    drift: (Math.random() - 0.5) * 0.35,
  }));
}

function paintParticles(ctx, particles, progress, width, height) {
  ctx.clearRect(0, 0, width, height);

  const bandY = height * (0.42 + progress * 0.08);
  const bandH = height * (0.08 + progress * 0.12);
  const pull = progress * progress;

  const grd = ctx.createLinearGradient(0, bandY - bandH, 0, bandY + bandH);
  grd.addColorStop(0, 'rgba(110, 160, 255, 0)');
  grd.addColorStop(0.5, `rgba(110, 160, 255, ${0.08 + pull * 0.22})`);
  grd.addColorStop(1, 'rgba(110, 160, 255, 0)');
  ctx.fillStyle = grd;
  ctx.fillRect(0, bandY - bandH, width, bandH * 2);

  for (const p of particles) {
    const targetY = bandY + (p.z - 0.5) * bandH * 1.6;
    const y = p.y + (targetY - p.y) * pull;
    const x = (p.x + p.drift * progress * width + width) % width;
    const alpha = 0.12 + p.z * 0.35 + pull * 0.35;
    const radius = p.r * (0.7 + pull * 1.1);

    ctx.beginPath();
    ctx.fillStyle = `rgba(237, 232, 223, ${alpha})`;
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    if (pull > 0.35 && p.z > 0.55) {
      ctx.beginPath();
      ctx.strokeStyle = `rgba(110, 160, 255, ${(pull - 0.35) * 0.45})`;
      ctx.lineWidth = 0.6;
      ctx.moveTo(x, y);
      ctx.lineTo(x + (0.5 - p.z) * 40 * pull, targetY);
      ctx.stroke();
    }
  }
}

async function boot() {
  const hero = document.querySelector('[data-hero]');
  const canvas = document.querySelector('[data-canvas]');
  if (!hero || !canvas) return;

  const reason = shouldUseStaticFallback();
  if (reason) {
    hero.dataset.motion = 'static';
    hero.dataset.fallback = reason;
    return;
  }

  hero.dataset.motion = 'preloading';
  const bar = document.querySelector('[data-loader-bar]');
  if (bar) bar.style.setProperty('--progress', '0.15');

  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) {
    hero.dataset.motion = 'static';
    hero.dataset.fallback = 'no-canvas';
    return;
  }

  const dpr = clamp(window.devicePixelRatio || 1, 1, CONFIG.motion.maxDpr ?? 2);
  let width = 0;
  let height = 0;
  let particles = [];

  const resize = () => {
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    particles = createParticles(CONFIG.motion.particleCount ?? 220, width, height);
  };
  resize();

  if (bar) bar.style.setProperty('--progress', '1');

  const state = { progress: 0 };
  paintParticles(ctx, particles, 0, width, height);
  canvas.classList.add('is-ready');
  hero.dataset.motion = 'ready';

  const lenis = new Lenis({
    duration: CONFIG.motion.lenisDuration ?? 1.1,
    smoothWheel: true,
  });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  ScrollTrigger.create({
    trigger: hero,
    start: 'top top',
    end: () => `+=${window.innerHeight * (CONFIG.motion.scrollLengthVh ?? 3.2)}`,
    pin: true,
    scrub: CONFIG.motion.scrub ?? 0.55,
    onUpdate: (self) => {
      state.progress = self.progress;
      paintParticles(ctx, particles, state.progress, width, height);
    },
  });

  window.addEventListener('resize', () => {
    resize();
    paintParticles(ctx, particles, state.progress, width, height);
    ScrollTrigger.refresh();
  });
}

boot().catch((error) => {
  console.error('[ledgerline particles]', error);
  const hero = document.querySelector('[data-hero]');
  if (hero) {
    hero.dataset.motion = 'static';
    hero.dataset.fallback = 'boot-failed';
  }
});
