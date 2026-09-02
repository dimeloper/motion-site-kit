# Pre-ship checklist

Run all of it. The items are ordered by how often they catch something.

For a **live WebGL** hero (Harbor / Vortex / Halo), finish **WebGL hero** below *before* asking anyone to look. That list is what Vortex's cracked ring, under-headline framing, and tight halo would have failed — the Motion/Loading items alone would not have caught them.

## WebGL hero

Run in a **visible** browser tab (`data-motion="ready"`, canvas opacity 1). Background tabs throttle `requestAnimationFrame` and GSAP.

- [ ] **Asset path matches the decision tree** in `webgl-model.md`. Genus-1 rings are CAD. DualSense / hollow cups / mixed sticks were not sent through Meshy. A Sketchfab (or other) link was checked for `isDownloadable` + a named license before anyone promised the file.
- [ ] **Mesh is solid.** No cracked clay, no jagged reconstruction, no z-fighting from extra liner/inlay meshes. If the first GLB fails this, discard it — do not ship and "see what they think."
- [ ] **Two-lane framing.** Desktop: type left, product in the right third, **not under the headline**. Longest on-screen product axis is about **35–50% of hero height** (close enough to read materials; not a postage stamp; not cropped at the top).
- [ ] **Supporting field fills the hero after intro.** Particles or peel shards land on the object first, then expand across the hero after a short beat. At rest they are not a noisy shell that makes a good mesh look cracked.
- [ ] **Motion language is this vertical's.** Harbor = orbit. Vortex = particle peel → seat. Halo = rings lift off stone and seat on reverse. Not a third orbit and not a particle halo.
- [ ] **Page is composed**, not cloned. If the demo is new, sections come from `docs/kit/` and do not match Vortex's modules / feel / builds / about / cta.
- [ ] **Composed sections are styled, not raw HTML.** After a hard reload: no browser `1. 2. 3.` on ascent, no still at intrinsic width (1200px Grain). `sections.css` is cache-busted with the JS. The demo CSS resets `[data-kit] img` and any rail.
- [ ] **Loader invariant.** `data-motion` starts `static`; `preloading` only after JS commits. No `requestAnimationFrame` wait in the loader path.
- [ ] **Poster is a real `<img>`**; canvas fades in over it. Reduced-motion / Save-Data / 2G / no WebGL still show the poster.
- [ ] **Weight.** GLB went through `scripts/compress_glb.sh`; loader has `MeshoptDecoder`. Canonical file under `docs/examples/*/models/`; `examples/` is a symlink.
- [ ] **Phones get the animation** — no width cutoff.

Then continue with Motion / Loading / Fallbacks / Devices below (reverse scroll, Slow 4G, real phone).

## Motion

- [ ] **Scroll back up.** The sequence must reverse cleanly with no flicker, no reload, no dropped frames. Reverse is where preload bugs surface, because forward playback can mask lazy decoding.
- [ ] **Watch the middle third at slow scroll.** Scrubbing is slower than playback, so the visitor spends the most time here. Warping, morphing, or a hitch that is invisible at 30fps is obvious at scroll speed.
- [ ] **Fling the scroll.** A fast flick should catch up smoothly via `scrub`, not jump.
- [ ] **Resize the window mid-animation.** ScrollTrigger should recalculate (`invalidateOnRefresh: true`) without the pin detaching.
- [ ] **Scroll past the hero and back.** The pin must release and re-engage at the same position.

## Loading

- [ ] **Throttle to Slow 4G, disable cache, hard reload.** The loading state must hold until preload resolves. A single frame of blank canvas is the bug this catches.
- [ ] **Poster frame paints immediately** and is the LCP element, not the canvas.
- [ ] **Check the network panel** for the actual rung being fetched. Serving the 1600 ladder to a phone is a silent, expensive mistake.

## Fallbacks

- [ ] **Enable reduced motion at the OS level** (macOS: Accessibility → Display → Reduce motion). The page must show the static poster and remain fully readable and navigable. No pinned section, no dead scroll space.
- [ ] **Enable Data Saver** in Chrome and confirm the fallback path triggers.
- [ ] **Disable JavaScript.** The content should still be there. If the sections only exist to be revealed by GSAP, they vanish — put them in the HTML and animate from a visible resting state.

## Devices

- [ ] **A real phone on real cellular data.** Not the DevTools device emulator, which uses your desktop connection and desktop decoding. This is the single most skipped step and the one that most often reveals the site is unusable.
- [ ] **Safari on iOS**, specifically. AVIF decode and canvas performance differ from Chrome enough to matter.
- [ ] **Firefox desktop.** Confirms the ScrollTrigger path works where native scroll timelines do not exist.
- [ ] **A low-end Android device** if you can get one. Canvas blitting at 1600px is not free.

## Accessibility

- [ ] Keyboard alone can reach every link and control, including anything inside the pinned section.
- [ ] The pinned section does not trap focus or make skipping it impossible.
- [ ] Text over the animation meets 4.5:1 contrast **against the brightest frame**, not just the poster. Check the frame where the subject is lightest.
- [ ] The canvas has an `aria-hidden="true"` and the section carries a real text description of what the animation shows.

## Budget

- [ ] `python3 scripts/check_budget.py` passes.
- [ ] Lighthouse on mobile: performance ≥ 90, LCP < 2.5s.
- [ ] Total page transfer under 10 MB on the largest rung.
