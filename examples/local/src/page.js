/**
 * Harbor-only page chrome: the shop clock and the card carousel. Loader,
 * reveals, menu and anchors are shared in ../../shared/page-chrome.js.
 */

import { initPageChrome } from '../../shared/page-chrome.js';
import { CONFIG } from '../config.js';

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
  const dotNodes = cards.map(() => document.createElement('span'));
  dots.replaceChildren(...dotNodes);

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

initPageChrome({ nav: CONFIG.nav });
initClock();
initCard();
