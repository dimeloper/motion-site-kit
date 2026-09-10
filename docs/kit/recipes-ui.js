import { RECIPES } from './recipes.js';
const select = document.querySelector('#recipe-select');
const frame = document.querySelector('#recipe-frame');
for (const [key, recipe] of Object.entries(RECIPES)) {
  const option = document.createElement('option'); option.value = key; option.textContent = recipe.name; select.append(option);
}
function show() {
  frame.src = `preview.html?recipe=${select.value}`;
  frame.title = `${RECIPES[select.value].name} complete composition`;
  document.querySelector('[data-open-recipe]').href = frame.src;
}
select.addEventListener('change', show); show();
for (const button of document.querySelectorAll('[data-preview-width]')) button.addEventListener('click', () => {
  frame.style.width = button.dataset.previewWidth === 'mobile' ? '390px' : '100%';
  document.querySelectorAll('[data-preview-width]').forEach(choice => choice.setAttribute('aria-pressed', String(choice === button)));
});
document.querySelector('[data-copy-recipe]').addEventListener('click', async () => {
  const status = document.querySelector('[data-recipe-status]');
  const text = JSON.stringify(RECIPES[select.value], null, 2);
  document.querySelector('[data-recipe-source]').textContent = text;
  try { await navigator.clipboard.writeText(text); status.textContent = 'Complete recipe copied.'; }
  catch { status.textContent = 'Open the recipe source below to copy it.'; }
});
