/** Complete content briefs. Image paths are relative to the kit preview page. */
const image = (src, alt, width = 1600, height = 1200) => ({ src, alt, width, height });
const loaf = image('../examples/local/images/loaf.webp', 'A flour-dusted sourdough loaf');
const bread = image('../examples/local/images/board.webp', 'Sliced bread with jam', 1600, 2000);
const ring = image('../examples/saas/images/lock.jpg', 'A titanium ring', 1600, 900);
const pillar = image('../examples/commerce/images/pillar.jpg', 'A limestone pillar', 1200, 1600);
const silver = image('../examples/vgpu/demo/poster.png', 'Fold in silver', 1200, 900);
const gold = image('../examples/vgpu/demo/poster-champagne.png', 'Fold in champagne', 1200, 900);
const project = (title, discipline, src, href, body) => ({ title, discipline, image: image(src, `${title} website preview`), href, body });
export const RECIPES = {
  studio: {
    name: 'Studio portfolio', brand: 'Halo', label: 'Independent digital studies',
    headline: 'Objects, made into experiences.',
    body: 'A collection of websites exploring food, wearable objects and sculptural materials.',
    image: pillar, action: 'Explore the studies',
    page: { kind: 'studio', order: ['projects', 'chapters', 'invite'], content: {
      projectsHeadline: 'Selected studies',
      projects: [
        project('Harbor Oven', 'Hospitality · 2026', '../assets/harbor-preview.webp', '../examples/local/', 'Bread, a short lunch and a loaf that turns with the scroll.'),
        project('Vortex', 'Product · 2026', '../assets/vortex-preview.webp', '../examples/saas/', 'An opening titanium band, built as a procedural CAD scene.'),
        project('Altar', 'Material · 2026', '../assets/halo-preview.webp', '../examples/commerce/', 'Stone and suspended light. A study in weight and contrast.'),
      ],
      chaptersHeadline: 'A closer look', chapters: [
        { title: 'Start with texture', body: 'The loaf carries flour, cuts and an irregular crust. Those details give the movement something to reveal.', image: loaf },
        { title: 'Give motion a purpose', body: 'The band opens to expose its construction, then closes when the reader returns to the top.', image: ring },
      ],
      invite: { line: 'Make a study of your own.', cta: { label: 'Open the kit', href: '../index.html#start' } },
    } },
  },
  product: {
    name: 'Product launch', brand: 'Vortex', label: 'Titanium / wearable study',
    headline: 'A closer look at the band.', body: 'Explore the shape, construction and finish of a small object worn every day.', image: ring, action: 'Inside the design',
    page: { kind: 'product', order: ['chapters', 'expansion', 'invite'], content: {
      chaptersHeadline: 'Built around a circle', chapters: [
        { title: 'The outer shell', body: 'A continuous titanium surface catches a narrow strip of light.', image: ring },
        { title: 'The working model', body: 'Open the live example to see the band separate and seat again.', image: image('../assets/vortex-preview.webp', 'Vortex live example') },
      ],
      expansion: { headline: 'The object in context', image: image('../assets/vortex-preview.webp', 'Vortex product page'), caption: 'Vortex / interactive product study' },
      invite: { line: 'Explore the moving band.', cta: { label: 'Open Vortex', href: '../examples/saas/' } },
    } },
  },
  hospitality: {
    name: 'Hospitality', brand: 'Harbor Oven', label: 'Bread / a short lunch / coffee',
    headline: 'Something good for the table.', body: 'A bakery study built around the morning loaf and a simple lunch.', image: bread, action: 'See what is on the table',
    page: { kind: 'hospitality', order: ['featured', 'pair', 'quote', 'invite'], content: {
      featured: { headline: 'From the oven', title: 'Country loaf', body: 'A flour-dusted crust and an open crumb.', image: loaf },
      stillsHeadline: 'Bread and company', stills: [{ title: 'Whole', body: 'The morning loaf.', image: loaf }, { title: 'Shared', body: 'Cut thick, with jam.', image: bread }],
      quote: { text: 'Bread in the morning. Soup by noon.', by: 'Harbor Oven / concept website' },
      invite: { line: 'Step inside Harbor Oven.', cta: { label: 'Visit the example', href: '../examples/local/' } },
    } },
  },
  exhibition: {
    name: 'Material exhibition', brand: 'Fold', label: 'Form study / 01',
    headline: 'A sheet in three finishes.', body: 'The same folds, lit from the same position. Change the surface and watch the light change with it.', image: silver, action: 'Compare the finishes',
    page: { kind: 'exhibition', order: ['comparison', 'expansion', 'invite'], content: {
      comparison: { headline: 'Silver meets champagne', before: { label: 'Silver', image: silver }, after: { label: 'Champagne', image: gold } },
      expansion: { headline: 'Follow the fold', image: gold, caption: 'Champagne / a warmer reflection' },
      invite: { line: 'Set the surface in motion.', cta: { label: 'Open Fold', href: '../examples/vgpu/demo/' } },
    } },
  },
};
