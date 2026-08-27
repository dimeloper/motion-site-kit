# Working in this repo

Context for Claude Code sessions. Read this before changing anything.

## What this is

An open-source kit for scroll-driven motion websites: a Claude skill (`skills/motion-website/`) plus a reskinnable template (`template/`). Positioned for a **developer audience** — the README leads with the pipeline and the performance budget, not with pricing or income claims. Keep it that way. Business/pricing material, if it ever exists, lives on a separate landing page, not here.

## Invariants — don't break these without a deliberate decision

**`template/config.js` is the only file that changes per frame-scrub project.** Copy, colors, fonts, section order. If you find yourself editing `template/src/motion.js` to build a specific site, something has leaked — push it back into config. Optional engines (WebGL orbit, particles, float layers) live as explicit forks under `docs/examples/` — see `skills/motion-website/references/webgl-model.md`. Do not fold them into the template frame engine.

**The budget gate is load-bearing.** `skills/motion-website/scripts/check_budget.py` exits 1 on breach and CI runs it. Don't relax the numbers in `motion.config.json` to make a build pass — the cut-list the script prints is the intended response.

**Phones get the animation.** The static fallback triggers on `prefers-reduced-motion`, Save-Data, and 2G only — never on viewport width. The 640px rung exists precisely so small screens don't need to be excluded. Reverting to a width-based cutoff undoes a deliberate choice.

**The loader is hidden by default.** `data-motion` starts at `static`; `motion.js` sets `preloading` only once it has committed to running. If the loader is ever visible before JS takes ownership, a visitor with JS disabled or a failed module load watches a bar that never fills.

**Poster is a real `<img>`, canvas fades in over it.** If the canvas becomes the LCP candidate, LCP is measured at the end of preload.

## Verified facts (checked Aug 2026 — re-verify if this ages)

- **GSAP incl. ScrollTrigger**: free for commercial use since 30 Apr 2025. One carve-out — no building a competing no-code animation builder.
- **CSS scroll-driven animations** (`animation-timeline`): Chrome/Edge 115+, Safari 26+, **not Firefox** → not Baseline. Used behind `@supports` for the progress bar only. The hero stays on ScrollTrigger.
- **Remotion**: not MIT. Free up to 3 people, Company License at 4+. A solo freelancer is free if the deliverable is rendered output; handing over the Remotion project aggregates both headcounts. Optional path only — ffmpeg extraction is the license-free default.
- **Pinned versions**: gsap 3.15.0, lenis 1.3.26, Pillow ≥11.3 (AVIF).

## Bugs already found and fixed — don't reintroduce

1. Frames written to `template/public/frames` while the page requested `/frames`. Output path is `template/frames`, served from `template/`.
2. `check_budget.py` exited 2 when no manifest existed, so CI was red on every fresh clone (frames are gitignored). It now skips cleanly; `--strict` opts into failing.
3. Hero stuck on a permanent "Loading" bar when modules failed to load. See the loader invariant above.
4. `extract_frames.py` used `-vsync 0`, which FFmpeg 9 removed. It now prefers `-fps_mode passthrough` and falls back to `-vsync 0` on older builds.

## What's stubbed

- **Photoreal source clips for the frame path.** Template and some stills still use studio captures. Harbor (`docs/examples/local/`) is the live WebGL craft reference (Meshy GLB + flour motes). **Vortex** (`saas/`, CAD titanium band: peel and seat). Next: **Halo** (`commerce/`, material peel) — read **Starting Halo** + the **WebGL hero** gate in `skills/motion-website/references/webgl-model.md` and `qa.md` before generating anything. Do not show a WebGL hero until that gate is green.

## Verifying a change

```bash
# full pipeline against a synthetic clip
ffmpeg -f lavfi -i "testsrc2=size=1920x1080:rate=30:duration=4" -pix_fmt yuv420p /tmp/hero.mp4
python3 skills/motion-website/scripts/extract_frames.py /tmp/hero.mp4 --out frames/raw --count 120 --width 1600
python3 skills/motion-website/scripts/optimize_frames.py frames/raw --out template/frames --config motion.config.json
python3 skills/motion-website/scripts/check_budget.py --config motion.config.json --verbose

# serve and check
cd template && python3 -m http.server 8080
```

Expected on a clean run: 120 frames, ~0.6 / 1.3 / 3.7 MB across the three AVIF rungs, gate passes. In the browser, `[data-hero]` should reach `data-motion="ready"` and document height should roughly double once the pin engages.

`skills/motion-website/references/qa.md` is the pre-ship checklist. The items that actually catch bugs: scroll back up (reverse exposes preload problems forward playback hides), throttle to Slow 4G, and test on a real phone on real cellular — not the DevTools emulator, which uses your desktop connection.

## Style

Prose in docs explains *why*, not just what. The reference docs are written to be read by someone deciding whether to trust the defaults — if you add a number, say where it came from.
