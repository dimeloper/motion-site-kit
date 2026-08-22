/**
 * Docs site for the kit. Same engine as template/; only this file is different.
 * Content is this repo's README, rewritten as a page you can scroll.
 */

export const CONFIG = {
  brand: {
    name: 'motion-site-kit',
    primary: '#3F8F6A',
    ink: '#12150F',
    paper: '#F3F0E8',
    displayFont: 'Syne, system-ui, sans-serif',
    bodyFont: '"IBM Plex Sans", system-ui, -apple-system, sans-serif',
  },

  hero: {
    eyebrow: 'Open source kit',
    headline: 'Ship the sequence. Stay inside 8 MB.',
    sub: 'A Claude skill and a reskinnable template. Extract frames, encode a ladder, fail the build when it gets heavy.',
    cta: { label: 'Read the pipeline', href: '#pipeline' },
    animationDescription:
      'A titanium smartphone with a square camera island comes apart as you scroll: back glass, cameras, board and battery lift, then seat themselves again.',
  },

  sections: [
    {
      id: 'pipeline',
      kicker: 'The cut that matters',
      title: '120 frames, not 300',
      body: 'At scroll speed the visitor sets the cadence, not the frame count. Doubling to 240 doubles the weight for a difference nobody identifies blind. The pipeline samples evenly across the clip, encodes a 640 / 960 / 1600 ladder in AVIF and WebP, and writes a manifest the runtime actually reads.',
    },
    {
      id: 'phones',
      kicker: '',
      title: 'Phones get the animation',
      body: 'The static fallback is for prefers-reduced-motion, Save-Data, and 2G. It is not for small screens. The 640 rung is a few hundred kilobytes, and phones are most of the traffic. Serving them a JPEG to save bytes you already saved is the wrong trade.',
    },
    {
      id: 'budget',
      kicker: 'Why CI, not a README line',
      title: 'The budget is a job that can fail',
      body: 'Sequences do not get heavy by decision. They grow half a megabyte per iteration while everyone looks at the visuals. check_budget.py exits 1 and prints what to cut, in order. 8 MB for the largest rung is about four seconds on Slow 4G. Past that, the loader outlasts patience.',
    },
    {
      id: 'config',
      kicker: '',
      title: 'The second site is a reskin',
      body: 'Copy template/, edit config.js, run the pipeline. src/motion.js stays identical between projects. If building the second example takes as long as the first, something leaked out of config and into the engine.',
    },
  ],

  cta: {
    title: 'Use the skill, or just the scripts',
    body: 'Copy skills/motion-website into ~/.claude/skills/, or run extract, optimize, and the budget gate by hand. Either path ships the same site.',
    label: 'Open the repository',
    href: 'https://github.com/dimeloper/motion-site-kit',
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
