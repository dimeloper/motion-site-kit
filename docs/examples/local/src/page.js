/**
 * Harbor-only page motion: loader numerals, clock, card carousel, menu, reveals.
 * Does not drive the frame sequence.
 */

import { CONFIG } from '../config.js';

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

function revealOnView() {
  const nodes = document.querySelectorAll('.reveal');
  if (!nodes.length) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    nodes.forEach((node) => node.classList.add('is-in'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-in');
      io.unobserve(entry.target);
    }
  }, { threshold: 0.18 });
  nodes.forEach((node) => io.observe(node));
}

function formatTime(date) {
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const meridiem = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12 || 12;
  return `${hours}:${minutes}${meridiem}`;
}

function formatDate(date) {
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function initClock() {
  const timeNode = document.querySelector('[data-clock-time]');
  const dateNode = document.querySelector('[data-clock-date]');
  if (!timeNode || !dateNode) return;

  const tick = () => {
    const now = new Date();
    timeNode.textContent = formatTime(now);
    dateNode.textContent = formatDate(now);
  };
  tick();
  window.setInterval(tick, 1000);
}

function initCard() {
  const cards = CONFIG.cards || [];
  if (!cards.length) return;

  const image = document.querySelector('[data-card-image]');
  const caption = document.querySelector('[data-card-caption]');
  const title = document.querySelector('[data-card-title]');
  const note = document.querySelector('[data-card-note]');
  const dots = document.querySelector('[data-card-dots]');
  const prev = document.querySelector('[data-card-prev]');
  const next = document.querySelector('[data-card-next]');
  if (!image || !caption || !title || !note || !dots) return;

  let index = 0;
  dots.innerHTML = cards.map(() => '<span></span>').join('');
  const dotNodes = [...dots.querySelectorAll('span')];

  const paint = () => {
    const card = cards[index];
    image.src = card.image;
    image.alt = card.alt || '';
    caption.textContent = card.caption;
    title.textContent = card.title;
    note.textContent = card.note;
    dotNodes.forEach((dot, i) => dot.classList.toggle('is-active', i === index));
  };

  const step = (delta) => {
    index = (index + delta + cards.length) % cards.length;
    paint();
  };

  prev?.addEventListener('click', (event) => {
    event.stopPropagation();
    step(-1);
  });
  next?.addEventListener('click', (event) => {
    event.stopPropagation();
    step(1);
  });
  document.querySelector('[data-card]')?.addEventListener('click', (event) => {
    if (event.target.closest('button')) return;
    step(1);
  });

  paint();
}

function scrollToHash(hash) {
  if (!hash || hash.length < 2) return false;
  const target = document.querySelector(hash);
  if (!target) return false;
  const lenis = window.__harborLenis;
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
    a.innerHTML = `<span class="nav-menu__idx">${String(index + 1).padStart(2, '0')}</span><span class="nav-menu__label">${item.label}</span>`;
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

/** Fallback when motion.js hasn't attached Lenis yet (or static hero). */
function initInPageAnchors() {
  document.addEventListener(
    'click',
    (event) => {
      if (window.__harborLenis) return; // motion.js owns Lenis-aware scroll
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
revealOnView();
initClock();
initCard();
initMenu();
initInPageAnchors();
