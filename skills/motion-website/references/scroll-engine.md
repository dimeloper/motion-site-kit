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

ScrollTrigger.create({
  trigger: '#hero',
  start: 'top top',
  end: () => `+=${window.innerHeight * SCROLL_LENGTH_VH}`,
  pin: true,
  scrub: 0.5,            // seconds of catch-up; 0 = rigid, >1 = floaty
  anticipatePin: 1,
  invalidateOnRefresh: true,
  onUpdate: (self) => {
    const next = Math.round(self.progress * (frameCount - 1));
    if (next !== state.frame) {
      state.frame = next;
      draw(next);
    }
  },
});
```

Two things people get wrong here:

**Scroll length.** `SCROLL_LENGTH_VH` of 3 to 4 is the usable range — the visitor scrolls three to four screen heights to play the sequence once. Below 2 the animation flies past; above 5 it feels like the page is stuck.

**Redrawing every update.** `onUpdate` fires far more often than the frame count changes. The `next !== state.frame` guard is what keeps this at 120 draws instead of thousands.

`scrub: 0.5` rather than `true` gives the canvas half a second of easing to catch up with a flung scroll. It hides the discrete frame steps and costs nothing.

## Canvas rendering

Decode off the main thread, once, before anything starts:

```js
async function preload(urls, onProgress) {
  let done = 0;
  return Promise.all(urls.map(async (url) => {
    const res = await fetch(url);
    const bitmap = await createImageBitmap(await res.blob());
    onProgress(++done / urls.length);
    return bitmap;
  }));
}
```

`createImageBitmap` hands back an already-decoded bitmap, so `drawImage` is a straight blit. The alternative — `new Image()` with a `load` handler — leaves decoding to happen lazily on first paint, which is the classic "stutters the first time through, smooth on the way back up" bug.

Size the canvas to the device pixel ratio and letterbox with `object-fit: cover` semantics computed in JS; scaling a canvas with CSS alone blurs it on retina displays.

Cap concurrency if the sequence is large — 120 simultaneous fetches will saturate the connection and delay the first frames. Six to eight at a time is a reasonable window.

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
