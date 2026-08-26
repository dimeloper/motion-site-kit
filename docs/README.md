# docs/ — GitHub Pages publish dir

This directory is a copy of `template/` (root docs site) plus the three demos under
`examples/`. GitHub Pages serves it from `/docs` on `main`.

The **root** docs site still uses the frame-scrub engine (`src/motion.js` aligned
with `template/`). The demos each fork their own engine:

| Path | Engine |
|---|---|
| `examples/local/` | Live WebGL (Higgsfield Meshy GLB) |
| `examples/saas/` | Particle field |
| `examples/commerce/` | Floating layered stills |

`.nojekyll` is required so GitHub Pages does not run Jekyll on the frames.

Frame ladders: regenerate with `scripts/hero-clip/` then `optimize_frames.py`.
WebGL model path: `skills/motion-website/references/webgl-model.md`.
