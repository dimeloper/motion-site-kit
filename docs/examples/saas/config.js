/**
 * SaaS demo, GitHub Pages copy. Own frame ladder under ./frames.
 * Only this file differs from the other two reskins — plus its sequence.
 */

export const CONFIG = {
  brand: {
    name: 'Ledgerline',
    primary: '#6EA0FF',
    ink: '#000000',
    paper: '#EDE8DF',
    displayFont: '"Instrument Serif", Georgia, serif',
    bodyFont: '"IBM Plex Sans", system-ui, -apple-system, sans-serif',
  },

  hero: {
    eyebrow: 'For finance teams',
    headline: 'Close the books without the war room.',
    sub: 'Ledgerline pulls every entity into one close checklist, with owners and blockers visible before month-end.',
    cta: { label: 'How the close works', href: '#what' },
    animationDescription:
      'Three transmissive glass plates with a gold edge lift apart in a black studio as you scroll, then seat themselves again.',
  },

  sections: [
    {
      id: 'what',
      kicker: 'What it does',
      title: 'One checklist across every entity',
      body: 'Each close task has an owner, a due date, and the system it came from. You see what is blocked on Tuesday, not on the last Friday of the month.',
    },
    {
      id: 'proof',
      kicker: '',
      title: 'Built for teams that already have a stack',
      body: 'Ledgerline sits on top of the ledger you use today. It does not replace it. The first close you run in it is the one you were going to run anyway, with fewer status meetings.',
    },
  ],

  cta: {
    title: 'Run next month-end in one place',
    body: 'Bring the close checklist. We will map it onto Ledgerline in a 30-minute walkthrough.',
    label: 'Book a walkthrough',
    href: 'https://example.com/demo',
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
