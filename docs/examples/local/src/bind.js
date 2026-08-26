/**
 * Harbor Oven page chrome: nav, board lists, card carousel data.
 * Sequence playback stays in motion.js.
 */

import { CONFIG } from '../config.js';

const SYSTEM_FONTS = new Set([
  'georgia',
  'serif',
  'sans-serif',
  'monospace',
  'system-ui',
  'ui-sans-serif',
  'ui-serif',
  'ui-monospace',
  '-apple-system',
  'blinkmacsystemfont',
  'arial',
  'helvetica',
]);

const get = (path, source = CONFIG) =>
  path.split('.').reduce((value, key) => (value == null ? value : value[key]), source);

function familyName(stack) {
  return (stack || '').split(',')[0].replace(/['"]/g, '').trim();
}

function loadFonts() {
  const families = [CONFIG.brand.displayFont, CONFIG.brand.bodyFont]
    .map(familyName)
    .filter((name, index, all) => name && !SYSTEM_FONTS.has(name.toLowerCase()) && all.indexOf(name) === index);
  if (!families.length) return;
  const params = families
    .map((name) => `family=${encodeURIComponent(name)}:ital,wght@0,400;0,500;0,600;0,700;1,400`)
    .join('&');
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?${params}&display=swap`;
  document.head.appendChild(link);
}

function applyBrand() {
  const { brand } = CONFIG;
  const style = document.documentElement.style;
  style.setProperty('--brand-primary', brand.primary);
  style.setProperty('--brand-ink', brand.ink);
  style.setProperty('--brand-paper', brand.paper);
  style.setProperty('--font-display', brand.displayFont);
  style.setProperty('--font-body', brand.bodyFont);
  document.title = `${brand.name} — ${CONFIG.hero.headline}`;
  const description = document.querySelector('meta[name="description"]');
  if (description) description.setAttribute('content', CONFIG.hero.sub);
}

function bindText() {
  for (const node of document.querySelectorAll('[data-bind]')) {
    const value = get(node.dataset.bind);
    if (value != null) node.textContent = value;
  }
  for (const node of document.querySelectorAll('[data-bind-href]')) {
    const value = get(node.dataset.bindHref);
    if (value != null) node.setAttribute('href', value);
  }
}

function renderList(selector, rows, html) {
  const host = document.querySelector(selector);
  if (!host || !rows?.length) return;
  host.innerHTML = rows.map(html).join('');
}

function renderNav() {
  const items = CONFIG.nav || [];
  renderList(
    '[data-nav]',
    items,
    (item) => `<li><a href="${item.href}">${item.label}</a></li>`,
  );
  renderList(
    '[data-nav-mobile]',
    items,
    (item, index) =>
      `<li><a href="${item.href}"><span class="nav-menu__idx">${String(index + 1).padStart(2, '0')}</span><span class="nav-menu__label">${item.label}</span></a></li>`,
  );
}

function renderBoard() {
  renderList('[data-hours]', CONFIG.board?.hours, (row) =>
    `<li><span>${row.day}</span><span>${row.time}</span></li>`);
  renderList('[data-menu]', CONFIG.board?.items, (row) =>
    `<li><span>${row.name}</span><span>${row.note}</span></li>`);
}

function renderTrusted() {
  renderList('[data-trusted]', CONFIG.trusted?.names, (name) =>
    `<li>${name}</li>`);
}

function renderServices() {
  renderList('[data-services]', CONFIG.services?.items, (item) =>
    `<li class="services__item">
      <a class="services__link" href="${item.href}">
        <span class="services__num">${item.num}</span>
        <span class="services__title">${item.title}</span>
        <span class="services__body">${item.body}</span>
        <span class="services__arrow" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17L17 7M9 7h8v8"/></svg>
        </span>
      </a>
    </li>`);
}

function renderStats() {
  renderList('[data-stats]', CONFIG.stats?.items, (item) =>
    `<li class="stats__item reveal">
      <span class="stats__value">${item.value}</span>
      <span class="stats__label">${item.label}</span>
    </li>`);
}

function renderStudio() {
  const statement = document.querySelector('[data-studio-statement]');
  const studio = CONFIG.studio;
  if (statement && studio?.statement) {
    const accent = studio.accent;
    if (accent && studio.statement.includes(accent)) {
      statement.innerHTML = studio.statement.replace(
        accent,
        `<span class="studio__accent">${accent}</span>`,
      );
    } else {
      statement.textContent = studio.statement;
    }
  }

  renderList('[data-studio-pills]', studio?.pills, (pill) =>
    `<span class="word-pill word-pill--${pill.tone}">${
      pill.tone === 'ink'
        ? `<span class="word-pill__arrow" aria-hidden="true"><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span>`
        : pill.label
    }</span>`);
}

function renderSelected() {
  renderList('[data-selected]', CONFIG.selected?.items, (item) =>
    `<article class="selected__card reveal">
      <figure class="selected__media">
        <img src="${item.image}" alt="${item.alt || ''}" width="800" height="1000" loading="lazy" />
      </figure>
      <div class="selected__meta">
        <h3>${item.title}</h3>
        <p>${item.note}</p>
      </div>
    </article>`);
}

function renderCta() {
  renderList('[data-cta-meta]', CONFIG.cta?.aside?.lines, (row) =>
    `<li><span>${row.k}</span><span>${row.v}</span></li>`);
  renderList('[data-cta-steps]', CONFIG.cta?.steps, (step) =>
    `<li class="cta__step">
      <span class="cta__num">${step.num}</span>
      <div>
        <h3>${step.title}</h3>
        <p>${step.body}</p>
      </div>
    </li>`);
}

loadFonts();
applyBrand();
bindText();
renderNav();
renderBoard();
renderTrusted();
renderServices();
renderStats();
renderStudio();
renderSelected();
renderCta();
