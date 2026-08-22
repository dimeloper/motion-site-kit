---
name: motion-website
description: Build scroll-driven motion websites — a pinned canvas that plays an image sequence as the visitor scrolls, driven by GSAP ScrollTrigger with Lenis smooth scroll. Use this skill whenever the user asks for a scroll animation, a scroll-driven or "scrollytelling" site, a pinned hero that animates on scroll, an image-sequence or frame-sequence animation, an Apple-style product page, or wants to turn a video clip or 3D render into a scroll-controlled hero. Also use it when the user mentions GSAP ScrollTrigger, Lenis, frame extraction, or asks why their scroll animation stutters, jumps, or loads slowly — the performance budget and preload sections cover the usual causes.
license: MIT
---

# Motion Website

Build a scroll-driven site where a pinned `<canvas>` plays a decoded image sequence, with scroll position mapped to frame index.

The technique is simple. Doing it without shipping a 200 MB hero or a stuttering canvas is the hard part, and that is most of what this skill is about.

## The pipeline

```
source clip ──▶ extract N frames ──▶ responsive ladder ──▶ budget gate ──▶ site
   (video)         (ffmpeg)          (WebP/AVIF, 3 widths)   (CI fails      (canvas +
                                                              on breach)     ScrollTrigger)
```

Each stage has a script in `scripts/`. Run them in order; do not hand-roll the middle two, because getting frame count and encoding wrong is what makes these sites heavy.

## Build order

Work in this sequence. Later steps depend on measurements from earlier ones, and skipping ahead to the pretty part is how you end up rebuilding.

### 1. Establish the budget before generating anything

Write `motion.config.json` at the project root first. It is the contract the CI gate enforces:

```json
{
  "frames": { "count": 120, "widths": [1600, 960, 640] },
  "budget": { "sequenceBytes": 8388608, "singleFrameBytes": 120000 },
  "formats": ["avif", "webp"]
}
```

**120 frames is the default and it is almost always right.** At scroll speed the eye cannot resolve more. Doubling to 240 doubles the weight and looks identical — verify this yourself once and you will stop being tempted.

8 MB for the whole sequence is the ceiling. That is roughly 4 seconds on a slow 3G connection, which is already at the edge of what someone will wait through with a loading state on screen.

### 2. Get the frames

Either extract from a clip:

```bash
python3 scripts/extract_frames.py input.mp4 --out frames/raw --count 120 --width 1600
```

Or render them deterministically with Remotion (see `references/remotion.md` — read it only if the user wants programmatic frames, brand overlays composited in, or exact reproducibility; note the licensing caveat there before recommending it).

Extraction samples evenly across the clip's duration rather than taking the first N frames, so a 6-second clip and a 3-second clip both yield the same count with the same coverage.

### 3. Build the responsive ladder

```bash
python3 scripts/optimize_frames.py frames/raw --out template/frames --config motion.config.json
```

This writes `frames/{width}/{index}.avif` plus `.webp` and a `manifest.json` the runtime reads. The manifest matters: the client picks a width from `devicePixelRatio × viewport`, so it must not guess at file naming.

### 4. Gate on the budget

```bash
python3 scripts/check_budget.py --config motion.config.json
```

Exit code 1 on breach, with a per-width table of what blew it. Wire this into CI (`.github/workflows/budget.yml` in this repo does) so a heavy sequence cannot merge. This gate is the single most load-bearing file in the kit — a budget that is only checked when someone remembers is not a budget.

If it fails, in order of what to try: drop frame count to 90, lower AVIF quality, crop tighter so there is less background to encode, then reduce max width to 1280.

### 5. Wire the site

Copy `template/` and edit only `config.js` — copy, colors, fonts, section order. `src/motion.js` is the engine and should not need changes between projects. That separation is the whole point: the second build is a reskin, not a rebuild.

### 6. Verify

Read `references/qa.md` and run the checklist. The three that catch real bugs: scroll back up and confirm the sequence reverses without flicker, throttle to Slow 4G and confirm the loading state holds until preload completes, and watch the middle third of the animation, since scroll is slower than playback and that is where visitors linger.

## The scroll engine

GSAP ScrollTrigger drives frame index; Lenis smooths the scroll input. Both are free — GSAP including ScrollTrigger has been free for commercial use since April 2025, with the only restriction being that you cannot use it to build a competing no-code animation builder.

Native CSS scroll-driven animations (`animation-timeline: scroll()`) are tempting and **not yet a replacement here**. Chrome and Safari 26+ support them; Firefox does not, which keeps them out of Baseline. Use them for decorative progress bars and reveals where a Firefox visitor losing the effect is acceptable, and keep ScrollTrigger for the hero. `references/scroll-engine.md` has the details and the exact ScrollTrigger config.

## Fallbacks are a first-class path, not an afterthought

Serve a static hero frame instead of the sequence when any of these hold:

- `prefers-reduced-motion: reduce` — this is an accessibility requirement, not a nicety
- `navigator.connection.saveData` is true
- Effective connection type is `slow-2g` or `2g`

Note what is **not** on that list: small viewports. The common advice is to skip the animation under 768px, but a 640px-wide AVIF ladder at 90 frames is a few hundred kilobytes, and phones are where most visitors are. Serve them the narrow ladder, not a JPEG. Dropping the effect for the majority of your traffic to save bytes you already saved is the wrong trade.

## Common failure modes

**Stutter during scroll.** Frames are decoding on the main thread. The engine uses `createImageBitmap` to decode off-thread and awaits every decode before starting — if you modified the preloader, check you did not reintroduce a bare `new Image()`.

**Blank flash at the start.** The animation started before preload resolved. The loading state must gate `ScrollTrigger.create`, not just the visual.

**Warping or morphing mid-sequence.** This is a generation problem, not a code problem. The source clip has an unstable middle. Regenerate with a slower, simpler camera move.

**Animating decoration instead of the product.** The sequence should show the thing being sold. An abstract shape morphing is expensive screensaver.

## References

Read these as needed rather than upfront:

- `references/scroll-engine.md` — ScrollTrigger + Lenis config, the pin/scrub math, native CSS scroll timelines
- `references/frame-pipeline.md` — extraction, encoding, the responsive ladder, manifest format
- `references/performance-budget.md` — how the numbers were chosen, what to cut first
- `references/remotion.md` — programmatic frame generation, and the licensing caveat
- `references/qa.md` — the pre-ship checklist
