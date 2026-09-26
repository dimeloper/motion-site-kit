# Choosing a motion engine

Keep the frame template as the default for arbitrary rendered or filmed content.
Choose an optional engine when its visual requirement earns the additional
runtime and maintenance. GSAP is already part of the kit; adding a library is
useful only when it changes what the visitor can see or do.

## Frames + GSAP ScrollTrigger

Use for product footage, camera moves with expensive lighting, or exact art
direction baked into a sequence. The responsive AVIF/WebP pipeline and byte gate
already exist. The linked GSAP proxy tween now makes numeric `scrub` control
catch-up instead of drawing raw scroll progress.

The bounded bitmap cache trades some repeat decoding for a predictable RGBA
limit. Evaluate rapid reversals as well as slow forward scroll. Budget compressed
bytes separately from decoded memory; neither proves frame time or LCP.

## Three.js GLB examples

Use the Three.js examples (Harbor, Vortex and Halo in the repository's
`docs/examples/`) when real mesh geometry, physical materials or camera movement
is needed. They share one runtime in `docs/examples/shared/`: fallback decision,
lifecycle, Lenis, the pin, and a frame driver that draws only when something
changed. Load errors and lost contexts return to the poster, and nothing is
drawn while the hero is offscreen. Meshopt compression keeps each GLB near 1 MB.

[WebGPURenderer](https://threejs.org/docs/pages/WebGPURenderer.html) and
[TSL](https://github.com/mrdoob/three.js/wiki/Three.js-Shading-Language) are a
possible migration path, not a drop-in dependency bump. Prototype the most
shader-heavy scene first, pin the version, and compare materials, transparent
particles, shadows and the WebGL2 fallback. A successful compile alone does not
prove the published look survives. Keep that work separate from the default
frame engine and retain a poster when neither renderer works.

## vgpu: procedural materials

[Fold](https://github.com/dimeloper/motion-site-kit/blob/main/docs/examples/vgpu/README.md) is the implemented experiment:
a deterministic WGSL material controlled by scroll, with an independent poster,
lazy engine import and device-loss fallback. It needs no GLB or sequence on the
live path. Its shader is also an authored source for a baked-frame comparison.

Use this for a surface, lighting response or field that can be expressed compactly
in a shader. Keep the visual relevant to the page. It is not a substitute for
arbitrary footage or a guarantee of lower power consumption. Its build check
prints the gzipped JavaScript size of the actual build against a 56 KiB ceiling,
rather than relying on vgpu's own size claim.
See [vgpu's source and documentation](https://github.com/vercel-labs/vgpu).

## Additional libraries: adopt against a measured need

**KTX2/Basis:** evaluate when textures dominate decoded GPU storage. Compare
compressed transfer, transcode/startup time, quality and texture residency on
actual target devices. Harbor and Halo each contain three 1024px textures, calculated as 12 MiB
base RGBA or about 16 MiB with mipmaps. These asset estimates exclude
environment maps and render targets; see the [measurement report](https://github.com/dimeloper/motion-site-kit/blob/main/docs/MEASUREMENTS.md).
Vortex builds its band in code and ships no model. See
[KTX2Loader](https://threejs.org/docs/pages/KTX2Loader.html).

**GSAP SplitText:** useful for a small number of editorial headings that need
word/line choreography. Preserve semantic text and reduced motion, and measure
layout shifts around font loading. Avoid animating every heading by default.
See [SplitText documentation](https://gsap.com/docs/v3/Plugins/SplitText/).

**Motion/native scroll timelines:** consider for a DOM-only fork. Introducing a
second scroll owner inside an existing pinned GSAP hero adds coordination work.
CSS effects already sit behind feature detection; retain that progressive
fallback. See [Motion's scroll API](https://motion.dev/docs/scroll).

## Evidence required before promoting an experiment

Compare equivalent content and viewport/DPR, then report the actual device,
browser, engine versions, network conditions and test procedure. Record bytes,
first visible motion, reverse-scroll output, frame-time distribution and memory
with the scope of each metric stated. CPU/software-rendered browser tests prove
behavior, not phone GPU throughput or battery life. Real-phone cellular QA is
still a release step for this kit.
