# Current work

Updated 10 September 2026. This is the checklist for the approved design and onboarding work. The composition release is published. Only physical iPhone QA needs user action.

## Implemented and checked locally

- [x] Add four shared sections: visual chapters, expanding image, project index and image comparison.
- [x] Rebuild Halo around named kit studies, varied project imagery and quieter ring lighting.
- [x] Add four complete page recipes: product, studio, hospitality and material exhibition.
- [x] Add desktop/mobile composition previews and configuration export.
- [x] Support explicit section order in the page planner.
- [x] Refine Fold's lighting and form, add a finish comparison, and regenerate matching posters.
- [x] Write a direct onboarding guide covering preview, setup, customization and publishing.
- [x] Pass 29 Chromium scenarios, six native macOS Safari checks, Python and JavaScript checks, and existing asset budgets.

## Final review complete

- [x] Finish visual review of complete recipes: improve the product hero's object framing and inspect lower sections on mobile.
- [x] Verify the recipe browser's selector, viewport controls and JSON export together.
- [x] Finish the public-copy review, including static HTML fallbacks and gallery previews.
- [x] Update design notes, asset provenance, measurements and release QA to match the latest implementation.
- [x] Check onboarding commands and reconcile the README, kit guidance and improvement plan.

## Release

- [x] Run the remaining checks after final edits and inspect the diff.
- [x] Commit and push the finished work.
- [x] Confirm CI and the published GitHub Pages site match the release.

## Needs user action

- [ ] Physical iPhone QA: the paired phone was locked when SafariDriver last checked. An unlocked phone with Safari Remote Automation enabled is required. Desktop Safari and mobile emulation do not complete this item.

## Continuation

The composition scope is complete and published as `1845a45`. Both [motion checks](https://github.com/dimeloper/motion-site-kit/actions/runs/34505969794) and [Pages deployment](https://github.com/dimeloper/motion-site-kit/actions/runs/34505969302) passed. Six native Safari checks pass on the live site, including Fold WebGPU.

Hourly continuation is paused because the only remaining item needs the unlocked physical phone. Resume it when that prerequisite changes or new work is authorized; usage resets alone cannot unlock the device. No credits were purchased or redeemed.

Keep the default frame engine config-only, preserve the existing budgets, and retain animation on phones and poster fallbacks. Update this checklist after verified milestones. Pause continuation when the scoped work is complete or only user action remains.

See [onboarding](ONBOARDING.md) and the [full improvement plan](IMPROVEMENT-PLAN.md).
