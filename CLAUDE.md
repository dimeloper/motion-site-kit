# Working in this repo

Context for agent sessions (Claude Code, Codex and others). Read this before
changing anything. `AGENTS.md` points here; keep this file the only copy.

## What this is

An open-source kit for scroll-driven motion websites: an agent skill
(`skills/motion-website/`) that carries a reskinnable frame-scrub template, plus
a GitHub Pages site (`docs/`) with WebGL and WebGPU examples and a page kit.
Positioned for a **developer audience**: the README leads with the pipeline and
the performance budget, not with pricing or income claims. Keep it that way.
Business or pricing material, if it ever exists, lives on a separate landing
page, not here.

## Layout

- `skills/motion-website/` is self-contained: `SKILL.md`, `references/`, `scripts/`, and `assets/` holding the template and `motion.config.json`. A copied skill directory must work on its own, so nothing inside it may be a symlink or point outside it.
- Root `template/` and `motion.config.json` are symlinks into `skills/motion-website/assets/`, so commands and CI read naturally from the root.
- `docs/` is what GitHub Pages serves. Pages cannot follow a symlink out of `docs/`, so `docs/src/` holds a copy of the frame engine. `scripts/sync_engine.py --write` updates it; CI fails on drift. Never edit `docs/src/{motion,frame-cache,validate-config,ladder}.js` directly.
- `docs/examples/{local,saas,commerce}` are Harbor, Vortex and Halo. They share one runtime in `docs/examples/shared/`: `hero.js`, `page-chrome.js`, `smooth-scroll.js` and `lifecycle.js`. Each example keeps only brand logic in its own `config.js` and `src/{bind,motion,page,scene}.js`.
- `docs/examples/vgpu/` is Fold. Its published build in `demo/` is committed, and `npm run check` there proves it matches the source byte for byte.

## Invariants — don't break these without a deliberate decision

**`template/config.js` is the only file that changes per frame-scrub project.**
Copy, colours, fonts, section order. The one exception is the static `<title>`
and meta description in `template/index.html`: `bind.js` rewrites both from
config, but crawlers and no-JS visitors read them before it runs, so they are
set by hand to match. If you find yourself editing
`template/src/motion.js` to build a specific site, something has leaked; push
it back into config. The WebGL examples are explicit forks with their own
runtime in `docs/examples/shared/`. Do not fold them into the frame engine.

**The budget gate is load-bearing.** `skills/motion-website/scripts/check_budget.py`
exits 1 on breach and CI runs it. Don't relax the numbers in
`motion.config.json` to make a build pass; the cut-list the script prints is
the intended response.

**The phone ceiling covers every rung phones select.** Phones at 2x and 3x pick
960 (DPR is capped at 2) and 1x or 1.5x small screens pick 640, so
`phoneRungWidth` is 960 and the 1.5 MB ceiling applies to both.
`tests/test_ladder.mjs` pins which rung each device gets. Moving the ceiling
back to 640 alone would let the rung phones download grow to 8 MiB.

**Phones get the animation.** The static fallback triggers on
`prefers-reduced-motion`, Save-Data and 2G only, never on viewport width.

**The loader is hidden by default.** `data-motion` starts at `static`;
`motion.js` sets `preloading` only once it has committed to running. If the
loader is ever visible before JS takes ownership, a visitor with JS disabled or
a failed module load watches a bar that never fills.

**Poster is a real `<img>`, canvas fades in over it.** If the canvas becomes the
LCP candidate, LCP is measured at the end of preload. The `<img>` loads
`frames/poster/{width}.webp` by fixed name; never point it at a frame index.

**Kit URLs share one version.** Every import of a `docs/kit/` module and every
link to its stylesheets carries the same `?v=`. `tests/test_kit.mjs` enforces
it. Bump them all together.

**WebGL scenes draw only when something changed.** Use `createFrameDriver()`;
pass `continuous: true` only when a shader animates on a clock (Harbor's motes).
Release through `releaseRenderer()` and dispose post-processing passes yourself.

## Verified facts (checked September 2026 — re-verify if this ages)

- **GSAP incl. ScrollTrigger**: free for commercial use since 30 Apr 2025. One carve-out — no building a competing no-code animation builder.
- **CSS scroll-driven animations** (`animation-timeline`): Chrome/Edge 115+, Safari 26+, **not Firefox** → not Baseline. Used behind `@supports` for the progress bar only. The hero stays on ScrollTrigger.
- **GSAP `ignoreMobileResize`** defaults to true on touch devices, so GSAP itself ignores height-only resizes there. Our own resize handlers must not undo that.
- **Lenis 1.3** ignores `overflow: hidden` on the root unless `autoToggle` is set, and cancels wheel events while `stop()`ped. Menus lock scroll with `lenis.stop()`. `scrollTo()` clamps to a page height Lenis caches until its ResizeObserver fires; call `lenis.resize()` before scrolling into space that was just added.
- **Safari 26 on iOS ignores `theme-color`.** It paints the area behind its status bar and toolbar from the body's `background-color`, unless a `position: fixed` element with a background sits at that edge and spans most of the width; the top strip must start at the edge (`top: 0`), not above it. `docs/src/edge-tint.js` uses this for the landing page's dark hero; verified on an iPhone 17, 2026-09-26.
- **Safari 26.6** has no scroll anchoring (`overflow-anchor` is unsupported), so layout inserted above the viewport moves the page. Chrome and Firefox anchor. The late-pin test therefore lives in the Safari suite; the Chrome version switches anchoring off to approximate it.
- **three r170** `EffectComposer.dispose()` does not dispose passes, and `WebGLState` leaves four 1×1 placeholder textures per renderer that `renderer.dispose()` never deletes.
- **Remotion**: not MIT. Free up to 3 people, Company License at 4+. A solo freelancer is free if the deliverable is rendered output; handing over the Remotion project aggregates both headcounts. Optional path only — ffmpeg extraction is the license-free default.
- **Pinned versions**: gsap 3.15.0, lenis 1.3.26, three 0.170.0, Pillow ≥11.3 (AVIF), vgpu 0.4.1.

## Bugs already found and fixed — don't reintroduce

1. Frames written to `template/public/frames` while the page requested `/frames`. Output path is `template/frames`, served from `template/`.
2. `check_budget.py` exited 2 when no manifest existed, so CI was red on every fresh clone (frames are gitignored). It now skips cleanly; `--strict` opts into failing.
3. Hero stuck on a permanent "Loading" bar when modules failed to load. See the loader invariant above.
4. `extract_frames.py` used `-vsync 0`, which FFmpeg 9 removed. It now prefers `-fps_mode passthrough` and falls back to `-vsync 0` on older builds.
5. Halo below-hero sections painted as raw HTML (`1. 01` on an `<ol>`, Grain at intrinsic 1200px). Kit families must not use `<ol>`/`<ul>` for designed lists, the demo CSS must constrain `[data-kit] img` plus any rail, and every kit URL shares one version.
6. The phone budget sat on the 640 rung while every real phone fetched 960, which had the 8 MiB desktop ceiling.
7. The poster `<img>` named `0039.webp`; any other frame count left the LCP image 404ing.
8. When the pin engaged after a slow preload, Safari jumped the page by the full pin length under a visitor who had scrolled past the hero. The first fix still fell about 900px short in Safari until Lenis re-measured before scrolling.
9. The frame engine's resize handler called `ScrollTrigger.refresh()` unconditionally and the pin length used `innerHeight`, so a collapsing mobile URL bar jumped the sequence.
10. The examples' menus set `overflow: hidden`, which Lenis ignores; the hero scrolled behind the open dialog.
11. Halo never disposed its bloom pass, and no scene freed its PMREM target or rect-area lookup textures, so each bfcache restore leaked GPU memory on the reused context.
12. Vortex and Halo rendered every frame while idle; Halo ran a full bloom composite 60 times a second for an unchanging image.
13. The kit's `el()` rendered a literal `0` for an empty list guard, and `inferFamily` classified the catalog's own stat-stack sample as hours.

## What's stubbed

- **Photoreal source clips for the frame path.** The template's demo ladder is a studio capture.
- **Asset provenance.** `docs/examples/ASSETS.md` marks several images and both GLBs' generation terms as not recorded. Fill those in, or replace the files, before anyone reuses them outside the demos.
- **Portrait ladders.** Landscape frames are cover-cropped to a centre strip on portrait phones. A 9:16 ladder switched by orientation would be a fork of `motion.js`; see "Portrait phones" in `references/frame-pipeline.md`.

## Verifying a change

```bash
# full pipeline against a synthetic clip
ffmpeg -f lavfi -i "testsrc2=size=1920x1080:rate=30:duration=4" -pix_fmt yuv420p /tmp/hero.mp4
python3 skills/motion-website/scripts/extract_frames.py /tmp/hero.mp4 --out frames/raw --count 90 --width 1600
python3 skills/motion-website/scripts/optimize_frames.py frames/raw --out template/frames --config motion.config.json
python3 skills/motion-website/scripts/check_budget.py --config motion.config.json --verbose

# serve and check
cd template && python3 -m http.server 8080
```

Expected on a clean run: 90 frames, about 0.49 / 0.94 / 2.80 MiB across the
three AVIF rungs, and the gate passes. The count is 90 on purpose: testsrc2 is
far noisier than product footage, and at 120 frames its 960px WebP rung (1.64
MiB) breaches the 1.5 MB phone ceiling. That failure is the gate working, not a
reason to raise the ceiling. `./scripts/use-demo-frames.sh` restores the demo
ladder afterwards.

In the browser, `[data-hero]` should reach `data-motion="ready"` and document
height should roughly double once the pin engages (2.1–2.2× at 1440×900
and 390×844 with the demo ladder).

The full check list is in the README under "Verification and maintenance".
`skills/motion-website/references/qa.md` is the pre-ship checklist. The items
that actually catch bugs: scroll back up (reverse exposes preload problems that
forward playback hides), throttle to Slow 4G, scroll past the hero while it
loads, and test on a real phone on real cellular — not the DevTools emulator,
which uses your desktop connection.

## Style

Prose in docs explains *why*, not just what. The reference docs are written to
be read by someone deciding whether to trust the defaults — if you add a
number, say where it came from.
