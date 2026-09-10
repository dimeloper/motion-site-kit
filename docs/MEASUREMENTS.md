# Measurements and their limits

Observed locally on 9 September 2026. These measurements separate transfer,
bitmap storage and GPU behavior so one metric does not stand in for another.

## Cold initial resources

`scripts/hero-clip/measure-pages.mjs` opens each page at 390×844, DPR 2, disables
cache, waits for the hero and network idle, and records CDP encoded network
bytes. It serves pinned npm modules locally without compression and includes
successful external font requests. It does not scroll to load every lazy image.

[Recorded observations](page-resource-measurements.json):

- Root frame demo: 1,206,899 bytes.
- Harbor before image optimization: 6,577,522 bytes; after: 4,185,866 bytes.
- Vortex: 2,227,701 bytes.
- Halo: 4,350,822 bytes.
- Fold v1 live prototype: 448,534 bytes (historical).
- Fold v1 baked-frame template: 1,231,477 bytes (historical).
- Fold v2 sculptural page: 570,204 bytes, including its local font and
  initially requested material imagery. The page has more content than v1.

All observed heroes reached ready and these runs recorded no network failures.
Different pages contain different content, so the totals are not an engine
speed ranking. In particular, the harness serves the full uncompressed Three.js
ES module; a production host may bundle and compress it. The Fold build already
bundles its dependencies. HTTP overhead is included in these observed figures.

Harbor's original JPEGs totaled 3,158,919 bytes. Its new delivery WebPs total
766,074 bytes, a 75.7% asset reduction. The script keeps the originals and records
source hashes, dimensions and encoding settings in [image-optimization.json](image-optimization.json).
The two images were visually inspected after encoding. Initial page bytes fell
36.4% in this harness, rather than the larger image-only percentage.

```bash
npm ci --prefix scripts/hero-clip
node scripts/hero-clip/measure-pages.mjs
# Optional: a reskin built with the Fold comparison instructions
MOTION_DOCS_ROOT=out/fold-site MOTION_ROUTES=/ \
  MOTION_METRICS_OUT=out/fold-page-measurements.json \
  node scripts/hero-clip/measure-pages.mjs
```

Outputs default to ignored `out/`. `CHROME_PATH` overrides the local macOS
Chrome path. These are unthrottled local observations, not real-cellular tests.

## Decoded storage

The frame tests wrap bitmap creation and close to sum live width × height × 4.
The default hero peaked at 126.6 MiB for the phone-sized 960px rung and 126.3 MiB
for desktop 1600px, below the 128 MiB ceiling. Retaining all 120 16:9 bitmaps
would calculate to 237.3 and 659.2 MiB respectively. These figures exclude
compressed blobs, canvas buffers, decoder internals and browser process overhead.

[Embedded model texture inspection](model-texture-measurements.json) finds three
1024×1024 textures each in Harbor's loaf and Halo's pillar: 12 MiB base RGBA,
approximately 16 MiB with a full mip chain. Environment maps and scene-created
textures/render targets are excluded. This is an estimate, not queried GPU
residency. Vortex's similarly sized stored ring textures are unused by its
current procedural CAD scene and must not be counted as live page resources.

```bash
# Requires Pillow
python3 scripts/measure_model_textures.py
python3 scripts/optimize_example_images.py
python3 scripts/sync_examples.py --write
```

KTX2/Basis may reduce texture residency, but a justified adoption still needs
visual comparison, transcode cost and real-device measurements. No KTX2 or
Three.js WebGPU migration is claimed here.

## Same-source shader and frames

The [Fold comparison](examples/vgpu/FRAME-COMPARISON.md) contains all six sequence
byte totals, provenance, generation commands and the config-only frame reskin.
Its [build check](examples/vgpu/check-build.mjs) verifies the published bundle
against source and separate ceilings without changing any default frame budget.

## Still required before production claims

Actual cellular conditions, Android hardware and broader Firefox behavior,
production LCP, frame-time distributions and power use. Chromium's software-GPU
allowances make the automated checks portable enough to verify failure/recovery;
they do not establish hardware throughput or battery efficiency. Subsequent
Safari, physical-device and CI evidence is tracked in [release QA](RELEASE-QA.md).
Firefox 151.0.3 passed three local smoke checks: frame forward/reverse, Fold
with WebGPU disabled, and the frame reduced-motion fallback. This is limited
behavior coverage, not cross-browser visual or performance parity.

## Docs and example design pass

A later cold-harness observation after the docs/catalog redesign recorded:

| Page | Observed bytes |
| --- | ---: |
| Docs home | 1,234,333 |
| Harbor | 4,189,061 |
| Vortex | 2,232,254 |
| Halo | 4,354,568 |

All four reached ready with no failed requests in this run. These numbers use
the same uncompressed local-vendor method described above, not production
compression or actual cellular transfer. They supersede the earlier page totals
for this design revision; the earlier rows remain historical observations.
The three new gallery preview WebPs total 102,340 bytes and load lazily. Their
source screenshots, dimensions and encoder settings are recorded in
[preview provenance](assets/preview-provenance.json). The docs font is now local.
