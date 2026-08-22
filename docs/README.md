# docs/ — GitHub Pages publish dir

This directory is a copy of `template/` with its own `config.js`. GitHub Pages
serves it from `/docs` on `main`. The site is the README: you scroll a 120-frame
studio orbit of a 3D device, inside the budget, on the same engine every
project uses.

`src/motion.js` is identical to `template/src/motion.js`. If it diverges, push
the change back into the template or into config.

`.nojekyll` is required so GitHub Pages does not run Jekyll on the frames.

Regenerate the sequence with `scripts/hero-clip/` (Three.js studio render), then
`optimize_frames.py --out docs/frames`.
