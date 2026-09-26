# Example assets

Every image, model and font the examples ship, where it came from and on what
terms. The MIT license in this repository covers code. It does not cover the
files below, each of which carries its own terms.

Rows marked **not recorded** have no source on file in this repository. They
must be filled in, or the file replaced with one whose source is known, before
anyone reuses it outside these demos.

## Models

| File | Source | Terms |
| --- | --- | --- |
| `local/models/loaf.glb` | Meshy image-to-3D (through the Higgsfield MCP) from a studio still of a loaf, then compressed with `skills/motion-website/scripts/compress_glb.sh` | Higgsfield paid plan. [Higgsfield's terms](https://higgsfield.ai/terms-of-use-agreement) (updated 26 July 2026) claim no ownership of outputs and do not restrict their commercial use; Meshy's acceptable-use policy also applies. Source still: generated on the same Higgsfield plan |
| `commerce/models/pillar.glb` | Meshy image-to-3D with PBR textures (through the Higgsfield MCP), compressed with meshopt and WebP textures | Higgsfield paid plan. [Higgsfield's terms](https://higgsfield.ai/terms-of-use-agreement) (updated 26 July 2026) claim no ownership of outputs and do not restrict their commercial use; Meshy's acceptable-use policy also applies. Source still: generated on the same Higgsfield plan |

Vortex ships no model. Its band is built in code in `saas/src/scene.js`.

## Images

| File | Used by | Source | Terms |
| --- | --- | --- | --- |
| `local/images/loaf.jpg` | Master for `loaf.webp` | [Fernando Delgado on Unsplash](https://unsplash.com/photos/brown-bread-on-black-table-AO6j8f8xXHw), downloaded at 2400×3600 | Unsplash License (free photo, not Unsplash+) |
| `local/images/board.jpg` | Master for `board.webp` | [Vicky Ng on Unsplash](https://unsplash.com/photos/bread-on-brown-wooden-round-tray-JlwXPO7DStM), downloaded at 1800×2400 | Unsplash License (free photo, not Unsplash+) |
| `local/images/loaf.webp`, `board.webp` | Harbor page, page kit | Encoded from the masters above; settings in [image-optimization.json](../image-optimization.json) | As the masters |
| `saas/images/lock.jpg` | Vortex poster, page kit | Recraft V4.1 run on Higgsfield (generation `3a717201`, 2026-08-27), background removed on Higgsfield (`08ac85c6`), composited on a dark field | Higgsfield paid plan. [Higgsfield's terms](https://higgsfield.ai/terms-of-use-agreement) (updated 26 July 2026) claim no ownership of outputs and do not restrict their commercial use; Recraft's acceptable-use policy also applies |
| `saas/images/lock-night.jpg` | Vortex config | The ring from `lock.jpg`, scaled to 0.81 on a darker field | As `lock.jpg` |
| `commerce/images/poster.jpg` | Halo poster | Nano Banana 2 on Higgsfield (generation `0c75a0d4`, 2026-08-28), resized and cropped | Higgsfield paid plan. [Higgsfield's terms](https://higgsfield.ai/terms-of-use-agreement) (updated 26 July 2026) claim no ownership of outputs and do not restrict their commercial use |
| `commerce/images/pillar.jpg` | Halo config, page kit | Nano Banana 2 on Higgsfield (generation `f487cc48`, 2026-08-28), resized and cropped | Higgsfield paid plan. [Higgsfield's terms](https://higgsfield.ai/terms-of-use-agreement) (updated 26 July 2026) claim no ownership of outputs and do not restrict their commercial use |
| `commerce/images/table.jpg` | Halo config | Nano Banana 2 on Higgsfield (generation `dc69396f`, 2026-08-28), resized and cropped | Higgsfield paid plan. [Higgsfield's terms](https://higgsfield.ai/terms-of-use-agreement) (updated 26 July 2026) claim no ownership of outputs and do not restrict their commercial use |
| `commerce/images/grain.jpg` | Halo config | Nano Banana 2 on Higgsfield (generation `d10ad2e8`, 2026-08-28), resized and cropped | Higgsfield paid plan. [Higgsfield's terms](https://higgsfield.ai/terms-of-use-agreement) (updated 26 July 2026) claim no ownership of outputs and do not restrict their commercial use |

## Generated in this repository

| Files | Source |
| --- | --- |
| `vgpu/demo/poster*.png`, `vgpu/source/public/poster*.png` | Rendered from Fold's own shader; see [poster-provenance.json](vgpu/poster-provenance.json) |
| `../assets/*-preview.webp`, `../assets/social-preview.jpg` | Screenshots of these examples and a composite of them; see [preview-provenance.json](../assets/preview-provenance.json) |
| `../frames/` | The landing page's frame ladder, encoded by `optimize_frames.py` |

## Fonts

Manrope is self-hosted under the SIL Open Font License. The license text sits
next to each copy: `../assets/MANROPE-LICENSE.txt` and in `vgpu/demo/` and
`vgpu/source/public/`.

## Adding an asset

Add a row here in the same commit. Record the source URL or tool, the author
where there is one, and the licence or plan the output was produced under.
`scripts/check_example_budget.py` fails on images and models that no page
references, so an unused file cannot linger.
