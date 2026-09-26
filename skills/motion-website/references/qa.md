# Pre-ship checklist

Run all of it. Within each section the items are ordered by how often they
catch something.

For a **live WebGL** hero, finish **WebGL hero** first. The Motion and Loading
items alone do not catch a cracked mesh, a product under the headline, or a
particle field that hugs the object.

## WebGL hero

Check in a **visible** tab, with `data-motion="ready"` and the canvas at
opacity 1. Background tabs throttle `requestAnimationFrame` and GSAP.

- [ ] **The asset path matches the decision tree** in `webgl-model.md`, and the model's source and terms are recorded in `docs/examples/ASSETS.md`.
- [ ] **The mesh is solid.** No cracked clay, no jagged reconstruction, no z-fighting from extra liner meshes. If the first GLB fails this, discard it.
- [ ] **Two-lane framing.** On desktop the copy is on the left and the product in the right third, never under the headline. Its longest on-screen axis is about 35–50% of the hero's height.
- [ ] **The supporting field fills the hero after the intro** and does not sit as a noisy shell on the mesh at rest.
- [ ] **The motion language is this page's own**, not another example's camera move.
- [ ] **The sections are composed, not cloned,** from the page kit, and every family is styled after a hard reload: no browser list markers, no still at its intrinsic width.
- [ ] **Idle means idle.** With the page still, the hero submits no draw calls unless its shader animates on a clock. Offscreen, it submits none at all.
- [ ] **The menu stops the page.** With the menu open, the wheel and trackpad do not scroll the hero behind it.
- [ ] **Weight.** The GLB went through `scripts/compress_glb.sh` and the loader sets `MeshoptDecoder`.
- [ ] **Poster and loader invariants** as for the frame engine below. Reduced motion, Save-Data, 2G and missing WebGL all show the poster.

## Motion

- [ ] **Scroll back up.** The sequence must reverse cleanly with no flicker and no dropped frames. Reverse is where preload bugs surface, because forward playback can hide lazy decoding.
- [ ] **Watch the middle third at slow scroll.** Scrubbing is slower than playback, so visitors spend the most time here. A warp or hitch invisible at 30 fps is obvious at scroll speed.
- [ ] **Fling the scroll.** A fast flick should catch up smoothly through `scrub`, not jump.
- [ ] **Scroll past the hero and back.** The pin must release and re-engage at the same position.
- [ ] **Resize the window mid-animation.** ScrollTrigger recalculates without the pin detaching.

## Loading

- [ ] **Throttle to Slow 4G, disable the cache, hard reload.** The loader holds until preload resolves. A single frame of blank canvas is the bug this catches.
- [ ] **Scroll well past the hero while it is still loading.** When the pin engages, the content you are reading must stay where it is. Check in Safari, which does not use scroll anchoring to hide a jump.
- [ ] **The poster paints immediately** from `frames/poster/` and is the LCP element, not the canvas.
- [ ] **Check the network panel for the rung being fetched.** A phone should fetch 960 or 640, never 1600.

## Phones

- [ ] **Portrait at 390×844.** The subject stays readable in the centre strip the cover crop leaves visible, about a quarter of the frame's width. See "Portrait phones" in `frame-pipeline.md`.
- [ ] **Collapse and expand the URL bar mid-sequence** in iOS Safari and Android Chrome. The frame must not jump.
- [ ] **A real phone on real cellular data.** Not the DevTools emulator, which uses your desktop's connection and decoder. This is the most skipped step and the one that most often shows the site is unusable.
- [ ] **A low-end Android device** if you can get one. Drawing a 960px frame every scroll update is not free.

## Fallbacks

- [ ] **Turn on reduced motion in the OS.** The page shows the static poster and stays fully readable and navigable, with no pinned section and no dead scroll space.
- [ ] **Turn on Data Saver** in Chrome and confirm the fallback triggers.
- [ ] **Disable JavaScript.** The content is still there, the poster still loads, and no loader is visible.

## Browsers

- [ ] **Safari on iOS and macOS.** AVIF decoding, canvas performance and scroll anchoring differ from Chrome enough to matter.
- [ ] **Firefox desktop.** Confirms the ScrollTrigger path where native scroll timelines do not exist.

## Accessibility

- [ ] Keyboard alone reaches every link and control, including anything inside the pinned section.
- [ ] The pinned section does not trap focus or make skipping it impossible.
- [ ] Text over the animation meets 4.5:1 contrast **against the brightest frame**, not just the poster.
- [ ] The canvas is `aria-hidden="true"` and the hero carries a real text description of what the animation shows.

## Budget

- [ ] `python3 scripts/check_budget.py --config motion.config.json` passes.
- [ ] Lighthouse on mobile: performance ≥ 90, LCP < 2.5 s.

## Automated checks

In the repository, these cover what a script can:

```bash
python3 -m unittest discover -s tests -p 'test_*.py'
node --test tests/*.mjs
npm ci --prefix scripts/hero-clip
npm run test:motion --prefix scripts/hero-clip        # Chrome; set CHROME_PATH off macOS
```

For Safari, turn on Settings → Developer → Allow remote automation, then:

```bash
safaridriver -p 4444                                   # in a separate terminal
node scripts/hero-clip/test-safari.mjs
```

To run the same checks on a physical iPhone, unlock it, trust the Mac and turn
on Safari's Remote Automation setting on the phone. Pass its UDID and a URL the
phone can reach. `127.0.0.1` is the Mac, not the phone, and WebGPU needs HTTPS.

```bash
SAFARI_DEVICE_UDID="your-device-udid" \
SAFARI_BASE_URL="https://dimeloper.github.io/motion-site-kit" \
node scripts/hero-clip/test-safari.mjs
```

To test the local build instead, give the Mac's address on the phone's Wi-Fi.
The script then serves `docs/` on that address itself, which also runs the
late-pin check (it has to hold frame responses, so it cannot run against a
URL it does not serve). `xcrun devicectl list devices` shows the UDID.

```bash
SAFARI_DEVICE_UDID="your-device-udid" \
SAFARI_LAN_HOST="$(ipconfig getifaddr en0)" \
node scripts/hero-clip/test-safari.mjs
```

The explicit UDID keeps the run off the simulator. Plain HTTP on a LAN address
is not a secure context, so Fold stays on its poster in both LAN runs.
[Apple's WebDriver guide](https://webkit.org/blog/9395/webdriver-is-coming-to-safari-in-ios-13/)
covers the device setting.

### What automation does not prove

The browser suites use software GPU rendering and scripted scrolling. They
prove behaviour: fallbacks, recovery, memory bounds, reverse output, idle
drawing and leaks. They do not prove cellular load times, production LCP,
frame-time distributions, thermals, battery use, or how a touch fling feels.
Those need the manual Phones section above.
