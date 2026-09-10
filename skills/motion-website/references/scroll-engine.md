# Scroll engine

## Contents

- [Why GSAP and not native CSS](#why-gsap-and-not-native-css)
- [Lenis + ScrollTrigger wiring](#lenis--scrolltrigger-wiring)
- [The pin and scrub math](#the-pin-and-scrub-math)
- [Canvas rendering](#canvas-rendering)
- [Where native CSS scroll timelines do fit](#where-native-css-scroll-timelines-do-fit)

## Why GSAP and not native CSS

Native scroll-driven animations (`animation-timeline: scroll()` / `view()`) are real and shipping, but not everywhere:

| Browser | Support |
|---|---|
| Chrome / Edge | 115+ (July 2023) |
| Safari / iOS Safari | 26+ (September 2025) |
| Firefox | Not supported |

Firefox's absence is what keeps the feature out of Baseline. For a hero that *is* the page, a browser where it silently does nothing is not an acceptable degradation — so the hero stays on ScrollTrigger.

GSAP's licensing is no longer a reason to avoid it. Since 30 April 2025 the standard no-charge license covers commercial use of the whole library including ScrollTrigger, SplitText, and the other formerly members-only plugins. The one carve-out: you may not use GSAP to build a no-code visual animation builder that competes with Webflow.

## Lenis + ScrollTrigger wiring

Both libraries want to own the scroll loop. Lenis must drive GSAP's ticker, not run its own RAF, or the two desynchronize and the canvas lags the page by a frame or two — which reads as "cheap" without being obviously broken.

```js
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const lenis = new Lenis({
  duration: 1.1,          // higher = more glide; above ~1.4 feels laggy on trackpads
  smoothWheel: true,
  syncTouch: false,       // leave native momentum alone on touch devices
});

// Lenis reports its position to ScrollTrigger...
lenis.on('scroll', ScrollTrigger.update);

// ...and GSAP's ticker drives Lenis, so there is exactly one RAF loop.
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);
```

`lagSmoothing(0)` matters. GSAP's default lag smoothing jumps the timeline forward after a stall, which on a scrubbed sequence shows up as a visible frame skip right after the preloader finishes.

## The pin and scrub math

```js
const state = { frame: 0 };
let lastDrawn = -1;
gsap.to(state, {
  frame: frameCount - 1,
  ease: 'none',
  onUpdate: () => {
    const next = Math.round(state.frame);
    if (next !== lastDrawn) {
      draw(next);
      lastDrawn = next;
    }
  },
  scrollTrigger: {
    trigger: '#hero',
    start: 'top top',
    end: () => `+=${window.innerHeight * SCROLL_LENGTH_VH}`,
    pin: true,
    scrub: 0.5,
    anticipatePin: 1,
    invalidateOnRefresh: true,
  },
});
```

Two things people get wrong here:

**Scroll length.** `SCROLL_LENGTH_VH` of 3 to 4 is the usable range — the visitor scrolls three to four screen heights to play the sequence once. Below 2 the animation flies past; above 5 it feels like the page is stuck.

**Redrawing every update.** `onUpdate` fires far more often than the frame count changes. Guard repeated frame indices to avoid redundant draws. Reverse playback legitimately draws the same frame again.

`scrub: 0.5` smooths the linked animation playhead. A standalone ScrollTrigger callback reading `self.progress` is still raw scroll progress; setting numeric scrub there does not smooth custom canvas draws. Use the tween’s `onUpdate`, as above.

## Canvas rendering

Fetch compressed blobs with a bounded request window, then decode the target and
nearby frames through `template/src/frame-cache.js`. The default 128 MiB RGBA
budget includes the in-flight bitmap; at 1600×900 it holds about 23 frames.
Keeping all 120 decoded would require roughly 659 MiB before canvas and browser
overhead. Compressed blobs stay available, so reversing may decode again but
does not need a second network fetch.

The cache prioritizes the latest target after a fling or direction change. The
renderer keeps its previous image until the requested bitmap is ready, then
redraws even if the scroll playhead has stopped. Always test reverse playback:
an animation playhead moving correctly does not prove the canvas updated.

`createImageBitmap` returns decoded images for `drawImage`; it does not itself
guarantee a particular browser thread or total process-memory footprint. The
budget accounts for width × height × four bytes, and real-device profiling
remains required. Image data is checked for consistent dimensions while decoding.

Size the canvas with capped DPR and cover semantics. Concurrency defaults to
eight compressed-frame requests. A loading deadline restores the poster; aborted
runs release their cache, pin, resize listener and Lenis ticker. Native decoding
may finish after cancellation, and that late bitmap is explicitly closed.

## Where native CSS scroll timelines do fit

Use them for the parts of the page where a Firefox visitor seeing a static element instead of an animated one costs nothing:

```css
@supports (animation-timeline: scroll()) {
  .progress-bar {
    animation: grow linear both;
    animation-timeline: scroll(root block);
  }
  .section-reveal {
    animation: fade-up linear both;
    animation-timeline: view();
    animation-range: entry 10% cover 40%;
  }
}
```

Wrapped in `@supports`, these cost zero JavaScript and run on the compositor. Progress indicators, section reveals, parallax backgrounds, and sticky-header state are all good candidates. The pinned hero sequence is not.
