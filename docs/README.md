# docs/ — GitHub Pages publish dir

This directory is a copy of `template/` (root docs site) plus the three demos under
`examples/`. GitHub Pages serves it from `/docs` on `main`. A clone can serve it
with no pipeline: `python3 -m http.server 8080 --directory docs`. To reskin
`template/` against the same ladder, run `./scripts/use-demo-frames.sh`.

The **root** docs site still uses the frame-scrub engine (`src/motion.js` aligned
with `template/`). The demos each fork their own engine:

| Path | Engine |
|---|---|
| `examples/local/` | Live WebGL (Higgsfield Meshy GLB) |
| `examples/saas/` | Live WebGL fitness ring (peel / seat) |
| `examples/commerce/` | Halo studio. Rings lift / seat. Compose from `kit/` |
| `kit/` | 30 section families; `planPage()` picks from content |

`.nojekyll` is required so GitHub Pages does not run Jekyll on the frames.

Frame ladders: regenerate with `scripts/hero-clip/` then `optimize_frames.py`.
WebGL model path: `skills/motion-website/references/webgl-model.md`.
Page kit: `kit/` and `skills/motion-website/references/page-kit.md`.
