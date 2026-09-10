/**
 * Frame runtime settings for the docs showcase. The engine is mirrored from
 * template/; docs-specific editorial markup and chrome live in index.html.
 */

export const CONFIG = {
  brand: {
    name: 'motion-site-kit',
    primary: '#D8F780',
    ink: '#11160F',
    paper: '#F0EFE7',
    displayFont: 'Manrope, system-ui, sans-serif',
    bodyFont: 'Manrope, system-ui, -apple-system, sans-serif',
  },

  hero: {
    eyebrow: 'Open source kit',
    headline: 'Make the web move.',
    sub: 'A Codex / Claude skill and a reskinnable template. Extract frames, encode a ladder, fail the build when it gets heavy.',
    cta: { label: 'Read the pipeline', href: '#pipeline' },
    animationDescription:
      'A titanium smartphone with a square camera island comes apart as you scroll: back glass, cameras, board and battery lift, then seat themselves again.',
  },

  sections: [
    {
      id: 'pipeline',
      kicker: 'The cut that matters',
      title: '120 frames, not 300',
      body: 'At scroll speed the visitor sets the cadence, not the frame count. More frames increase transfer and decoding work; choose the count by reviewing the source at the intended scroll range. The pipeline samples evenly across the clip, encodes a 640 / 960 / 1600 ladder in AVIF and WebP, and writes a manifest the runtime actually reads.',
    },
    {
      id: 'phones',
      kicker: '',
      title: 'Phones get the animation',
      body: 'The static fallback is for prefers-reduced-motion, Save-Data, and 2G. It is not for small screens. The committed docs sequence has a 640px rung below 500 KB in each advertised format. Serving them a JPEG to save bytes you already saved is the wrong trade.',
    },
    {
      id: 'budget',
      kicker: 'Why CI, not a README line',
      title: 'The budget is a job that can fail',
      body: 'Sequences do not get heavy by decision. They grow half a megabyte per iteration while everyone looks at the visuals. check_budget.py exits 1 and prints what to cut, in order. The 8 MiB ceiling is a maximum asset allowance, not a loading-time promise. Measure delivery on the target network.',
    },
    {
      id: 'config',
      kicker: '',
      title: 'The second site is a reskin',
      body: 'Copy template/, edit config.js, run the pipeline. src/motion.js stays identical between projects. If building the second example takes as long as the first, something leaked out of config and into the engine.',
    },
    {
      id: 'examples',
      kicker: 'Independent WebGL examples',
      title: 'Harbor, Vortex, and Halo',
      body: '<a href="examples/local/">Harbor</a> orbits a loaf. <a href="examples/saas/">Vortex</a> peels a CAD band. <a href="examples/commerce/">Halo</a> is a studio: rings lift off stone. New pages compose from the <a href="kit/">page kit</a>.',
    },
  ],

  cta: {
    title: 'Use the skill, or just the scripts',
    body: 'Install skills/motion-website into your Codex or Claude skills directory, or run extract, optimize, and the budget gate by hand. Either path ships the same site.',
    label: 'Open the repository',
    href: 'https://github.com/dimeloper/motion-site-kit',
  },

  motion: {
    framesBase: 'frames',
    scrollLengthVh: 3.5,
    scrub: 0.5,
    lenisDuration: 1.1,
    concurrency: 8,

    // Bound loader ownership when a server never finishes a request.
    loadTimeoutMs: 30000,

    // RGBA bitmap ceiling, including the frame being decoded.
    // 128 MiB holds about 23 frames at 1600×900; compressed frames stay cached.
    maxDecodedBytes: 128 * 1024 * 1024,
    maxDpr: 2,
  },
};
