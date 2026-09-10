# Fold: one source, two delivery paths

The exporter can bake the live study or an archived shader. The exporter
records the shader hash, resolution, frame count and sampling rule. The page
layouts and cropping differ, so this comparison establishes source provenance
and asset costs; it is not a controlled frame-time or visual-quality benchmark.

The current v3 shader changes the lighting and fold frequency. Its posters were
regenerated; the sequence sizes below describe archived shaders, not v3.

## Archived sculpture (v2)

```bash
FOLD_SHADER=./archive/material-v2.wgsl \
  node docs/examples/vgpu/export-frames.mjs frames/raw-fold-v2
python3 skills/motion-website/scripts/optimize_frames.py frames/raw-fold-v2 \
  --out out/fold-v2-frames --config motion.config.json
python3 skills/motion-website/scripts/check_budget.py \
  --frames out/fold-v2-frames --config motion.config.json --strict
```

The transparent sculpture is flattened onto the page paper (`#efeee9`), using
120 frames at 1600×1200 and progress `index / 119`. The unchanged root encoding
settings produce these exact sequence bytes:

| Width | AVIF | WebP |
| --- | ---: | ---: |
| 640 | 552,596 | 596,878 |
| 960 | 874,967 | 982,798 |
| 1600 | 1,550,795 | 1,906,592 |

All six pass the original budgets. Archived v2 shader SHA-256:
`e3c5818c8b962e50560147b36e03ad3011b1242cd88405fe61076758754f8d96`.
The v2 live build had 44,256 bytes of gzip-level-9 JS and a 191,805-byte silver
poster. Export provenance is written alongside the generated frames. The
original dark frame reskin below belongs to v1; these light v2 assets were
verified as sequences, not reviewed as a new frame-template site.

## Reproduce the archived v1 frame reskin

Run from the repository root. Choose a new raw output directory on reruns;
the exporter refuses to overwrite an existing sequence.

```bash
npm ci --prefix docs/examples/vgpu
FOLD_SHADER=./archive/material-v1.wgsl \
  node docs/examples/vgpu/export-frames.mjs frames/raw-fold
python3 skills/motion-website/scripts/optimize_frames.py frames/raw-fold \
  --out out/fold-frames --config motion.config.json
python3 skills/motion-website/scripts/check_budget.py \
  --frames out/fold-frames --config motion.config.json --strict

mkdir -p out/fold-site/src
cp template/index.html out/fold-site/
cp template/src/* out/fold-site/src/
cp docs/examples/vgpu/frame-config.js out/fold-site/config.js
# Run this copy into a fresh fold-site folder to avoid nesting old outputs.
cp -R out/fold-frames out/fold-site/frames
python3 -m http.server 8081 --directory out/fold-site
```

Native WebGPU is required to bake the shader; Pillow with AVIF support is
required for encoding. Serving the finished frames needs neither. The engine
files are copied unchanged; only config is a Fold-specific reskin. Outputs are
ignored so the repository does not store another 720 encoded frame files.

To exercise the frame reskin in Chromium with locally pinned GSAP/Lenis:

```bash
npm ci --prefix scripts/hero-clip
MOTION_DOCS_ROOT=out/fold-site TEST_FILTER='forward, reverse' \
  npm run test:motion --prefix scripts/hero-clip
```

## Archived v1 observations, 9 September 2026

120 frames at 1600×1200, sampled at `index / 119`, encoded with the unchanged
root config (AVIF quality 60, WebP 78). Exact sequence bytes:

- 640px: AVIF 498,777; WebP 697,892.
- 960px: AVIF 756,241; WebP 1,133,990.
- 1600px: AVIF 1,290,163; WebP 2,189,464.

All six sequences pass the original byte ceilings. The largest single frame
is 18 KiB. A visitor chooses one width and format; summing all ladders would
misrepresent their download. The default poster is a separate 960px WebP.

The archived v1 live build used 43,468 bytes of total JS with gzip level 9 and a
306,937-byte PNG poster. It avoids a sequence download but performs the shader
work on the visitor's GPU. The frame path can display any footage and runs
without WebGPU. These capabilities are different; bytes alone do not decide.

The v1 frame browser test passed forward/reverse output and measured a peak of
126.6 MiB in live bitmap RGBA accounting at 390×844 DPR2. Reverse output had a
mean channel difference of 0.263/255, within the test's rasterization tolerance.
Native shader reverse was pixel-identical on the tested Metal device.

Shader SHA-256:
`02c2b9e11d25bc9c28072176ab1f30114e7fad5cd82569be6ebe0bd4af52977f`.

A future photoreal showcase still needs suitable authored or licensed footage.
Fold supplies an honest, reproducible procedural source in the meantime.
