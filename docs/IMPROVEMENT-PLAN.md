# Motion kit improvement plan

Authorized 9 September 2026. Continue this scoped roadmap until complete or the user stops it. Preserve existing frame limits, config-only frame reskins, phone animation, hidden loaders and real posters. The initial scope excluded publication; on 10 September the user authorized committing and pushing all work. Do not purchase services or redeem reset credits. Scoped local implementation is complete, including the requested Fold redesign. External release checks and conditional experiments are recorded below rather than treated as passing work. Hourly continuation `continue-motion-site-improvements` is paused at this checkpoint.

## Implemented and verified

- Frame gate measures on-disk bytes for all advertised formats, checks complete frame sets, rejects empty/extraneous files and stale totals, validates manifest shape, and retains optional clean-clone skipping. CI uses strict checks on the committed `docs/frames` ladder.
- Corrected numeric GSAP scrub with linked proxy tweens in the frame engine and all three WebGL demos.
- Frame loading has a deadline, shared cancellation, stale-initialization guards, cleanup on failures and page lifecycle, and explicit bitmap disposal.
- Added bounded bitmap cache. Compressed frames remain in memory; decoded frames plus one in-flight decode fit the default 128 MiB RGBA budget. Latest target outranks speculative neighbours after a fling/reversal.
- Replaced the broken AVIF capability probe; browser tests prove AVIF selection and forced WebP fallback.
- WebGL demos own pins, listeners, Lenis tickers, model fetches and scene resources. They stop drawing offscreen, resume onscreen, restore posters on context loss, and dispose late model results. Halo model failures now show the real poster rather than a flat plane masquerading as a model. Vortex retains its poster while loading.
- `docs/examples` is canonical for WebGL craft. `scripts/sync_examples.py` generates the `examples/` mirrors and copies the frame engine from `template/src` to `docs/src`. Existing published Vortex density/opacity is preserved. CI checks alignment.
- Added separate model (2 MiB each) and first-party JS (128 KiB per example including shared code) gates, with rationale in the script. These do not measure CDN modules, total image transfer or decoded texture memory.
- Added 12 Python budget regression tests, 17 JavaScript cache/config tests and 23 Chromium browser scenarios. Browser tests cover forward/reverse image output, format fallback, reduced motion, missing images, timeouts, overlapping initialization, late decode failure, page restoration, desktop bitmap accounting, all three demos' offscreen suspension/context loss, and Halo model failure.
- Updated README and scroll-engine reference to describe the implemented memory and lifecycle contracts. Pinned local test dependencies make tests independent of CDN modules. Puppeteer upgraded to 25.10.0; Node 22.12+ required. npm audit reported zero vulnerabilities after upgrade.

- Added configuration validation, cache argument checks and dynamic reduced-motion recovery. All three demos pass keyboard/menu axe checks. Fixed a reproduced animated-menu race where an old close timer hid a newly reopened menu; close completion is now idempotent and queued opening callbacks are guarded.
- Added the isolated Fold vgpu 0.4.1 study, authored WGSL, native-rendered poster, on-demand rendering, capability/deadline/device-loss fallback, pinned Vite build, bundled notices and a reproducible build gate. Current v2 JS is 44,256 bytes at gzip level 9; the silver poster is 191,805 bytes and every finish poster is below 202 KB. Existing template remains build-free.
- Exported both Fold shader versions into 120 PNG frames with provenance, encoded all six AVIF/WebP ladders for each, and passed the original budgets. The archived v1 config-only Fold reskin passed the frame browser reverse/memory test; v2 is an asset comparison, not a newly reviewed template reskin. Generation commands and exact bytes are in `docs/examples/vgpu/FRAME-COMPARISON.md`; generated frames/site stay ignored under `frames/raw-fold`, `frames/raw-fold-v2` and `out/`.
- Added local page-resource observations and model texture inspection in `docs/MEASUREMENTS.md`. Harbor and Halo each embed 12 MiB calculated base RGBA textures (~16 MiB with mipmaps). Vortex's stored GLB is unused: its active scene constructs a CAD band.
- Optimized Harbor's two delivery images from 3,158,919 to 766,074 bytes (75.7% smaller), retaining JPEG sources and recording hashes. The same local page harness fell from 6,577,522 to 4,185,866 bytes. WebP mirrors are generated with existing example copies.
- Updated Codex/Claude skill installation, engine selection, stale full-decode guidance, provenance and measurement documentation. The standalone canvas assessment now reflects implemented work.

## Evidence and limits

- Chromium live-bitmap RGBA accounting peaked at 126.6 MiB (390×844 viewport, DPR 2, 960px rung) and 126.3 MiB (1440×900, DPR 1, 1600px rung). Compare with calculated full-decode footprints of 237.3 and 659.2 MiB respectively. This is bitmap width × height × 4 accounting, NOT browser process-memory measurement.
- Reverse tests confirm the correct first-frame asset returns and compare canvas pixels with a small rasterization tolerance. Mean channel difference was ~0.097/255 on the phone-sized viewport and zero on desktop.
- At the local implementation checkpoint, real phones, actual cellular conditions, Safari, production LCP and frame-time percentiles were unverified. See [release QA](RELEASE-QA.md) for subsequent Safari and device evidence. Fold and optimized Harbor images were visually inspected; automated axe coverage is limited to tested states. Firefox 151.0.3 passes three local smoke checks: frame forward/reverse, Fold without WebGPU, and reduced-motion fallback. Broader Firefox scene/visual parity is not claimed. Headless Chromium uses a software WebGL allowance for behavior tests; do not present it as GPU performance evidence.
- Correction to the original assessment: example frame ladders are gitignored, untracked legacy local outputs. They are neither published by a clean checkout nor loaded by the live WebGL demos. Harbor's legacy 640px WebP ladder exceeds the newly enforced limit, but it is not a shipped asset; no images or frame sequences were modified to hide that finding. Root `docs/frames` remains committed and passes all format budgets.
- Initial user files `.codex/` and `AGENTS.md` retain their contents and are included in the subsequently authorized commit-all scope.

## Completion review

- **Verification complete locally.** 12 Python tests, 17 JS tests and the full 23-scenario Chromium suite passed before the v2 redesign. All three vgpu scenarios pass on v2, including a new regression for finish selection and reduced-motion changes during pending initialization (24 scenarios now defined). Three Firefox smoke checks now pass using installed Firefox 151.0.3 with WebDriver BiDi; Chromium remains the CI baseline. Strict committed-frame and both Fold-frame budgets, model/source gates, mirror alignment, vgpu source/build equivalence, per-finish poster limits and diff whitespace pass. No budget was relaxed.
- **Fold review and redesign complete.** Reviewed public GetLayers/Vesper previews, rebuilt the page around a sculptural sheet and oversized type, added three working finishes with static equivalents, self-hosted Manrope and redesigned the material sections. Desktop and phone-sized screenshots were reviewed. The [design review](examples/vgpu/DESIGN.md) records the rationale and limits. Current measurements distinguish v2 from archived v1.
- **Lifecycle review complete within demonstrated failures.** Reviewed scene allocation and cancellation paths alongside the passing model-failure, late-result and context-loss coverage. This is not proof against arbitrary driver/allocation failures; no speculative scene rewrite was added without a reproduced failure.
- **Documentation complete.** Updated installation, engine selection, provenance, current transfer figures, build sizes and the interactive assessment. Historical Fold data is explicitly labeled.

## External follow-ups and conditional decisions

These are not completed validation or prerequisites for finishing this local implementation scope:

1. Actual cellular conditions, Android hardware, production LCP, frame-time distributions and power use need dedicated verification. Safari and iPhone release evidence is tracked in [release QA](RELEASE-QA.md). Desktop emulation must not be presented as real-phone QA.
2. Publication was authorized on 10 September. Release and remote CI results are tracked in [release QA](RELEASE-QA.md).
3. A photoreal flagship is conditional on suitable authored/licensed footage. Fold supplies a reproducible procedural source; no paid generation or arbitrary local leftovers were used.
4. KTX2 and Three.js WebGPURenderer/TSL remain deliberate conditional experiments. The measured texture baseline is available. Establish a specific memory/visual target and equivalent comparison before adding a transcoder or migrating live scenes; adding a library alone is not an improvement.

The continuation is paused because actionable scoped local work is complete. Resume with new design feedback, device access or a release instruction rather than repeatedly running unchanged checks.

## Running checks

Use `npm ci --prefix scripts/hero-clip` once. Chrome is installed at `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`; override with `CHROME_PATH` elsewhere. Python budget tests use the system Python; `.venv/bin/python` has Pillow if media pipeline work is needed. The browser test server serves pinned local packages and shuts down after tests.

## Completed follow-on: docs and example design review

User authorized a GetLayers-quality review and redesign of the docs site and remaining examples, with continuation after usage resets. This follow-on scope is complete locally; the hourly continuation is paused again.

- [x] Audit rendered docs, page kit, Harbor, Vortex and Halo at desktop/mobile sizes.
- [x] Rebuild docs as a developer-facing showcase with clear navigation, actual visual examples and usable pipeline documentation.
- [x] Improve each remaining example's distinctive visual identity and lower-page composition; correct misleading imagery or broken placeholder destinations found in review.
- [x] Improve page-kit catalog navigation and presentation.
- [x] Verify affected interactions, accessibility, responsive layouts, motion invariants and budgets; sync canonical examples.
- [x] Record evidence and limitations and pause continuation when this scoped redesign is complete.

Follow-on evidence: see [design review](DESIGN-REVIEW.md). The full 26-scenario Chromium run passes; three Firefox smoke checks pass. Follow-up docs checks cover the corrected 320px graphic and catalog behavior. Updated screenshots were reviewed for first screens and selected lower sections. Subsequent Safari, real-hardware and remote CI status is tracked in [release QA](RELEASE-QA.md).

## Release follow-on — 10 September 2026

All implementation and design work was committed and pushed as `1871b94`. Native
macOS Safari passes the docs, three WebGL examples, Fold live WebGPU and catalog
checks both locally and on the published HTTPS site. Release QA found and repaired
a batched IntersectionObserver visibility bug; device prerequisites and the
follow-up CI result are tracked in [release QA](RELEASE-QA.md).

## Active follow-on: composition quality and onboarding

Authorized after the release checkpoint on 10 September. Track current progress
in [WORK-IN-PROGRESS.md](WORK-IN-PROGRESS.md), open beside the task. The hourly
continuation is active again for this scope: four new story sections, four full
page recipes with desktop/mobile preview and export, Halo portfolio rebuild,
Fold material refinement, public-copy review and beginner onboarding. Earlier
completion notes refer to the previous scoped pass. Commit/push authorization
continues; physical iPhone QA still needs the unlocked device.
