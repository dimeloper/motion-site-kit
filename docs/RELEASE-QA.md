# Release QA — 10 September 2026

The user authorized committing and pushing all project work, native Safari QA,
physical-iPhone QA and documentation updates. No performance budget was relaxed.

## Verified behavior

| Environment | Evidence | Result |
| --- | --- | --- |
| macOS Safari 26.6.2, Apple SafariDriver | Docs frame forward/reverse canvas comparison; Harbor, Vortex and Halo initialization, menus and context-loss fallback; Fold live WebGPU and champagne finish; catalog search/selection | Pass |
| Chromium, local suite | 29 scenarios covering runtime failure/recovery, bitmap bounds, WebGL suspension, menus, Fold, docs/catalog and complete recipes | Pass on 10 September |
| Firefox 151.0.3 | Frame forward/reverse, forced no-WebGPU Fold fallback, reduced motion | Three smoke checks pass |
| Python / Node | 12 budget regressions and 17 cache/config tests | Pass on 10 September |
| Asset/build gates | Strict committed frame ladder, model/JS limits, example mirrors, reproducible Fold build and all three posters | Pass on 10 September |

Safari runs the installed browser through Apple's WebDriver, using local pinned
vendor packages. This is native Safari behavior evidence, not a WebKit emulator.
The test captures first, forward and reverse views under `out/safari-qa/` and
writes its capabilities and observations to `results.json`. Generated screenshots
remain local and ignored. The loaders must finish exiting before first screenshots.

## Physical device and publication

The connected iPhone 17 Pro is paired, running iOS 26.6.1. SafariDriver currently
reports that it is locked, so physical-device behavior is pending; the simulator
was not substituted for the requested hardware QA.

Implementation commit `1871b94` was pushed to `main`. Its
[Pages deployment](https://github.com/dimeloper/motion-site-kit/actions/runs/34439116308)
succeeded. All six native Safari checks also passed against the public HTTPS site,
including real CDN imports and Fold's live WebGPU path. Published-site screenshots
and observations are under `out/safari-production-qa/`.

The first [motion CI run](https://github.com/dimeloper/motion-site-kit/actions/runs/34439116615)
failed on Halo's offscreen GPU-draw assertion. Review found that the shared
IntersectionObserver callback used the first entry in a potentially batched
delivery. It now applies entries in order so the newest visibility wins. A
regression explicitly batches an earlier visible crossing with the final offscreen
crossing; it fails against the previous implementation and passes for all three
corrected examples. Commit `198fc27` passed the full
[motion CI run](https://github.com/dimeloper/motion-site-kit/actions/runs/34439662420)
and [Pages deployment](https://github.com/dimeloper/motion-site-kit/actions/runs/34439661296).

The Linux CI WebGPU device fell back during the first canvas transition. The
harness now checks that transition's fallback state and records adapter errors,
preserving the first error before disposal. CI therefore verifies Fold's poster
recovery, while local Chromium and native macOS Safari establish live rendering;
Linux GPU rendering parity is not claimed.

## Reproduce

From the repository root, with pinned test dependencies installed:

```bash
# Separate terminal; enable Safari > Settings > Developer > Allow remote automation.
safaridriver -p 4444
node scripts/hero-clip/test-safari.mjs

# Physical phone: unlock, trust the Mac, and enable Safari Remote Automation.
SAFARI_DEVICE_UDID="your-connected-device-udid" \
SAFARI_BASE_URL="https://dimeloper.github.io/motion-site-kit" \
node scripts/hero-clip/test-safari.mjs
```

The explicit UDID and `safari:useSimulator: false` prevent accidental simulator
results. A phone cannot reach the Mac through `127.0.0.1`; use a reachable host.
Plain LAN HTTP cannot establish Fold's secure-context WebGPU path.
[Apple's setup guide](https://webkit.org/blog/9395/webdriver-is-coming-to-safari-in-ios-13/)
explains the separate device Remote Automation setting.

## Limits

No actual-cellular, Android-device, production LCP, frame-time distribution,
thermal or battery-efficiency result is claimed. A USB automation connection does
not establish the phone's network route. WebDriver DOM scrolling and scripted
menu actions cover behavior, not a complete manual touch/gesture audit.

## Composition release candidate

The 10 September composition revision adds four section families, complete
recipes, Halo's portfolio and Fold v3. All 29 Chromium scenarios pass locally.
The six native Safari checks also pass against the local revision, including
Fold live WebGPU; these observations are under `out/composition-safari/`.
Recipe toolbar/export behavior and complete desktop/phone recipe layouts are
covered in Chromium. Physical iPhone QA remains blocked as described above.

Fresh-directory onboarding copied all 120 demo frames byte-for-byte without
installing Node or media tools. Python/Node tests, strict frame budgets, model
and source gates, mirror alignment and Fold source/build equivalence pass.
Remote CI and publication of this revision still require the release step.
