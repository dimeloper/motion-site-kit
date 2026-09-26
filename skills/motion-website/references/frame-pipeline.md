# Frame pipeline

## Contents

- [Extraction](#extraction)
- [Encoding: AVIF and WebP](#encoding-avif-and-webp)
- [The responsive ladder](#the-responsive-ladder)
- [Posters](#posters)
- [Manifest format](#manifest-format)
- [Runtime selection](#runtime-selection)
- [Portrait phones](#portrait-phones)

## Extraction

`scripts/extract_frames.py` wraps ffmpeg. It samples evenly across the clip's
full duration rather than decoding sequentially and stopping, so a 3-second and
a 6-second source both produce exactly `--count` frames covering the whole
motion.

```bash
python3 scripts/extract_frames.py hero.mp4 --out frames/raw --count 120 --width 1600
```

Frames are written zero-padded (`0000.png` … `0119.png`) so lexical and numeric
order agree. The script deletes the frames of a previous run in `--out`, but
refuses to run if that folder holds PNGs it did not write. Pass `--force` only
when you mean to delete them.

PNG is the intermediate on purpose. Extracting to JPEG bakes in artifacts that
the AVIF encoder then spends bits preserving.

### Frame count

60–150 is the range the budget gate accepts, and 120 is the default. The
expectation that more frames look smoother does not hold at scroll speed: the
visitor's scroll velocity sets the perceived cadence, not the frame count.
Doubling to 240 doubles the weight. Use fewer (90) for slow, simple motion like
a rotation, and more (150) for fast translation or fine detail in motion.

## Encoding: AVIF and WebP

Both, with AVIF first in the manifest. AVIF typically lands 30–50% smaller than
WebP at matched quality on the smooth gradients of product renders; on the
committed demo ladder it is 14–20% smaller per rung. WebP is the fallback for
browsers that cannot decode AVIF.

Quality 55–65 is the working range for AVIF on photographic frames, and the
default is 60. Above 70 you pay for detail the visitor sees for a hundred and
twentieth of a scroll. Encode from the PNG intermediates, never from an
already-lossy file.

## The responsive ladder

Three widths: 640, 960, 1600. `scripts/optimize_frames.py` builds every rung in
both formats in one pass, reports per-rung totals and writes the manifest.

| Width | Selected by | Demo ladder, AVIF / WebP |
|---|---|---|
| 1600 | Laptops, desktops and tablets | 1.25 / 1.56 MiB |
| 960 | Phones at 2x and 3x, since DPR is capped at 2 | 641 / 783 KiB |
| 640 | Small screens at 1x and 1.5x | 404 / 470 KiB |

The phone rungs are what replace the usual "disable the animation on mobile"
advice. Under the 1.5 MB phone ceiling there is no reason to deny phones the
effect the page is built around.

Each run first deletes the ladder and posters of the previous run, so dropping
from 120 to 90 frames leaves no stale files behind for the gate to fail on. A
rung wider than the source frames is skipped with a warning rather than
upscaled; the runtime then uses the widest rung that exists.

## Posters

The pipeline also writes `frames/poster/{width}.webp`: one copy of the poster
frame per rung, taken from about a third of the way in (`--poster-at`, default
0.33), because the opening frame of a clip is rarely its best composition.

The page's `<img>` points at those fixed names, so changing the frame count or
poster position never breaks the LCP image:

```html
<img class="hero__poster" src="frames/poster/960.webp"
     srcset="frames/poster/640.webp 640w, frames/poster/960.webp 960w, frames/poster/1600.webp 1600w"
     sizes="100vw" alt="" fetchpriority="high" decoding="async" />
```

If you change the widths in `motion.config.json`, `optimize_frames.py` prints
the `srcset` to paste into the `<img>` and its preload link.

## Manifest format

Written to the output directory. The runtime reads it instead of guessing file
names, so a naming change never breaks the client. This is the committed demo
manifest:

```json
{
  "count": 120,
  "formats": ["avif", "webp"],
  "widths": [640, 960, 1600],
  "aspect": 1.777778,
  "pattern": "{width}/{format}/{index}.{format}",
  "padding": 4,
  "poster": {
    "frame": 39,
    "files": { "640": "poster/640.webp", "960": "poster/960.webp", "1600": "poster/1600.webp" }
  },
  "bytes": {
    "640": { "avif": 413772, "webp": 481458 },
    "960": { "avif": 656121, "webp": 801910 },
    "1600": { "avif": 1313085, "webp": 1634302 }
  }
}
```

`bytes` records each sequence's size so a stale manifest is detectable: the gate
compares it with the files on disk and fails on any difference.

## Runtime selection

`template/src/ladder.js` holds the rule, so it can be unit tested:

```js
export function pickWidth(widths, viewportWidth, dpr = 1, maxDpr = 2) {
  const ratio = Math.min(Math.max(Number.isFinite(dpr) ? dpr : 1, 1), maxDpr);
  return widths.find((w) => w >= viewportWidth * ratio) ?? widths.at(-1);
}
```

`maxDpr` comes from `config.js` and defaults to 2. A 3x phone asking for the
1600 rung would roughly triple the download to resolve detail nobody sees at
arm's length.

Format selection decodes a one-pixel AVIF at startup rather than sniffing the
user agent, and falls back to WebP if that fails.

## Portrait phones

The frames are landscape, and the canvas draws them with cover semantics. On a
portrait phone that means the frame is scaled to the screen's height and
cropped to a centre strip, about a quarter of the frame's width on a 390×844
screen. Whichever rung is chosen, it is upscaled.

Selecting by width is deliberate: selecting by the covered height would send
phones the 1600 rung to show them a crop of it. What to do about it:

- **Compose for the crop.** Keep the subject in the centre third of the frame throughout the motion.
- **Check it.** The QA checklist includes a portrait pass at 390×844.
- **For a phone-first page, render a second clip at 9:16** and build a separate ladder. The template does not switch ladders by orientation; that is a fork of `motion.js`, not a config change.
