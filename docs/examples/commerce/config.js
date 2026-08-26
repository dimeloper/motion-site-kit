/**
 * Kiln Carry — commerce demo.
 * Motion: layered floating stills on scroll (not orbit / frame scrub).
 */

export const CONFIG = {
  brand: {
    name: 'Kiln Carry',
    primary: '#C45C26',
    ink: '#050403',
    paper: '#EDE6DC',
    displayFont: '"Cormorant Garamond", Georgia, serif',
    bodyFont: 'Figtree, system-ui, -apple-system, sans-serif',
  },

  hero: {
    eyebrow: 'The Weekender',
    headline: 'One bag for a two-night trip.',
    sub: 'A 32-litre carry-on that holds a jacket, two outfits, and a laptop without a second bag.',
    cta: { label: 'See the spec', href: '#spec' },
    animationDescription:
      'As you scroll, product stills drift and layer in space — a floating collage, not a spin or zoom through frames.',
  },

  float: {
    layers: [
      { src: 'frames/960/webp/0012.webp', depth: 0.18, x: '-18%', y: '8%', scale: 0.55, rotate: -8 },
      { src: 'frames/960/webp/0048.webp', depth: 0.42, x: '22%', y: '-6%', scale: 0.48, rotate: 6 },
      { src: 'frames/960/webp/0075.webp', depth: 0.7, x: '4%', y: '18%', scale: 0.72, rotate: -2 },
      { src: 'frames/960/webp/0105.webp', depth: 0.95, x: '-8%', y: '-14%', scale: 0.4, rotate: 10 },
    ],
  },

  spec: {
    title: 'What you get',
    items: [
      {
        num: '01',
        title: 'Under-seat shell',
        body: 'Fits under the seat with the jacket still inside.',
        href: '#proof',
      },
      {
        num: '02',
        title: '1050D nylon',
        body: 'A replaceable skid plate on the base, not a fashion sole.',
        href: '#proof',
      },
      {
        num: '03',
        title: 'External laptop sleeve',
        body: 'Sixteen-inch sleeve loads from the outside at security.',
        href: '#proof',
      },
      {
        num: '04',
        title: '10-year repair ticket',
        body: 'Zipper or plate fails — send it back. We fix the part.',
        href: '#cta',
      },
    ],
  },

  sections: [
    {
      id: 'proof',
      kicker: 'Built to be used',
      title: 'Sold with a 10-year repair ticket',
      body: 'If a zipper or skid plate fails, send it back. We repair or replace the part. The bag is made to be used, not archived.',
    },
  ],

  cta: {
    title: 'The Weekender, in two colours',
    body: 'Charcoal and rust. Same spec. Ships in three days from the workshop.',
    label: 'Order the Weekender',
    href: 'https://example.com/shop',
  },

  motion: {
    engine: 'float',
    scrollLengthVh: 3.0,
    scrub: 0.6,
    lenisDuration: 1.15,
    maxDpr: 2,
  },
};
