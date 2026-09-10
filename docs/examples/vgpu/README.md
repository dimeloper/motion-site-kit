# Fold: an isolated vgpu material study

Fold is an authored WGSL surface whose folds and lighting change with scroll. Its current
page integrates an original sculptural metal sheet, oversized typography,
three selectable finishes and an editorial material close-up.
It explores procedural materials without importing a model or changing the
default frame engine. This is a stylized shader study, not photoreal footage.
The shader and page were authored for this MIT-licensed repository; the poster
is rendered from the same shader, with no stock or generated media dependency.

Serve the repository's `docs` directory and open
`http://localhost:8080/examples/vgpu/demo/`. The checked-in `demo/` build runs
from a static host. WebGPU requires a secure context (HTTPS or localhost).

## Development

```bash
npm ci --prefix docs/examples/vgpu
npm run dev --prefix docs/examples/vgpu
npm run build --prefix docs/examples/vgpu
npm run check --prefix docs/examples/vgpu
```

Only this optional example needs Vite. `source/` is canonical; `demo/` is its
generated publish directory. The check rebuilds into a temporary directory,
compares every published byte, and enforces separate JS/poster ceilings.
The existing three WebGL mirrors do not include this experiment.

With native WebGPU available, `npm run poster --prefix docs/examples/vgpu`
regenerates all three 1200×900 finish PNGs. It also checks that forward progress changes
pixels and reverse progress restores them exactly. Run `build` afterward.
Native poster rendering is not required to serve the committed fallback.

## Runtime contract

- The real poster loads independently and stays visible until the first draw.
- Reduced motion, Save-Data, 2G, or missing WebGPU avoids importing the engine.
- Initialization gets ten seconds before restoring the poster, so a stalled
  adapter cannot leave a blank stage or an indefinitely extended scroll track.
- Rendering responds to scroll, resize and visibility; it has no idle loop.
- Device loss, rendering errors and page exit dispose the GPU context and
  restore the short static layout. Returning through the browser's page cache
  remains static; reload to try the GPU again.
- DPR is capped at 1.5 to bound render-target pixels on dense phone screens.
  Width alone never disables motion.

## Evidence, 10 September 2026

Pinned vgpu 0.4.1 and Vite 8.2.2. The current production build contains 44,377
bytes of JavaScript after gzip level 9 across both chunks. Silver, champagne
and graphite posters are 211,111, 212,279 and 203,531 bytes respectively.
These are build sizes, not measured HTTP transfer
or an assurance that every host enables gzip. The separate limits are 56 KiB
gzip JS and 400 KiB per poster, unchanged from the original prototype.
Manrope is self-hosted with its OFL license. Finish selection works in the
static fallback too, using the corresponding rendered poster.

Native Metal rendering passed on macOS 26.6.2 arm64. Chromium tested forward,
reverse and device-loss fallback with WebGPU enabled; unsupported-GPU behavior
is tested separately. Browser tests explicitly report when WebGPU is unavailable
and only the fallback could run. Software rendering allowances in the test
runner make these behavior checks unsuitable as GPU-speed benchmarks.

Firefox 151.0.3 passed the no-WebGPU poster smoke check; this does not
verify live WebGPU in Firefox. Real-phone power use and actual cellular transfer
remain unverified. Live rendering and finish selection pass in macOS Safari 26.6.2; see
[release QA](../../RELEASE-QA.md). Frame-time percentiles remain unmeasured. Compare an equivalent rendered sequence before
claiming this is faster or lighter than the frame engine. A procedural shader
does not replace the default engine's ability to display arbitrary footage.

See [vgpu documentation](https://vgpu.sh) and
[the source project](https://github.com/vercel-labs/vgpu). The bundled vgpu MIT
notice is included in `demo/THIRD-PARTY-LICENSE.txt`.

The [baked-frame comparison](FRAME-COMPARISON.md) includes the reproducible
export command, config-only frame reskin, provenance and all six sequence sizes.

See [design review](DESIGN.md) for the GetLayers reference assessment and the
changes from the first prototype. The frame comparison distinguishes the
archived v1 and v2 materials. The current v3 lighting has matching rendered
posters; its full baked-frame sequence has not been measured.
