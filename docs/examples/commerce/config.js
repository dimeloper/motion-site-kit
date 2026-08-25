/**
 * Single-product commerce demo, GitHub Pages copy. Own frame ladder under ./frames.
 * Only this file differs from the other two reskins — plus its sequence.
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
    cta: { label: 'See the spec', href: '#what' },
    animationDescription:
      'A brass D-ring and nylon strap in a black studio: the hardware pulls away as you scroll, then seats itself again.',
  },

  sections: [
    {
      id: 'what',
      kicker: 'What you get',
      title: 'Fits under the seat, including the jacket',
      body: 'The shell is 1050D nylon. The base is a replaceable skid plate. There is a dedicated 16-inch laptop sleeve that loads from the outside, so you do not unpack the trip to get through security.',
    },
    {
      id: 'proof',
      kicker: '',
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
    framesBase: 'frames',
    scrollLengthVh: 3.5,
    scrub: 0.5,
    lenisDuration: 1.1,
    concurrency: 8,
    maxDpr: 2,
  },
};
