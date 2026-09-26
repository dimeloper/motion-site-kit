# Performance budget

## The numbers

These live in `assets/motion.config.json` and `scripts/check_budget.py` enforces
them. The gate exits 1 on a breach and prints the cut-list below.

| Metric | Budget | Where the number comes from |
|---|---|---|
| Sequence, each rung above 960px | 8 MiB | A ceiling for desktop and tablet rungs, not a target. At 1.6 Mbit/s, the downlink of Chrome DevTools' Slow 4G preset, 8 MiB takes about 42 seconds. That is tolerable only because the poster is a finished hero while frames stream behind it. The committed demo ladder uses 1.25 MiB at 1600px. |
| Sequence, each rung at or below 960px | 1.5 MB | The phone ceiling. Phones at 2x and 3x select the 960 rung and 1x or 1.5x small screens select 640, so both carry it. 1.5 MB is about 7.5 seconds at 1.6 Mbit/s. The demo's 960 AVIF rung is 641 KiB. |
| Single frame | 120 KB | A frame over this is almost always an encoder setting, not real detail. The demo's largest frame is 16 KiB. |
| Frame count | 60–150 | Below 60 the steps show during a slow scrub. Above 150 adds weight with no visible return at scroll speed. 120 is the default. |
| LCP | < 2.5 s | Google's "good" threshold for Largest Contentful Paint. The poster, not the sequence, must be the LCP element. |

Every advertised format is a real download path, so WebP must fit the same
ceilings as AVIF. The gate measures the files on disk, not the manifest's
totals, and fails on missing, empty, stale or unadvertised frames.

## Why a gate and not a guideline

These sites do not become heavy by decision. The sequence grows by half a
megabyte per iteration while everyone is looking at the visuals, and nobody
re-measures. A number in a README does not survive that; a CI job that refuses
the merge does.

Put it in the pipeline on day one, before the first sequence exists. Adding it
later means starting from a red build, and a build that was always red gets
ignored.

## What to cut, in order

When the gate fails, work down this list. It is ordered by how much weight
comes off per unit of visible quality lost. The two percentages were measured
in September 2026 by re-encoding the 120 source PNGs behind the committed demo
ladder in `docs/frames`; quality 60 reproduces that ladder byte for byte.

1. **Frame count 120 → 90.** 25.1% off the demo sequence's 960 rung, with no perceptible change at scroll speed. Try this first.
2. **AVIF quality 60 → 50.** 20.3% off the same rung. Inspect one frame at full size before committing.
3. **Crop tighter.** Background pixels cost the same as product pixels. Filling more of the frame with the subject shrinks the file and usually improves the composition.
4. **Simplify the source motion.** A slow rotation on a plain backdrop encodes far smaller than a moving camera over a detailed scene, because inter-frame difference is what the encoder pays for.
5. **Max width 1600 → 1280.** Last resort. Visible on large displays.

Not on the list: dropping the phone rungs. Without them phones download a wider,
heavier sequence rather than a static image.

## Which rung a visitor downloads

The runtime picks the narrowest rung at least as wide as the viewport width
times the device pixel ratio, with the ratio capped at `maxDpr` (2 by default).
`tests/test_ladder.mjs` pins these cases:

| Device | Viewport × DPR | Rung |
|---|---|---|
| iPhone SE | 375 × 2 | 960 |
| iPhone 15 | 393 × 3, capped to 2 | 960 |
| 1.5x Android | 360 × 1.5 | 640 |
| iPad portrait | 820 × 2 | 1600 |
| Laptop | 1440 × 2 | 1600 |

## The LCP trap

The poster must load and paint independently of the sequence. If the canvas is
the LCP candidate and stays blank until 120 frames decode, LCP is measured at
the end of preload, which is a poor score for a page that looked finished.

The template renders the poster as a real `<img>` behind the canvas, with a
`srcset` over `frames/poster/{width}.webp` and `fetchpriority="high"`. The canvas
fades in over it once frames are ready.

## Measuring

```bash
python3 <skill>/scripts/check_budget.py --config motion.config.json --verbose
```

For real numbers, throttle DevTools to Slow 4G with the cache disabled and watch
the network panel. For AVIF and WebP the transfer size equals the file size,
since they are already compressed; make sure the host is not spending CPU on
gzip for them. Then repeat on a real phone on cellular, which DevTools cannot
emulate.
