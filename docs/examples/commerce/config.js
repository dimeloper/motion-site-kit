/**
 * Halo studio. Page composes from docs/kit/.
 * Content, not types: planPage() picks families from this brief.
 * Motion: rings lift off a textured stone and seat on reverse.
 */

export const CONFIG = {
  brand: {
    name: 'Halo',
    primary: '#e4c56a',
    ink: '#eceae6',
    paper: '#0c0d10',
    displayFont: 'Syne, Avenir Next, sans-serif',
    bodyFont: 'Figtree, system-ui, sans-serif',
  },

  nav: [
    { label: 'Work', href: '#projects' },
    { label: 'Studio', href: '#chapters' },
    { label: 'The kit', href: '#invite' },
  ],

  hero: {
    headline: 'Objects in motion.',
    sub: 'Independent website studies in food, wearable objects and sculptural materials.',
    cta: { label: 'Explore the studies', href: '#projects' },
    secondary: { label: 'Inside Altar', href: '#chapters' },
    animationDescription:
      'As you scroll, two rings of light lift off a stone pillar and hang in the dark. Scroll back and they seat again.',
    statusLeft: 'Stone at rest',
    statusCenter: 'Scroll to lift',
    statusRight: 'Rings seat',
  },

  page: {
    kind: 'studio',
    order: ['projects', 'chapters', 'expansion', 'invite'],
    content: {
      projectsHeadline: 'Selected studies',
      projects: [
        { title: 'Harbor Oven', discipline: 'Hospitality / WebGL', body: 'A bakery website with a flour-dusted loaf at its centre.', image: { src: '../../assets/harbor-preview.webp', alt: 'Harbor Oven website', width: 1440, height: 1000 }, href: '../local/' },
        { title: 'Vortex', discipline: 'Product / WebGL', body: 'A titanium band opens to reveal its construction.', image: { src: '../../assets/vortex-preview.webp', alt: 'Vortex website', width: 1440, height: 1000 }, href: '../saas/' },
        { title: 'Fold', discipline: 'Material / WebGPU', body: 'A thin sheet, shaped by scroll and reflected light.', image: { src: '../vgpu/demo/poster.png', alt: 'Silver Fold sculpture', width: 1200, height: 900 }, href: '../vgpu/demo/' },
      ],
      chaptersHeadline: 'Inside Altar',
      chapters: [
        { title: 'Weight', body: 'The limestone stays grounded. Its rough surface gives the scene a fixed point while the light moves above it.', image: { src: 'images/pillar.jpg', alt: 'Weathered limestone pillar', width: 1200, height: 1600 } },
        { title: 'Surface', body: 'Close up, the stone breaks into pores and uneven edges. Side lighting keeps that texture visible.', image: { src: 'images/grain.jpg', alt: 'Close view of limestone texture', width: 1200, height: 1600 } },
        { title: 'Context', body: 'The table study brings the object back to a familiar scale, alongside a rolled print and material samples.', image: { src: 'images/table.jpg', alt: 'Stone sample and rolled print on a studio table', width: 1600, height: 1200 } },
      ],
      expansion: { headline: 'From the studio table', image: { src: 'images/table.jpg', alt: 'Material study on a studio table', width: 1600, height: 1200 }, caption: 'Altar / original material study, 2026' },
      invite: { line: 'Build a study of your own.', cta: { label: 'Start with the kit', href: '../../index.html#start' } },
    },
  },

  footer: {
    credit: 'Halo / Independent studies from Motion site kit.',
  },

  motion: {
    engine: 'webgl',
    modelUrl: 'models/pillar.glb',
    scrollLengthVh: 3.2,
    scrub: 0.6,
    maxDpr: 2,
    lenisDuration: 1.1,
  },
};
