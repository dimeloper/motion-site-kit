/**
 * Binds config.js into the markup and applies brand tokens as CSS custom
 * properties. Small on purpose — this exists so config.js is the only file that
 * changes per project, not so the template becomes a framework.
 */

import { CONFIG } from '../config.js';

const get = (path, source = CONFIG) =>
  path.split('.').reduce((value, key) => (value == null ? value : value[key]), source);

function applyBrand() {
  const { brand } = CONFIG;
  const style = document.documentElement.style;
  style.setProperty('--brand-primary', brand.primary);
  style.setProperty('--brand-ink', brand.ink);
  style.setProperty('--brand-paper', brand.paper);
  style.setProperty('--font-display', brand.displayFont);
  style.setProperty('--font-body', brand.bodyFont);
  document.title = `${brand.name} — ${CONFIG.hero.headline}`;
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
    .map(
      (section) => `
      <section class="panel" id="${section.id}">
        <div class="panel__card">
          <p class="panel__kicker">${section.kicker}</p>
          <h2 class="panel__title">${section.title}</h2>
          <p class="panel__body">${section.body}</p>
        </div>
      </section>`,
    )
    .join('');
}

applyBrand();
bindText();
renderSections();
