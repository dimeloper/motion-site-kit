/**
 * The one Lenis instance a page owns, plus the scroll lock and in-page anchors
 * that must agree with it.
 *
 * Lenis moves the page with window.scrollTo on every wheel event, so hiding the
 * root's overflow does not stop it (it only honours that with autoToggle). A
 * modal has to call lenis.stop(). Keeping the instance here, rather than on a
 * window global per brand, lets the menu lock scrolling whether the hero has
 * started Lenis yet or not.
 */

import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

let current = null;
let locked = false;

/** Start Lenis on GSAP's ticker. Returns a stop function the hero lifecycle owns. */
export function startSmoothScroll(duration) {
  const lenis = new Lenis({ duration, smoothWheel: true, syncTouch: false });
  // One RAF loop, not two. Independent loops desynchronize and the canvas
  // trails the page by a frame.
  lenis.on('scroll', ScrollTrigger.update);
  const tick = (time) => lenis.raf(time * 1000);
  gsap.ticker.add(tick);
  // Default lag smoothing jumps the timeline after a stall, which shows as a
  // skipped frame right after loading finishes.
  gsap.ticker.lagSmoothing(0);
  current = lenis;
  if (locked) lenis.stop();
  return () => {
    gsap.ticker.remove(tick);
    if (current === lenis) current = null;
    lenis.destroy();
  };
}

/** Stop wheel, touch and keyboard scrolling while a modal is open. */
export function lockScroll(value) {
  locked = value;
  document.documentElement.style.overflow = value ? 'hidden' : '';
  if (value) current?.stop();
  else current?.start();
}

export function scrollToTarget(target) {
  if (current) {
    current.scrollTo(target, { offset: -8 });
    return;
  }
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
}

function targetFor(link) {
  const hash = link.getAttribute('href');
  if (!hash || hash.length < 2) return null;
  return document.getElementById(decodeURIComponent(hash.slice(1)));
}

/**
 * One capture listener for every in-page link outside the menu, so a click
 * scrolls exactly once with or without Lenis. Menu links are left to the menu,
 * which closes first and then calls scrollToTarget.
 */
export function wireInPageAnchors() {
  document.addEventListener('click', (event) => {
    const link = event.target.closest?.('a[href^="#"]');
    if (!link || link.closest('[data-nav-menu]')) return;
    const target = targetFor(link);
    if (!target) return;
    event.preventDefault();
    scrollToTarget(target);
  }, { capture: true });
}

export { targetFor };
