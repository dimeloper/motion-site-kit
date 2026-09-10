import { compose, FAMILIES } from './compose.js?v=10';
import { CATALOG } from './catalog.js?v=10';
const list = document.querySelector('.catalog-families');
const search = document.querySelector('#family-search');
const preview = document.querySelector('[data-kit]');
const title = type => type.replaceAll('-', ' ').replace(/^./, letter => letter.toUpperCase());
let selected;
function choose(type, updateUrl = true) {
  const section = CATALOG.sections.find(item => item.type === type);
  if (!section) return;
  selected = type;
  compose(preview, [section]);
  // Hero specimens sit beneath the catalog's single page title.
  for (const heading of preview.querySelectorAll('h1')) {
    const replacement = document.createElement('h2'); replacement.className = heading.className;
    replacement.textContent = heading.textContent; heading.replaceWith(replacement);
  }
  document.querySelector('[data-preview-title]').textContent = title(type);
  document.querySelector('[data-source]').textContent = JSON.stringify(section, null, 2);
  document.querySelector('[data-copy-status]').textContent = '';
  for (const button of list.querySelectorAll('button')) button.setAttribute('aria-pressed', String(button.dataset.family === selected));
  if (updateUrl) history.replaceState(null, '', `#family=${type}`);
}
for (const [index, type] of FAMILIES.entries()) {
  const button = document.createElement('button'); button.type = 'button'; button.dataset.family = type;
  const number = document.createElement('span'); number.textContent = String(index + 1).padStart(2, '0'); number.setAttribute('aria-hidden', 'true');
  button.append(number, document.createTextNode(title(type))); button.addEventListener('click', () => choose(type)); list.append(button);
}
function filter() {
  let count = 0;
  for (const button of list.children) { button.hidden = !button.textContent.toLowerCase().includes(search.value.toLowerCase()); if (!button.hidden) count++; }
  document.querySelector('.catalog-count').textContent = `${count} ${count === 1 ? 'family' : 'families'}`;
}
search.addEventListener('input', filter); filter();
const initial = decodeURIComponent(location.hash.replace('#family=', ''));
choose(FAMILIES.includes(initial) ? initial : 'featured-work', false);
// Specimen cross-links select their matching family rather than jumping to a missing section.
preview.addEventListener('click', event => {
  const anchor = event.target.closest('a[href^="#"]'); if (!anchor) return;
  const section = CATALOG.sections.find(item => `#${item.id}` === anchor.getAttribute('href'));
  if (section) { event.preventDefault(); choose(section.type); }
});
document.querySelector('[data-copy]').addEventListener('click', async () => {
  const status = document.querySelector('[data-copy-status]');
  try { await navigator.clipboard.writeText(document.querySelector('[data-source]').textContent); status.textContent = 'Section config copied.'; }
  catch { status.textContent = 'Select the config above to copy it.'; }
});
