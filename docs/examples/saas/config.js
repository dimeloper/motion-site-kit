/**
 * Ledgerline — SaaS demo.
 * Motion: scroll-driven particle field (not orbit / frame scrub).
 * Copy and section order live here.
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
    cta: { label: 'How the close works', href: '#capabilities' },
    animationDescription:
      'As you scroll, a field of particles densifies into a clear signal band — presence reading as motion, not a product spin.',
  },

  capabilities: {
    title: 'What we do best',
    items: [
      {
        num: '01',
        title: 'Close checklist',
        body: 'Owners, due dates, and source systems in one place across every entity.',
        href: '#proof',
      },
      {
        num: '02',
        title: 'Blocker radar',
        body: 'See what is stuck on Tuesday — not on the last Friday of the month.',
        href: '#proof',
      },
      {
        num: '03',
        title: 'Entity rollup',
        body: 'Subsidiaries and currency notes without another status meeting.',
        href: '#proof',
      },
      {
        num: '04',
        title: 'Walkthrough',
        body: 'Map your existing close onto Ledgerline in thirty minutes.',
        href: '#cta',
      },
    ],
  },

  stats: {
    kicker: 'By the numbers',
    items: [
      { value: '19+', label: 'Entities in one close' },
      { value: '11%', label: 'Fewer status meetings' },
      { value: '1', label: 'Checklist to run' },
    ],
  },

  sections: [
    {
      id: 'proof',
      kicker: 'Built for stacks you already have',
      title: 'It sits on top of the ledger you use today.',
      body: 'Ledgerline does not replace your GL. The first close you run in it is the one you were going to run anyway — with fewer war-room slides.',
    },
  ],

  cta: {
    title: 'Run next month-end in one place',
    body: 'Bring the close checklist. We will map it onto Ledgerline in a 30-minute walkthrough.',
    label: 'Book a walkthrough',
    href: 'https://example.com/demo',
  },

  motion: {
    engine: 'particles',
    scrollLengthVh: 3.2,
    scrub: 0.55,
    lenisDuration: 1.1,
    particleCount: 220,
    maxDpr: 2,
  },
};
