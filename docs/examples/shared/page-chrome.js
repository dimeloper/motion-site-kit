/**
 * Page chrome shared by the WebGL examples: loader numerals, reveals, the
 * mobile menu dialog and in-page anchors. None of it drives the hero scene.
 */

import { lockScroll, scrollToTarget, targetFor, wireInPageAnchors } from './smooth-scroll.js';

const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Mirror the loader bar's --progress into a three-digit counter while preloading. */
function syncLoaderCount() {
  const bar = document.querySelector('[data-loader-bar]');
  const count = document.querySelector('[data-loader-count]');
  if (!bar || !count) return;
  const tick = () => {
    if (!document.contains(bar)) return;
    const n = Math.round(Number.parseFloat(getComputedStyle(bar).getPropertyValue('--progress') || '0') * 100);
    count.textContent = String(Number.isFinite(n) ? n : 0).padStart(3, '0');
    if (document.querySelector('[data-hero]')?.dataset.motion === 'preloading') requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

function watchHero() {
  const hero = document.querySelector('[data-hero]');
  if (!hero) return;
  new MutationObserver(() => {
    if (hero.dataset.motion === 'preloading') syncLoaderCount();
  }).observe(hero, { attributes: true, attributeFilter: ['data-motion'] });
  if (hero.dataset.motion === 'preloading') syncLoaderCount();
}

/** Add .is-in to .reveal elements as they enter; immediately under reduced motion. */
export function revealOnView(threshold = 0.18) {
  const nodes = document.querySelectorAll('.reveal');
  if (!nodes.length) return;
  if (reducedMotion()) {
    nodes.forEach((node) => node.classList.add('is-in'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-in');
      io.unobserve(entry.target);
    }
  }, { threshold });
  nodes.forEach((node) => io.observe(node));
}

/** The only renderer for the menu's link list, built from nodes so labels stay text. */
function renderMobileNav(list, items) {
  if (!list || list.children.length) return;
  items.forEach((item, index) => {
    const idx = document.createElement('span');
    idx.className = 'nav-menu__idx';
    idx.textContent = String(index + 1).padStart(2, '0');
    const label = document.createElement('span');
    label.className = 'nav-menu__label';
    label.textContent = item.label;
    const a = document.createElement('a');
    a.href = item.href;
    a.append(idx, label);
    const li = document.createElement('li');
    li.append(a);
    list.append(li);
  });
}

function initMenu(items) {
  const menu = document.querySelector('[data-nav-menu]');
  const openBtn = document.querySelector('[data-menu-open]');
  const closeBtn = document.querySelector('[data-menu-close]');
  if (!menu || !openBtn) return;
  const list = menu.querySelector('[data-nav-mobile]');
  renderMobileNav(list, items);

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
    renderMobileNav(list, items);
    lastFocus = document.activeElement;
    menu.hidden = false;
    menu.classList.remove('is-leaving');
    openBtn.setAttribute('aria-expanded', 'true');
    lockScroll(true);
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
    lockScroll(false);
    const restoreFocus = () => {
      (lastFocus instanceof HTMLElement ? lastFocus : openBtn).focus();
      lastFocus = null;
    };
    if (reducedMotion()) {
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
    timer = setTimeout(finish, 420);
  };

  openBtn.addEventListener('click', open);
  closeBtn?.addEventListener('click', close);
  menu.addEventListener('keydown', trapFocus);
  // Menu links close the dialog first, then scroll once the lock is released.
  menu.addEventListener('click', (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;
    event.preventDefault();
    const target = targetFor(link);
    close();
    if (target) setTimeout(() => scrollToTarget(target), reducedMotion() ? 0 : 280);
  });
  addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !menu.hidden) close();
  });
}

/** Wire every shared piece of chrome. `nav` is the example's CONFIG.nav list. */
export function initPageChrome({ nav = [], revealThreshold } = {}) {
  watchHero();
  if (revealThreshold !== null) revealOnView(revealThreshold);
  initMenu(nav);
  wireInPageAnchors();
}
