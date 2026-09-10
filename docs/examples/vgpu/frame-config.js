/** Fold reskin: copy over config.js in a fresh template; the frame engine is unchanged. */
export const CONFIG = {
  brand: {
    name: 'Fold', primary: '#B9793E', ink: '#11191D', paper: '#F2EFE8',
    displayFont: 'Georgia, serif', bodyFont: 'system-ui, sans-serif',
  },
  hero: {
    eyebrow: 'An authored material study',
    headline: 'A softer side of metal.',
    sub: 'One sheet unfolds as the light warms. Scroll forward, then retrace the gesture.',
    cta: { label: 'Explore the study', href: '#source' },
    animationDescription: 'A rippling silver sheet opens its folds and takes on a warm bronze light against a dark slate background.',
  },
  sections: [
    { id: 'source', kicker: 'One source', title: 'From shader to sequence.',
      body: 'The same authored WGSL material powers the live WebGPU study and these baked frames. Each frame samples a fixed scroll position, with its source hash recorded alongside the PNGs.' },
    { id: 'delivery', kicker: 'The frame path', title: 'A familiar delivery pipeline.',
      body: 'Responsive AVIF and WebP frames pass the kit’s existing byte gate. GSAP links scroll to a bounded bitmap cache. No changes to the template engine are needed for this reskin.' },
  ],
  cta: { title: 'Build with the source.', body: 'Inspect the shader, bake your own frames, and compare the two paths using the same content.',
    label: 'Read the source', href: 'https://github.com/dimeloper/motion-site-kit' },
  motion: { framesBase: 'frames', scrollLengthVh: 3.5, scrub: 0.5, lenisDuration: 1.1,
    concurrency: 8, loadTimeoutMs: 30000, maxDecodedBytes: 128 * 1024 * 1024, maxDpr: 2 },
};
