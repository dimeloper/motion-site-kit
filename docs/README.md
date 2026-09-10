# docs/ — GitHub Pages publish dir

This directory contains the developer showcase, searchable page-kit catalog
and examples. GitHub Pages publishes this directory from `main`. The docs
markup and styles are independent of the reskinnable frame template. A clone can serve it
with no pipeline: `python3 -m http.server 8080 --directory docs`. To reskin
`template/` against the same ladder, run `./scripts/use-demo-frames.sh`.

The **root** docs site still uses the frame-scrub engine (`src/motion.js` aligned
with `template/`). The demos each fork their own engine:

| Path | Engine |
|---|---|
| `examples/local/` | Live WebGL (Higgsfield Meshy GLB) |
| `examples/saas/` | Live WebGL fitness ring (peel / seat) |
| `examples/commerce/` | Halo studio. Rings lift / seat. Compose from `kit/` |
| `examples/vgpu/demo/` | Fold: optional vgpu procedural material; source and build instructions alongside it |
| `kit/` | Search, preview and copy config for 30 families; `planPage()` picks from content |

`.nojekyll` is required so GitHub Pages does not run Jekyll on the frames.

Frame ladders: regenerate with `scripts/hero-clip/` then `optimize_frames.py`.
WebGL model path: `skills/motion-website/references/webgl-model.md`.
Page kit: `kit/` and `skills/motion-website/references/page-kit.md`.

Canonical WebGL source lives here. After editing `docs/examples`, run
`python3 scripts/sync_examples.py --write` from the repository root to update
`examples/`. The same command mirrors the default engine from `template/src`
into `docs/src`; each root config remains independent. CI verifies consistency.

The old `examples/*/frames` ladders on some developer machines are ignored local
artifacts. Harbor and Halo load models; Vortex builds a CAD band in code. None loads those sequences. CI checks the
committed root ladder strictly and models separately.

The docs font is self-hosted in `assets/` with its OFL license. Example
preview WebPs are screenshots of this repository’s pages, not external artwork.
The docs remain readable without JavaScript; catalog composition requires it.
