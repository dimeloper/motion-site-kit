/**
 * Halo page chrome: loader numerals, menu, in-page anchors.
 */

import { CONFIG } from '../config.js?v=11';

function syncLoaderCount() {
  const bar = document.querySelector('[data-loader-bar]');
  const count = document.querySelector('[data-loader-count]');
  if (!bar || !count) return;

  const tick = () => {
    if (!document.contains(bar)) return;
    const raw = getComputedStyle(bar).getPropertyValue('--progress');
    const n = Math.round(Number.parseFloat(raw || '0') * 100);
    count.textContent = String(Number.isFinite(n) ? n : 0).padStart(3, '0');
    if (document.querySelector('[data-hero]')?.dataset.motion === 'preloading') {
      requestAnimationFrame(tick);
    }
  };
  requestAnimationFrame(tick);
}

function watchHero() {
  const hero = document.querySelector('[data-hero]');
  if (!hero) return;
  const observer = new MutationObserver(() => {
    if (hero.dataset.motion === 'preloading') syncLoaderCount();
  });
  observer.observe(hero, { attributes: true, attributeFilter: ['data-motion'] });
  if (hero.dataset.motion === 'preloading') syncLoaderCount();
}

function scrollToHash(hash) {
  if (!hash || hash.length < 2) return false;
  const target = document.querySelector(hash);
  if (!target) return false;
  const lenis = window.__haloLenis;
  if (lenis) lenis.scrollTo(target, { offset: -8 });
  else target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  return true;
}

function ensureMobileNav(list) {
  if (!list || list.children.length) return;
  (CONFIG.nav || []).forEach((item, index) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = item.href;
    const idx = document.createElement('span');
    idx.className = 'nav-menu__idx';
    idx.textContent = String(index + 1).padStart(2, '0');
    const label = document.createElement('span');
    label.className = 'nav-menu__label';
    label.textContent = item.label;
    a.append(idx, label);
    li.appendChild(a);
    list.appendChild(li);
  });
}

function initMenu() {
  const menu = document.querySelector('[data-nav-menu]');
  const openBtn = document.querySelector('[data-menu-open]');
  const closeBtn = document.querySelector('[data-menu-close]');
  const list = menu?.querySelector('[data-nav-mobile]');
  if (!menu || !openBtn) return;

  ensureMobileNav(list);

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let closing = false;
  let revision = 0;
  let lastFocus = null;

  const focusables = () =>
    [...menu.querySelectorAll('a[href], button:not([disabled])')].filter(
      (el) => !el.hasAttribute('hidden') && el.getClientRects().length,
    );

  const trapFocus = (event) => {
    if (event.key !== 'Tab' || menu.hidden) return;
    const nodes = focusables();
    if (!nodes.length) return;
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const open = () => {
    if (closing || !menu.hidden) return;
    const opening = ++revision;
    ensureMobileNav(list);
    lastFocus = document.activeElement;
    menu.hidden = false;
    menu.classList.remove('is-leaving');
    openBtn.setAttribute('aria-expanded', 'true');
    document.documentElement.style.overflow = 'hidden';
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (opening !== revision || menu.hidden || closing) return;
        menu.classList.add('is-open');
        (closeBtn || focusables()[0])?.focus();
      });
    });
  };

  const close = () => {
    if (menu.hidden || closing) return;
    revision++;
    openBtn.setAttribute('aria-expanded', 'false');
    document.documentElement.style.overflow = '';

    const restoreFocus = () => {
      (lastFocus instanceof HTMLElement ? lastFocus : openBtn).focus();
      lastFocus = null;
    };

    if (reduceMotion.matches) {
      menu.classList.remove('is-open');
      menu.hidden = true;
      restoreFocus();
      return;
    }

    closing = true;
    menu.classList.remove('is-open');
    menu.classList.add('is-leaving');

    let finished = false;
    let timer;
    const finish = () => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      menu.removeEventListener('transitionend', onTransitionEnd);
      menu.hidden = true;
      menu.classList.remove('is-leaving');
      closing = false;
      restoreFocus();
    };
    const onTransitionEnd = (event) => {
      if (event.target === menu && event.propertyName === 'opacity') finish();
    };
    menu.addEventListener('transitionend', onTransitionEnd);
    timer = window.setTimeout(finish, 420);
  };

  openBtn.addEventListener('click', open);
  closeBtn?.addEventListener('click', close);
  menu.addEventListener('keydown', trapFocus);
  menu.addEventListener('click', (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;
    const hash = link.getAttribute('href');
    event.preventDefault();
    close();
    window.setTimeout(() => scrollToHash(hash), reduceMotion.matches ? 0 : 280);
  });
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !menu.hidden) close();
  });
}

function initInPageAnchors() {
  document.addEventListener(
    'click',
    (event) => {
      if (window.__haloLenis) return;
      const link = event.target.closest('a[href^="#"]');
      if (!link || link.closest('[data-nav-menu]')) return;
      const hash = link.getAttribute('href');
      if (!hash || hash.length < 2) return;
      if (!document.querySelector(hash)) return;
      event.preventDefault();
      scrollToHash(hash);
    },
    { capture: true },
  );
}

watchHero();
initMenu();
initInPageAnchors();
