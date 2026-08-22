# Pre-ship checklist

Run all of it. The items are ordered by how often they catch something.

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
