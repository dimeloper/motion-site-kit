# Measurements and their limits

Observed locally on 25 September 2026 with Chrome 153. Each section says what
was measured, how, and what it does not establish. Transfer, bitmap storage and
GPU behaviour are kept apart so that one number does not stand in for another.

## Cold initial resources

`scripts/hero-clip/measure-pages.mjs` opens each page at 390×844, DPR 2, with
the cache disabled. It waits for the hero to reach ready and the network to go
idle, then sums the encoded bytes Chrome's DevTools protocol reports. Pinned npm
modules replace the CDN imports and are served uncompressed. External font
requests are included. The script does not scroll, so lazy images below the
fold are excluded. [Raw observations](page-resource-measurements.json).

| Page | Observed bytes |
| --- | ---: |
| Docs home (frame scrub) | 1,235,548 |
| Harbor | 4,196,181 |
| Vortex | 2,239,785 |
| Halo | 3,919,456 |
| Fold | 600,932 |

Every page reached ready with no failed requests. The pages carry different
content, so these totals are not an engine speed ranking. The harness serves
the full uncompressed Three.js module; a production host that bundles and
compresses it will transfer less. Fold is already bundled.

Harbor's delivery images are WebP encodings of the original JPEGs, which cut
those two assets by 75.7%. [image-optimization.json](image-optimization.json)
records the source hashes, dimensions and encoder settings.

```bash
npm ci --prefix scripts/hero-clip
node scripts/hero-clip/measure-pages.mjs          # writes out/page-measurements.json
```

`CHROME_PATH` overrides the macOS Chrome location. These are unthrottled local
observations, not cellular downloads.

## Decoded frame storage

The browser tests wrap `createImageBitmap` and `close` and sum live
width × height × 4. The docs hero peaked at 126.6 MiB on a phone-sized viewport
(960px rung) and 126.3 MiB at desktop width (1600px rung), under the 128 MiB
ceiling. Retaining all 120 frames would take 237.3 MiB and 659.2 MiB
respectively. The figures exclude compressed blobs, canvas buffers, decoder
internals and browser process overhead.

## WebGL resources

[Embedded model texture inspection](model-texture-measurements.json) finds three
1024×1024 textures each in Harbor's loaf and Halo's pillar: 12 MiB of base RGBA,
about 16 MiB with a full mip chain. This is calculated from the GLB, not queried
GPU residency, and excludes environment maps and render targets created in code.
Vortex builds its band procedurally and ships no model.

The browser tests count WebGL texture and framebuffer creation and deletion.
Across three bfcache restore cycles each example releases everything it
allocated, apart from four 1×1 placeholder textures that three.js r170 creates
per renderer and never deletes. Vortex and Halo submit no draw calls while idle;
Harbor draws every visible frame because its flour motes move on a clock. All
three stop drawing when the hero is offscreen or the tab is hidden.

```bash
python3 scripts/measure_model_textures.py        # requires Pillow
```

KTX2/Basis could reduce texture residency. Adopting it would need a visual
comparison, transcode cost and real-device numbers first.

## Fold

Fold's [build check](examples/vgpu/check-build.mjs) rebuilds the demo and
compares it byte for byte with the published copy. It also reports the gzip
size of the JavaScript bundle and each poster against separate ceilings. The
[frame comparison](examples/vgpu/FRAME-COMPARISON.md) records the same scene
rendered as a frame sequence, with generation commands and byte totals.

## Not measured

Real cellular conditions, Android hardware, production LCP, frame-time
distributions and power use. Chromium's software-GPU flags make the automated
checks portable enough to verify failure and recovery. They do not establish
hardware throughput or battery life. The pre-ship checklist in
[qa.md](../skills/motion-website/references/qa.md) covers the manual checks
that do.
