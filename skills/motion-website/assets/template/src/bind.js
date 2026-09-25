/**
 * Binds config.js into the markup and applies brand tokens as CSS custom
 * properties. Small on purpose — this exists so config.js is the only file that
 * changes per project, not so the template becomes a framework.
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
    .map((name) => `family=${encodeURIComponent(name)}:ital,wght@0,400;0,600;0,700;1,400`)
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
  document.title = `${brand.name} - ${CONFIG.hero.headline}`;
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

function renderSections() {
  const host = document.querySelector('[data-sections]');
  if (!host) return;
  host.innerHTML = CONFIG.sections
    .map((section) => {
      const kicker = section.kicker
        ? `<p class="panel__kicker">${section.kicker}</p>`
        : '';
      return `
      <section class="panel" id="${section.id}">
        <div class="panel__card">
          ${kicker}
          <h2 class="panel__title">${section.title}</h2>
          <p class="panel__body">${section.body}</p>
        </div>
      </section>`;
    })
    .join('');
}

loadFonts();
applyBrand();
bindText();
renderSections();
