/**
 * Halo chrome binders. Sections come from the page kit.
 */

import { CONFIG } from '../config.js?v=7';
import { compose, planPage } from '../../../kit/compose.js?v=7';

const SYSTEM_FONTS = new Set([
  'georgia', 'serif', 'sans-serif', 'monospace', 'system-ui',
  'ui-sans-serif', 'ui-serif', 'ui-monospace', '-apple-system',
  'blinkmacsystemfont', 'arial', 'helvetica', 'avenir next',
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
  document.title = brand.name;
  const description = document.querySelector('meta[name="description"]');
  if (description && CONFIG.hero.sub) description.setAttribute('content', CONFIG.hero.sub);
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

function renderNav() {
  const host = document.querySelector('[data-nav]');
  const items = CONFIG.nav || [];
  if (!host) return;
  host.replaceChildren();
  for (const item of items) {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = item.href;
    a.textContent = item.label;
    li.append(a);
    host.append(li);
  }
}

loadFonts();
applyBrand();
bindText();
renderNav();
compose(document.querySelector('[data-kit]'), planPage(CONFIG.page));
