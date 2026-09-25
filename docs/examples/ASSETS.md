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
| `local/models/loaf.glb` | Meshy image-to-3D (through the Higgsfield MCP) from a studio still of a loaf, then compressed with `skills/motion-website/scripts/compress_glb.sh` | Meshy plan and output terms: **not recorded**. Source still: **not recorded** |
| `commerce/models/pillar.glb` | Meshy image-to-3D with PBR textures, compressed with meshopt and WebP textures | Meshy plan and output terms: **not recorded**. Source still: **not recorded** |

Vortex ships no model. Its band is built in code in `saas/src/scene.js`.

## Images

| File | Used by | Source | Terms |
| --- | --- | --- | --- |
| `local/images/loaf.jpg` | Master for `loaf.webp` | Unsplash, per the Harbor footer credit | Unsplash License. Photographer and URL: **not recorded** |
| `local/images/board.jpg` | Master for `board.webp` | Unsplash, per the Harbor footer credit | Unsplash License. Photographer and URL: **not recorded** |
| `local/images/loaf.webp`, `board.webp` | Harbor page, page kit | Encoded from the masters above; settings in [image-optimization.json](../image-optimization.json) | As the masters |
| `saas/images/lock.jpg` | Vortex poster, page kit | Recraft render of the ring, cut out and composited on a dark field (per `webgl-model.md`) | Recraft plan and output terms: **not recorded** |
| `saas/images/lock-night.jpg` | Vortex config | **not recorded** | **not recorded** |
| `commerce/images/poster.jpg` | Halo poster | **not recorded** | **not recorded** |
| `commerce/images/pillar.jpg` | Halo config, page kit | **not recorded** | **not recorded** |
| `commerce/images/table.jpg` | Halo config | **not recorded** | **not recorded** |
| `commerce/images/grain.jpg` | Halo config | **not recorded** | **not recorded** |

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
