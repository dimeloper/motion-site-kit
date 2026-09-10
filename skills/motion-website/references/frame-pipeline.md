# Frame pipeline

## Contents

- [Extraction](#extraction)
- [Encoding: AVIF and WebP](#encoding-avif-and-webp)
- [The responsive ladder](#the-responsive-ladder)
- [Manifest format](#manifest-format)
- [Runtime selection](#runtime-selection)

## Extraction

`scripts/extract_frames.py` wraps ffmpeg. It samples evenly across the clip's full duration rather than decoding sequentially and stopping, which means clip length stops mattering — a 3-second and a 6-second source both produce exactly `--count` frames covering the whole motion.

```bash
python3 scripts/extract_frames.py hero.mp4 --out frames/raw --count 120 --width 1600
```

Frames are written zero-padded (`0000.png` … `0119.png`) so lexical and numeric order agree. Anything downstream that sorts by filename then behaves.

PNG is the intermediate on purpose. Extracting to JPEG bakes in artifacts that the AVIF encoder then has to spend bits preserving.

### Frame count

90–150 covers essentially every case. The relationship people expect — more frames, smoother animation — does not hold at scroll speed, because the visitor's scroll velocity, not the frame count, sets the perceived cadence. Going from 120 to 240 doubles page weight for a difference nobody has been able to identify in a blind comparison.

Use the low end (90) for slow, simple motion like a rotation. Use the high end (150) when there is fast translation or a lot of fine detail moving.

## Encoding: AVIF and WebP

Both, with AVIF first in the `<picture>`/manifest order. AVIF typically lands 30–50% smaller than WebP at matched visual quality on the smooth gradients and soft lighting that product renders are made of. WebP is the fallback for anything that does not decode AVIF.

Quality 55–65 for AVIF is the working range for photographic frames. Above 70 you are spending bytes on detail the visitor sees for one-hundred-and-twentieth of a scroll.

Encode from the PNG intermediates, never from an already-lossy file.

## The responsive ladder

Three widths: 1600, 960, 640.

| Width | Serves | Typical sequence weight |
|---|---|---|
| 1600 | Desktop, retina laptops | 4–7 MB |
| 960 | Small laptops, tablets, high-DPR phones | 1.5–3 MB |
| 640 | Phones, Save-Data, slow connections | 0.4–1 MB |

The 640 rung is what replaces the usual "disable the animation on mobile" advice. At under a megabyte there is no reason to deny phone visitors the effect that the entire page is built around — and phones are most of the traffic.

`scripts/optimize_frames.py` generates all rungs and both formats in one pass and reports per-rung totals.

## Manifest format

Written to the frames output directory. The runtime reads this instead of pattern-matching filenames, so changing the naming scheme never breaks the client.

```json
{
  "count": 120,
  "formats": ["avif", "webp"],
  "widths": [640, 960, 1600],
  "aspect": 1.7777,
  "pattern": "{width}/{format}/{index}.{format}",
  "padding": 4,
  "poster": "960/webp/0000.webp",
  "bytes": {
    "640":  { "avif": 612_000,  "webp": 941_000 },
    "960":  { "avif": 1_740_000, "webp": 2_610_000 },
    "1600": { "avif": 4_320_000, "webp": 6_780_000 }
  }
}
```

`poster` is the static frame the fallback path shows. Pick a frame from roughly one-third in rather than frame 0 — the opening frame of a motion clip is usually the least interesting composition in it.

## Runtime selection

```js
function pickWidth(manifest) {
  const target = window.innerWidth * Math.min(window.devicePixelRatio || 1, 2);
  return manifest.widths.find((w) => w >= target) ?? manifest.widths.at(-1);
}
```

DPR is capped at 2 deliberately. A 3x phone display asking for a 1600-wide sequence triples the download to resolve detail that is invisible at arm's length on a 6-inch screen.

Format selection uses a one-pixel decode probe at startup rather than user-agent sniffing:

```js
const canAvif = await createImageBitmap(
  await (await fetch(TINY_AVIF_DATA_URL)).blob()
).then((bitmap) => { bitmap.close(); return true; }, () => false);
```
