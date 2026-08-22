# motion-site-kit

A Claude skill and a reskinnable template for building scroll-driven motion websites — a pinned `<canvas>` playing a decoded image sequence, scrubbed by scroll position.

Live demo: [dimeloper.github.io/motion-site-kit](https://dimeloper.github.io/motion-site-kit/)

The technique is not the hard part. Shipping it without a 200 MB hero, a stuttering canvas, or a page that abandons phone visitors is the hard part. That's what's in here.

```
source clip ──▶ extract N frames ──▶ responsive ladder ──▶ budget gate ──▶ site
   (video)         (ffmpeg)          (AVIF/WebP, 3 widths)  (CI fails      (canvas +
                                                             on breach)     ScrollTrigger)
```

## What's in the box

| Path | What it is |
|---|---|
| `skills/motion-website/` | The Claude skill: build recipe, reference docs, pipeline scripts |
| `template/` | The site. Edit `config.js`; `src/motion.js` stays identical between projects |
| `motion.config.json` | Frame counts, widths, and the performance budget CI enforces |
| `.github/workflows/budget.yml` | The gate that refuses a merge when the sequence gets heavy |
| `scripts/vendor.sh` | Optional: vendor GSAP + Lenis locally instead of loading them from a CDN |
| `examples/` | Deployed demos |

## Quick start

```bash
git clone https://github.com/dimeloper/motion-site-kit
cd motion-site-kit
pip install "Pillow>=11.3"          # AVIF + WebP encoding
# ffmpeg must be on PATH for extraction

# 1. frames from a clip
python3 skills/motion-website/scripts/extract_frames.py hero.mp4 \
  --out frames/raw --count 120 --width 1600

# 2. responsive AVIF/WebP ladder + manifest
python3 skills/motion-website/scripts/optimize_frames.py frames/raw \
  --out template/frames --config motion.config.json

# 3. the gate
python3 skills/motion-website/scripts/check_budget.py --config motion.config.json

# 4. serve
cd template && python3 -m http.server 8080
```

Then edit `template/config.js` — copy, colors, fonts, section order. Nothing else needs to change.

### No CDN

The template resolves GSAP and Lenis through an import map pointed at a CDN, so it runs from any static host with no toolchain. To drop the third-party runtime dependency entirely:

```bash
./scripts/vendor.sh
```

This installs both packages, copies their ESM builds into `template/vendor/`, and rewrites the import map to local paths. Worth doing for client work, where a CDN outage taking the hero with it is your problem, not theirs.

## Using it as a Claude skill

```bash
cp -r skills/motion-website ~/.claude/skills/
```

It triggers on scroll animations, pinned heroes, image sequences, GSAP ScrollTrigger, Lenis, and on debugging questions like "why does my scroll animation stutter."

## Design decisions worth knowing about

**120 frames, not 300.** At scroll speed the visitor's scroll velocity sets the perceived cadence, not the frame count. Going 120 → 240 doubles page weight for a difference nobody identifies blind.

**Phones get the animation.** The common advice is to disable the sequence under 768px. The 640 rung is a few hundred kilobytes, and phones are most of the traffic — so the kit ships them a narrow ladder instead of a JPEG. The static fallback is reserved for `prefers-reduced-motion`, Save-Data, and 2G, where it's an actual user signal rather than a guess based on screen size.

**The budget is a CI job, not a README line.** These sequences don't get heavy by decision; they grow half a megabyte per iteration while everyone's looking at the visuals. `check_budget.py` exits 1 and prints what to cut, in order.

**GSAP for the hero, native CSS for the trim.** Scroll-driven CSS animations (`animation-timeline: scroll()`) ship in Chrome 115+ and Safari 26+ but not Firefox, which keeps them out of Baseline. The kit uses them behind `@supports` for the progress bar and section reveals, where a Firefox visitor losing the effect costs nothing, and keeps ScrollTrigger for the hero, where it doesn't.

**Decode off the main thread.** Frames preload through `createImageBitmap`, not `new Image()`. Lazy decoding on first paint is the cause of the classic "stutters going down, smooth coming back up" bug.

**The poster is a real `<img>`.** If the canvas is the LCP candidate and stays blank until 120 frames decode, LCP is measured at the end of preload — a bad score for a page that felt instant.

## Licensing of the dependencies

| | License | Notes |
|---|---|---|
| This kit | MIT | Including the skill and scripts |
| GSAP + ScrollTrigger | Free, commercial use included | Since April 2025. One carve-out: no building a competing no-code animation builder |
| Lenis | MIT | |
| Remotion | **Not MIT** | Free up to 3 people; a Company License at 4+. Optional path only — see below |

The Remotion caveat matters for client work: a solo freelancer can use it free if the deliverable is the rendered output, but handing over the Remotion project itself aggregates both headcounts toward the 4-person threshold. If you ship source to clients, keep them on the ffmpeg path. Details in [`skills/motion-website/references/remotion.md`](skills/motion-website/references/remotion.md).

## Requirements

- Python 3.10+ with `Pillow>=11.3` (AVIF support)
- `ffmpeg` and `ffprobe` on PATH
- Any static host

## Docs

- [Scroll engine](skills/motion-website/references/scroll-engine.md) — ScrollTrigger + Lenis wiring, pin/scrub math
- [Frame pipeline](skills/motion-website/references/frame-pipeline.md) — extraction, encoding, the ladder, manifest format
- [Performance budget](skills/motion-website/references/performance-budget.md) — where the numbers come from, what to cut first
- [Remotion](skills/motion-website/references/remotion.md) — programmatic frames, and when they're worth it
- [QA checklist](skills/motion-website/references/qa.md) — run this before shipping

## License

MIT. See [LICENSE](LICENSE).
