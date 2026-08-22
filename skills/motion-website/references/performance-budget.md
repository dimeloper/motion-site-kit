# Performance budget

## The numbers

| Metric | Budget | Why this number |
|---|---|---|
| Sequence total (largest rung) | 8 MB | ~4s on Slow 4G. Past that, the loading state outlasts patience. |
| Sequence total (640 rung) | 1.5 MB | Phone visitors on cellular should not wait longer than a page load. |
| Single frame | 120 KB | A frame over this is usually an encoder-quality mistake, not real detail. |
| Frame count | 90–150 | Above 150 is weight with no perceptual return at scroll speed. |
| LCP | < 2.5s | The poster frame, not the sequence, must be the LCP element. |

These are enforced by `scripts/check_budget.py`, which reads `motion.config.json` and exits non-zero on breach.

## Why a gate and not a guideline

The failure mode of these sites is not that anyone decides to ship 200 MB. It is that the sequence grows by half a megabyte per iteration while everyone is looking at the visuals, and nobody re-measures. A number in a README does not survive that; a CI job that refuses the merge does.

Put it in the pipeline on day one, before the first sequence exists. Adding it later means starting from a red build, and a red build that was always red gets ignored.

## What to cut, in order

When the gate fails, work down this list. It is ordered by how much weight comes off per unit of visible quality lost.

1. **Frame count 120 → 90.** Usually 25% off for no perceptible change. Try this first, always.
2. **AVIF quality 65 → 55.** Another 20–30%. Inspect one frame at full size before committing.
3. **Crop tighter.** Background pixels cost the same as product pixels. Reframing to fill more of the canvas with the subject shrinks the file and improves the composition at once.
4. **Simplify the source motion.** A slow rotation on a plain backdrop encodes dramatically smaller than a moving camera over a detailed scene, because inter-frame difference is what the encoder is paying for.
5. **Max width 1600 → 1280.** Last resort. Visible on large displays.

Not on the list: dropping the 640 rung. It is the cheapest rung and it serves the most visitors.

## The LCP trap

The poster frame must load and paint independently of the sequence. If the browser's LCP candidate is the canvas, and the canvas stays blank until 120 frames finish decoding, LCP is measured at the end of preload — which is a poor score for a page that appeared to the visitor to load instantly.

Render the poster as a real `<img>` behind the canvas, with `fetchpriority="high"`, and let the canvas fade in over it once ready. LCP resolves against the poster, and the visitor sees a composed hero immediately either way.

## Measuring

```bash
python3 scripts/check_budget.py --config motion.config.json --verbose
```

For the real numbers, throttle in DevTools to Slow 4G with cache disabled and watch the network panel — the compressed transfer size is what matters, and for AVIF and WebP that equals the file size, since they are already compressed and gzip does nothing for them. Make sure your host is not wasting CPU trying.
