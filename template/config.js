/**
 * The only file you edit per project.
 *
 * Copy, colors, fonts, and section order live here. src/motion.js is the engine
 * and stays byte-identical across builds — that is what makes the second site a
 * reskin rather than a rebuild.
 */

export const CONFIG = {
  brand: {
    name: 'Acme',
    // Primary drives the accent, the glow behind the canvas, and the CTA.
    primary: '#0B5FFF',
    ink: '#0A0A0B',
    paper: '#FFFFFF',
    // Any Google Font family name, or a local @font-face you add in styles.css.
    displayFont: '"Instrument Serif", Georgia, serif',
    bodyFont: '"Inter", system-ui, -apple-system, sans-serif',
  },

  hero: {
    eyebrow: 'Introducing',
    headline: 'The thing you are selling',
    // One sentence. If it needs two, the headline is not doing its job.
    sub: 'Say what it does and who it is for, without adjectives.',
    cta: { label: 'Book a demo', href: '#cta' },
    // Screen-reader description of what the animation shows. Required — the
    // canvas is aria-hidden, so this is the only description that exists.
    animationDescription:
      'The product rotates slowly against a lit backdrop, revealing its side profile and rear panel.',
  },

  sections: [
    {
      id: 'what',
      kicker: 'What it is',
      title: 'A claim a skeptic would accept',
      body: 'Two or three sentences. Concrete. No superlatives.',
    },
    {
      id: 'proof',
      kicker: 'Proof',
      title: 'The number that makes it credible',
      body: 'A measurement, a named customer, or a guarantee. Something falsifiable.',
    },
  ],

  cta: {
    title: 'The one action this page exists to cause',
    body: 'Restate the offer in a sentence.',
    label: 'Book a demo',
    href: 'https://example.com/demo',
  },

  /**
   * Engine parameters. Defaults are tuned; change them only with a reason.
   */
  motion: {
    framesBase: '/frames',

    // Screen heights of scroll to play the sequence once. 3-4 is the usable
    // range: below 2 it flies past, above 5 the page feels stuck.
    scrollLengthVh: 3.5,

    // Seconds of catch-up between scroll and canvas. Hides the discrete frame
    // steps on a flung scroll. `true` (rigid) exposes them.
    scrub: 0.5,

    // Glide. Above ~1.4 reads as laggy on trackpads.
    lenisDuration: 1.1,

    // Parallel frame fetches. All 120 at once saturates the connection and
    // delays the frames the visitor sees first.
    concurrency: 8,

    // A 3x phone display asking for the 1600 rung triples the download to
    // resolve detail invisible at arm's length.
    maxDpr: 2,
  },
};
