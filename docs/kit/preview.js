import { RECIPES } from './recipes.js';
import { compose, planPage } from './compose.js?v=11';
const key = new URLSearchParams(location.search).get('recipe') || 'studio';
const recipe = RECIPES[key] || RECIPES.studio;
document.body.dataset.recipe = RECIPES[key] ? key : 'studio';
document.title = `${recipe.name} — Motion site kit`;
for (const field of ['brand', 'label', 'headline', 'body', 'action']) document.querySelector(`[data-${field}]`).textContent = recipe[field];
const image = document.querySelector('[data-image]');
Object.assign(image, recipe.image); image.loading = 'eager';
if (document.body.dataset.recipe === 'product') {
  const media = document.createElement('div');
  media.className = 'recipe-product-media';
  image.replaceWith(media); media.append(image);
}
compose(document.querySelector('[data-kit]'), planPage(recipe.page));
