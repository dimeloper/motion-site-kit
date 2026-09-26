# docs/ — GitHub Pages publish dir

This directory is the published site: the developer landing page, the page-kit
catalog and the examples. GitHub Pages publishes it from `main`. A clone can
serve it with no pipeline:

```bash
python3 -m http.server 8080 --directory docs
```

| Path | What it is |
|---|---|
| `/` | Landing page, running the frame-scrub engine against the committed ladder in `frames/` |
| `examples/local/` | Harbor: a Meshy GLB loaf orbited by the camera, with flour motes |
| `examples/saas/` | Vortex: a procedural titanium band whose particle halo peels and reseats |
| `examples/commerce/` | Halo: rings of light lift off a stone; sections below composed from the page kit |
| `examples/shared/` | The runtime Harbor, Vortex and Halo share |
| `examples/vgpu/` | Fold: a scroll-driven WebGPU material, with its source and a committed build in `demo/` |
| `kit/` | Section families and four complete page recipes; `planPage()` picks families from content |

The landing page's engine in `src/` is a copy of `template/src`, because Pages
cannot follow the `template/` symlink out of this directory. Run
`python3 scripts/sync_engine.py --write` from the repository root after changing
the template's engine; CI fails on drift. `config.js` here is independent: it
holds only the landing page's engine settings.

`.nojekyll` is required so GitHub Pages does not run Jekyll over the frames.

The docs font is self-hosted in `assets/` with its OFL licence. The gallery
previews are screenshots of these pages. Every example image and model is
listed with its source and terms in [the asset register](examples/ASSETS.md).
The landing page stays readable without JavaScript; the kit's previews need it.

Start with [onboarding](ONBOARDING.md), then follow the
[product-reveal use case](USE-CASE-PRODUCT-REVEAL.md) for a complete frame
project. [MEASUREMENTS.md](MEASUREMENTS.md) records what the pages load and
what that does and does not show.
