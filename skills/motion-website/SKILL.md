---
name: motion-website
description: Build scroll-driven motion websites where a pinned hero is scrubbed by scroll — GSAP ScrollTrigger with Lenis, an image-sequence canvas by default, live WebGL (Three.js GLB) as an option. Use for scroll animation, scrollytelling, Apple-style product pages, frame extraction and encoding, image-sequence heroes, WebGL product heroes, or when a scroll hero stutters, jumps or loads slowly.
license: MIT
---

# Motion Website

Build a site where a pinned hero is owned by scroll progress. The default engine
plays a decoded image sequence on a `<canvas>`. The technique is simple. Doing
it without shipping a 200 MB hero or a stuttering canvas is the hard part, and
that is most of what this skill is about.

## What this skill contains

Paths below are relative to this skill's directory.

| Path | What it is |
|---|---|
| `assets/template/` | The frame-scrub site. Copy it into the project; edit only `config.js` |
| `assets/motion.config.json` | Frame counts, widths and the budget the gate enforces |
| `scripts/extract_frames.py` | Clip → evenly sampled PNG frames (ffmpeg) |
| `scripts/optimize_frames.py` | PNGs → AVIF/WebP ladder, posters and manifest (Pillow ≥ 11.3) |
| `scripts/check_budget.py` | The gate: exits 1 on a breach and prints what to cut |
| `scripts/compress_glb.sh` | Meshopt and WebP compression for a GLB (WebGL path only) |
| `references/` | The reasoning behind each default; read as needed |

The WebGL examples and the section-layout kit are larger than a skill and live
in the repository: <https://github.com/dimeloper/motion-site-kit>.

## The pipeline

```
source clip ──▶ extract N frames ──▶ responsive ladder ──▶ budget gate ──▶ site
   (video)         (ffmpeg)          (AVIF/WebP, 3 widths)   (CI fails      (canvas +
                                                              on breach)     ScrollTrigger)
```

Each stage has a script. Run them in order and do not hand-roll the middle two:
getting frame count and encoding wrong is what makes these sites heavy.

## Build order

Later steps depend on measurements from earlier ones. Skipping ahead to the
pretty part is how you end up rebuilding.

### 1. Establish the budget before generating anything

Copy `assets/motion.config.json` and `assets/template/` into the project root,
keeping the name `template/`: the config's `output` points at `template/frames`,
so rename both or neither. The config is the contract the gate enforces. Copy
the whole file; the abbreviated shape below omits limits the gate needs.

```json
{
  "frames": { "count": 120, "widths": [640, 960, 1600] },
  "formats": ["avif", "webp"],
  "budget": { "sequenceBytes": 8388608, "phoneRungBytes": 1500000, "phoneRungWidth": 960 }
}
```

**120 frames is the default and is almost always right.** At scroll speed the
visitor's scroll velocity sets the cadence, not the frame count. Doubling to 240
doubles the weight and looks the same.

Each rung above 960px may weigh 8 MiB per format. Every rung at or below 960px,
which is what phones download, gets a 1.5 MB ceiling. These are byte ceilings,
not load-time promises: 8 MiB takes about 42 seconds at 1.6 Mbit/s. See
`references/performance-budget.md` for where each number comes from.

A GLB for the WebGL path is budgeted separately. Never relax the sequence
budget to make room for a model.

### 2. Get the frames

```bash
python3 scripts/extract_frames.py input.mp4 --out frames/raw --count 120 --width 1600
```

Extraction samples evenly across the clip, so a 3-second and a 6-second clip
yield the same count with the same coverage. For programmatic or exactly
reproducible frames, read `references/remotion.md` first; Remotion is not MIT
licensed and has a headcount threshold.

### 3. Build the responsive ladder

```bash
python3 scripts/optimize_frames.py frames/raw --out template/frames --config motion.config.json
```

This writes `frames/{width}/{format}/{index}.{format}`, one poster per rung at
`frames/poster/{width}.webp`, and a `manifest.json` the runtime reads instead of
guessing file names. Each run clears the previous ladder first.

### 4. Gate on the budget

```bash
python3 scripts/check_budget.py --config motion.config.json
```

Exit code 1 on a breach, with a per-rung table. Put it in CI so a heavy sequence
cannot merge; a budget that is only checked when someone remembers is not a
budget. In GitHub Actions:

```yaml
- run: python3 path/to/check_budget.py --config motion.config.json --strict
```

`--strict` fails when no ladder exists. Leave it off in a repository that does
not commit frames.

If the gate fails, in order: drop the frame count to 90, lower AVIF quality from
60 to 50, crop tighter, simplify the source motion, and only then reduce the
maximum width to 1280.

### 5. Wire the site

Edit only `template/config.js`: copy, colours, fonts, section order. `src/motion.js` is the
engine and must not need changes between projects. If it does, something
belongs in config instead.

The template loads GSAP and Lenis from a CDN through an import map, so it runs
from any static host with no build step.

### 6. Verify

Run `references/qa.md`. The checks that catch real bugs: scroll back up and
confirm the sequence reverses without flicker; throttle to Slow 4G and confirm
the loader holds until preload completes; scroll past the hero while it loads
and confirm the page does not jump; and test on a real phone on cellular.

## The scroll engine

GSAP ScrollTrigger drives progress and Lenis smooths the input, on one RAF loop.
GSAP, ScrollTrigger included, has been free for commercial use since April
2025; the one restriction is building a competing no-code animation builder.

Native CSS scroll-driven animations are **not a replacement for the hero yet**.
Chrome and Safari 26+ support them; Firefox does not. Use them behind
`@supports` for decorative trim such as a progress bar, where a Firefox visitor
losing the effect costs nothing. `references/scroll-engine.md` has the exact
ScrollTrigger configuration and the rules for resizes, late pinning and modals.

## Fallbacks are a first-class path

Serve the static poster instead of motion when any of these hold:

- `prefers-reduced-motion: reduce`, which is an accessibility requirement
- `navigator.connection.saveData` is true
- The effective connection type is `slow-2g` or `2g`

Note what is **not** on the list: small viewports. Phones at 2x select the 960
rung and smaller-DPR screens the 640 rung, both under the 1.5 MB phone ceiling.
Dropping the effect for most of your traffic to save bytes already saved is the
wrong trade.

## Common failure modes

**Stutter during scroll.** Check decoding, draw cost and scroll scheduling
separately. Every compressed frame downloads before the pin engages; decoding is
then bounded by a `createImageBitmap` cache (128 MiB of RGBA by default,
including the in-flight decode) that prioritises the latest target when the
visitor reverses. Read `references/scroll-engine.md` before changing the cache.

**Blank flash at the start.** The animation started before preload resolved.
The loading state must gate the ScrollTrigger, not just the visuals.

**The page jumps when the hero finishes loading.** The pin spacer was inserted
above content the visitor had scrolled to. The template compensates; a fork
must too. Safari shows this where Chrome's scroll anchoring hides it.

**The sequence jumps as the mobile URL bar moves.** The pin length was tied to
`innerHeight`, or a resize handler forced a refresh. Measure in `svh` and
refresh only on a real size change.

**Warping or morphing mid-sequence.** A generation problem, not a code problem.
The source clip has an unstable middle; regenerate it with a slower, simpler
camera move.

**Animating decoration instead of the product.** The sequence should show the
thing being sold. An abstract shape morphing is an expensive screensaver.

## Optional: live WebGL

When the product should be a sculptural object with live light, use a Three.js
GLB hero instead of frames. The runtime and three worked examples (Harbor,
Vortex, Halo) are in the repository's `docs/examples/`, sharing one runtime in
`docs/examples/shared/`. Start from one of them rather than adding WebGL to the
frame template's engine.

Read `references/webgl-model.md` and the **WebGL hero** section of
`references/qa.md` before generating anything. Generating a model from a photo
uses Meshy through the Higgsfield MCP server, a paid third-party service. Without
it, use a GLB you are licensed to ship, build the object in code, or stay on
frames. Rings and other thin tubes must be built in code; image-to-3D cracks
them. If the model fails the visual gate, ship the frame engine with the same
poster rather than a broken canvas.

For the sections below the hero, compose from the repository's page kit
(`references/page-kit.md`) instead of copying another page's section list.

## References

Read these as needed rather than up front:

- `references/performance-budget.md`: where each budget number comes from and what to cut first
- `references/frame-pipeline.md`: extraction, encoding, the ladder, posters, the manifest and portrait phones
- `references/scroll-engine.md`: ScrollTrigger and Lenis wiring, pin maths, resizes, late pinning, modals
- `references/qa.md`: the pre-ship checklist and the automated suites
- `references/engine-selection.md`: frames, Three.js or the vgpu shader study, and when to add a library
- `references/webgl-model.md`: the asset decision tree, the visual gate and the WebGL fallbacks
- `references/page-kit.md`: composing the sections after the hero
- `references/remotion.md`: programmatic frames and the licensing caveat
