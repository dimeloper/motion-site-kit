/**
 * Vortex page chrome binders — modules list, builds cards, footer.
 * Scene playback stays in motion.js / scene.js.
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

function renderTrusted() {
  renderList('[data-trusted]', CONFIG.trusted?.names, (name) => `<li>${name}</li>`);
}

function renderStats() {
  renderList(
    '[data-stats]',
    CONFIG.stats?.items,
    (item) =>
      `<li class="hero__stat"><span class="hero__stat-value">${item.value}</span><span class="hero__stat-label">${item.label}</span></li>`,
  );
}

function renderTags() {
  renderList(
    '[data-tags]',
    CONFIG.tags,
    (label) => `<li><span class="tag">${label}</span></li>`,
  );
}

function renderModules() {
  renderList(
    '[data-modules]',
    CONFIG.modules?.items,
    (item) =>
      `<li class="modules__item reveal">
        <a class="modules__link" href="${item.href}">
          <span class="modules__num">${item.num}</span>
          <span class="modules__text">
            <span class="modules__title">${item.title}</span>
            <span class="modules__body">${item.body}</span>
          </span>
          <span class="modules__go" aria-hidden="true">→</span>
        </a>
      </li>`,
  );
}

function renderFeelPills() {
  renderList(
    '[data-feel-pills]',
    CONFIG.feel?.pills,
    (label) => `<li><span class="tag tag--on-paper">${label}</span></li>`,
  );
}

function renderBuilds() {
  renderList('[data-builds]', CONFIG.builds?.items, (item) => {
    if (item.tone === 'photo') {
      return `<article class="build-card build-card--photo reveal">
        <img src="${item.image}" alt="" width="800" height="1000" loading="lazy" />
        <div class="build-card__overlay">
          <span class="build-card__num">${item.num}</span>
          <h3>${item.title}</h3>
          <p>${item.body}</p>
          <span class="build-card__cta">${item.cta || 'Material study'}</span>
        </div>
      </article>`;
    }
    if (item.tone === 'ink') {
      return `<article class="build-card build-card--ink reveal">
        <span class="build-card__num">${item.num}</span>
        <h3>${item.title}</h3>
        <p>${item.body}</p>
        <span class="build-card__cta">${item.cta || 'Material study'}</span>
      </article>`;
    }
    const links = (item.links || [])
      .map((label) => `<li><span>${label}</span></li>`)
      .join('');
    return `<article class="build-card build-card--paper reveal">
      <span class="build-card__num">${item.num}</span>
      <h3>${item.title}</h3>
      <p>${item.body}</p>
      <ul class="build-card__links">${links}</ul>
    </article>`;
  });
}

function renderFooter() {
  renderList(
    '[data-footer-links]',
    CONFIG.footer?.links,
    (item) => `<li><a href="${item.href}">${item.label}</a></li>`,
  );
  const socialHtml = (item) => `<li><a href="${item.href}">${item.label}</a></li>`;
  renderList('[data-footer-social]', CONFIG.footer?.social, socialHtml);
  renderList('[data-menu-social]', CONFIG.footer?.social, socialHtml);
}

loadFonts();
applyBrand();
bindText();
renderNav();
renderTrusted();
renderStats();
renderTags();
renderModules();
renderFeelPills();
renderBuilds();
renderFooter();
