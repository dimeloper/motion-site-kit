# Publish plan

Working document for taking motion-site-kit from its current state to a public
v1.0. Derived from the September 2026 review. Delete this file once the release
is tagged; it is not a permanent doc.

## Status — 26 September 2026, `main`

PR #1 (`publish-readiness`) is merged. Phases 0 to 6 are done, one commit per phase. Phase 7 is done except for the
items only you can do, listed at the end of this section. On the last full run:

| Suite | Result |
|---|---|
| Python (gate, example gate, end-to-end pipeline) | 26 pass |
| Node (decode cache, config, rung selection, page kit) | 91 pass |
| Chrome browser suite | 41 pass |
| Safari 26.6.2 via safaridriver | 7 pass, including the new late-pin check |
| Frame gate on `docs/frames`, example gate, engine sync, Fold build check | pass |
| Skill copied from the commit into an empty project, SKILL.md followed | pipeline, gate and page all work; a 3x phone fetched only the 960 AVIF rung |

Where the work differs from the plan below, and why:

- **Poster (1.2):** setting the poster from JavaScript would hide it from the preload scanner and delay LCP. The pipeline writes `frames/poster/{width}.webp` instead and the HTML uses a fixed `srcset`.
- **Pin shift (1.3):** a reserved margin would show several blank screens. The engine keeps the content under the viewport in place when the pin engages. Testing in real Safari found the first version still jumped about 900px, because Lenis clamps to a stale page height; it now calls `lenis.resize()` first, and the Safari suite checks it.
- **Mobile resize (1.5):** GSAP already ignores height-only resizes on touch devices. The template's own handler was undoing that, so the fix is in the handler and the pin length now uses the `svh` hero height.
- **Frame cap (1.6):** the runtime bound is now a documented 1000-frame sanity check, separate from the budget.
- **Family count (4.7):** instead of rendering the count from JavaScript, `tests/test_kit.mjs` fails if any page states a count that differs from the renderers.
- **Kit tests (6.1)** found three real selector bugs, now fixed.

Still open, and yours to do:

1. **Real-phone QA on cellular** (7.2): portrait crop, URL-bar collapse, fling feel, battery. Nothing automated covers these.
2. ~~**Physical iPhone Safari run.**~~ Done 2026-09-26 on an iPhone 17, iOS 26.6.2 (Safari reports 26.6.1), over Wi-Fi with `SAFARI_LAN_HOST`: all 7 checks pass, including the late pin at 0px moved. Control: `main`'s engine moved the page 2499px on the same phone, so the check can fail there. Fold stayed on its poster, as expected over plain HTTP.
3. **Asset provenance:** `docs/examples/ASSETS.md` marks the Unsplash photographers, the Halo images and the Meshy and Recraft plan terms as not recorded. Fill them in or replace the files before calling the assets reusable.
4. ~~**Push, let CI run, merge.**~~ Done: PR #1 merged 2026-09-26. Still to do: tag `v1.0.0` and delete this file in the same commit (7.6).
5. **v1.1 candidates:** a portrait 9:16 ladder, and starting the scrub before every frame has downloaded.

Each phase leaves `main` green. Run the full check list at the end of every
phase, not just at the end:

```bash
python3 -m unittest discover -s tests -p 'test_*.py'
node --test tests/*.mjs
python3 skills/motion-website/scripts/check_budget.py --frames docs/frames --strict
python3 scripts/check_example_budget.py
python3 scripts/sync_engine.py --check
npm run check --prefix docs/examples/vgpu
npm run test:motion --prefix scripts/hero-clip
```

## Definition of publishable

- Every invariant in CLAUDE.md is true in the code, and a test proves it.
- No number in a doc disagrees with the config or script that enforces it.
- Nothing in the repo describes a feature that does not exist.
- A developer who copies the skill into `~/.claude/skills` gets a skill that works.
- The Pages site contains docs, not session logs.
- Every binary asset has recorded provenance and a license.
- One copy of everything.

---

## Phase 0: Decisions (half a day)

Decide these first. Later phases depend on them.

1. **Skill portability.** Two options:
   - (a) Make the skill self-contained: move `template/` into `skills/motion-website/assets/template/`, and have SKILL.md reference only paths inside the skill. The repo root keeps a thin README and the examples.
   - (b) Declare the dependency: SKILL.md states up front that it must be run from a clone of this repo and links the clone command.
   - Recommendation: (a). The README already tells people to copy the skill directory; a skill that breaks after being copied is worse than no skill.
2. **Phone rung strategy.** The 640 rung is never selected by a real phone (see Phase 1, task 1). Options:
   - (a) Select the rung by covered area instead of viewport width, so a 390x844 portrait phone at 2x DPR asks for the rung that covers a 1688px tall canvas. This will pick 1600 and makes phones heavier, not lighter.
   - (b) Keep width-based selection, accept that phones get 960, and move the tight budget to the 960 rung.
   - (c) Add a portrait ladder (crop the source to 9:16 at extraction, encode a second ladder, pick by orientation). Most correct, most work.
   - Recommendation: (b) now, (c) as a documented v1.1 follow-up. Rename `narrowRungWidth` semantics so the budget applies to "the rung phones fetch", and say so in the docs.
3. **Delete `examples/`.** Yes unless there is a reason not to. Nothing consumes it.
4. **Session-log docs.** Delete `docs/WORK-IN-PROGRESS.md`, `docs/IMPROVEMENT-PLAN.md`, `docs/DESIGN-REVIEW.md`. Move the reproduce steps from `docs/RELEASE-QA.md` into `skills/motion-website/references/qa.md`, then delete it. Trim `docs/MEASUREMENTS.md` to the current revision only.
5. **Higgsfield MCP.** Either remove `.cursor/` and `.codex/` from the repo (add to `.gitignore`) or keep them and disclose in README and SKILL.md that the Meshy path needs a paid third-party MCP.

---

## Phase 1: Template invariants (1 to 2 days)

All in `template/src/` unless noted. Mirror to `docs/src/` with `sync_examples.py --write` at the end.

1. **Rung selection and budget.** Per the Phase 0 decision. If (b): change `motion.config.json` so the tight ceiling applies to 960, update the cut-list text in `check_budget.py` and the tables in `performance-budget.md`, and remove the "640 serves the most visitors" claims from CLAUDE.md, SKILL.md, README.md and `check_budget.py`. Add `tests/test_pick_width.mjs` that exercises `pickWidth` for the iPhone SE, iPhone 15, Pixel 8, iPad and a 1440 laptop and asserts the intended rung. Export `pickWidth` from `motion.js` to make that possible.
2. **Poster from config, not markup.** Remove the two hard-coded `frames/960/webp/0039.webp` paths in `template/index.html`. Add `hero.poster` to `config.js` and have `bind.js` set both the `<img src>` and the `<link rel=preload>` from it. The manifest cannot be read before first paint without delaying the LCP image, so `optimize_frames.py` prints the exact config line to paste instead. Add a test that runs the pipeline with `--count 90` and asserts the poster resolves.
3. **Reserve the pin height during preload.** In `styles.css`, give `.hero[data-motion="preloading"]` a `margin-bottom` equal to the scroll length so the page does not shift when the pin engages. `bind.js` sets `--scroll-length` from `CONFIG.motion.scrollLengthVh`. Remove the margin at `ready`. Add a browser test: scroll to 2000px during preload, wait for `ready`, assert the element under the viewport centre did not change.
4. **Progressive start, or drop the claim.** SKILL.md says the engine "starts after the first frame is ready". Either implement it (create the frame cache after the first N blobs, keep the preload running, pass late blobs into the cache) or delete the sentence. Recommendation: delete the sentence for v1.0, file progressive start as v1.1.
5. **Mobile resize.** Add `ScrollTrigger.config({ ignoreMobileResize: true })` next to `registerPlugin`. Verify on a real phone that the sequence no longer jumps when the URL bar collapses. Record the check in `qa.md`.
6. **Single source for frame limits.** `motion.js` line 235 hard-codes 150. Either read it from the manifest (have `optimize_frames.py` copy `frameCountMax` into the manifest) or document that the client cap is deliberately fixed.
7. **Escape config strings in `bind.js`.** `renderSections` uses `innerHTML`. Use `textContent` and `createElement` so a `<` in copy does not break the page.

---

## Phase 2: Example runtimes (2 days)

All in `docs/examples/`. Run `sync_examples.py --write` after, or skip if `examples/` is deleted in Phase 4.

1. **Lenis scroll-lock.** In each `page.js` `open()` and `close()`, replace the `overflow: hidden` toggle with `lenis.stop()` and `lenis.start()`. Expose the Lenis instance from `shared/lifecycle.js` instead of the per-brand window globals. Add a browser test: open the menu, dispatch a wheel event, assert `scrollY` is unchanged.
2. **Halo bloom leak.** In `commerce/src/scene.js` `release()`, call `bloom.dispose()` before `composer.dispose()`, and dispose the composer before the renderer. Add a browser test that triggers `pagehide` then `pageshow` three times and asserts `renderer.info.memory.textures` returns to its baseline.
3. **Idle render loops.** Make rendering scroll-driven for Vortex and Halo: render on ScrollTrigger `onUpdate`, on resize, and during the intro tween only. Harbor keeps its loop for the motes but must pause it when the hero is offscreen or the tab is hidden. Copy the pattern from `vgpu/source/main.js`. Add a browser test that counts `requestAnimationFrame` calls over one second with no scroll and asserts zero for Vortex and Halo.
4. **Double anchor scroll.** Exclude `[data-nav-menu]` links in `wireInPageAnchors` in each `motion.js`, matching the exclusion already in `page.js`.
5. **Consolidate the three copies.** Move into `shared/`: `shouldUseStaticFallback`, `hasWebGL` (and release the probe context), `initSmoothScroll`, `wireInPageAnchors`, loader helpers, `showStaticFallback`, `bindScrollScene`, `initMenu`, `syncLoaderCount`, `watchHero`, `studioEnvironment`, `fitOnPlate`, renderer setup, `resize`, and the `loop/setActive/dispose` trio. Each example's `motion.js` should shrink to its scene wiring. Target: no function longer than ten lines duplicated across the three.
6. **Dead code.** Remove `envMapIntensity ?? 1.25`, `userData.billboard`, `fillTween`, the duplicated resize/render pair in `local/motion.js`, and the `preventDefault` on `contextlost` with no restore handler.
7. **Breakpoints to config.** One `mobileBreakpoint` per example `config.js` replaces the four different values across `motion.js` and `scene.js`. Particle counts and proximity timings move too.
8. **A11y.** Give the `aria-label` div in `saas/index.html` a role or remove the label. Remove `aria-live` from static text in `local/index.html`. Either render Halo's `<main data-kit>` server-side or drop the no-JS claim in `docs/README.md`.

---

## Phase 3: Documentation correctness (1 day)

1. `performance-budget.md`: change "~4s on Slow 4G" to the 42 second figure and show the arithmetic. Change the frame floor to match `frameCountMin` in the config, or raise the config to 90 and say why. Change the cut-list AVIF step to start from the actual default of 60.
2. `check_budget.py` and `extract_frames.py`: make the printed text match the enforced numbers (cut-list quality, count warning range).
3. `frame-pipeline.md`: fix the manifest example so `poster` is at one third, the numbers are valid JSON, and the `pickWidth` snippet matches the code.
4. `engine-selection.md`, `MEASUREMENTS.md`, `vgpu/README.md`: one Fold bundle size, generated by `check-build.mjs` rather than typed.
5. Remove every mention of particle-field and float-layer engines from SKILL.md frontmatter, SKILL.md body, `webgl-model.md`, `engine-selection.md`, `qa.md` and CLAUDE.md. Harbor's motes are a scene detail, not an engine.
6. `webgl-model.md` and `qa.md`: remove the symlink claim. Describe whatever Phase 4 leaves behind.
7. SKILL.md: move the Higgsfield section below the build order, state the MCP dependency and cost in its first sentence, and say what to do without it. Remove project lore ("Vortex burned rounds", "Starting Vortex", Sketchfab ids, "The third vertical failed"). Keep decisions, drop history.
8. README: mark the Codex skill discovery claim as re-verify, like the other verified facts. Add `three` 0.170.0 to the pinned list in CLAUDE.md.
9. Add a short "Portrait phones" section to `frame-pipeline.md` and `qa.md` explaining that a landscape source is cropped to a centre strip on portrait viewports and what to do about it.

---

## Phase 4: Repository hygiene (half a day)

1. `git rm -r examples/`. Update README, `docs/README.md`, `examples/README.md` links to `docs/examples/`. Reduce `sync_examples.py` to the `template/src` to `docs/src` mirror, or delete it if Phase 0 chose to move the template into the skill and serve docs from a build step.
2. `git rm docs/src/bind.js docs/examples/saas/models/ring.glb`. Remove the dead `hero`, `sections` and `cta` blocks from `docs/config.js`. Fix the "Codex / Claude skill" line in `docs/index.html`.
3. Delete the session-log docs per Phase 0. Update the links in `docs/README.md` and README.
4. Make `CLAUDE.md` canonical. Replace `AGENTS.md` with three lines pointing at it. Add Fold, the GLB gate, and the `docs/src` mirror to the invariants section.
5. Provenance: add `docs/examples/ASSETS.md` listing every JPG, WebP and GLB with source, author, license and generation tool. Add `docs/assets/social-preview.jpg` to `preview-provenance.json`.
6. `.cursor/` and `.codex/`: per Phase 0.
7. Version-lock the kit: `sections.css` `@import` gets the same `?v=` as the JS, and `recipes.js` and `story-sections.js` are versioned. Replace the three hard-coded "34" strings with a count derived from the catalog at render time.

---

## Phase 5: Pipeline scripts (half a day)

1. `optimize_frames.py`: delete `{width}/{format}/` directories before writing so a lower count leaves no stale files. Warn when a requested width exceeds the source width and record the real width in the manifest.
2. `extract_frames.py`: refuse to run if `--out` contains PNGs that do not match the `tmp_` or four-digit pattern, or require `--force`. Match the warning text to the checked range.
3. `check_budget.py`: report MiB where MiB is measured. Drop the unused `AssertionError` in the except clause.
4. Add `tests/test_pipeline.py` that runs the three scripts against a two-second synthetic clip at `--count 60` and asserts the manifest, the file count, and a passing gate. Mark it skip when ffmpeg or Pillow AVIF is missing so a fresh clone stays green.

---

## Phase 6: Kit tests (half a day)

1. Add `tests/test_select.mjs` covering `inferFamily` with one fixture per branch, and `planPage` with the four recipes. Fail on the first regression rather than relying on the browser suite.
2. Fix `compose.js` line 484 so an empty `thumbs` array renders nothing instead of "0". Audit the other `length &&` patterns in the file.
3. Move `BANNED_VORTEX_SEQUENCE` out of `compose.js` into the Halo config or delete it.
4. Derive `FAMILIES` from `Object.keys(RENDERERS)`.

---

## Phase 7: Release (1 day)

1. Run the full check list from the top of this file.
2. Real-phone QA on cellular per `qa.md`: rung selected, no jump on URL-bar collapse, no layout shift if scrolled during preload, menu locks scroll, Halo battery drain acceptable.
3. Safari run per README with `safaridriver`.
4. Copy the skill to `~/.claude/skills/` on a clean machine and run the SKILL.md build order end to end. This is the test for Phase 0 decision 1.
5. Update `CLAUDE.md` "Bugs already found and fixed" with the rung, poster, pin-shift, Lenis lock and bloom entries.
6. Tag `v1.0.0`. Delete this file in the same commit.

## Effort

| Phase | Estimate |
|---|---|
| 0 Decisions | 0.5 day |
| 1 Template invariants | 1.5 days |
| 2 Example runtimes | 2 days |
| 3 Docs | 1 day |
| 4 Hygiene | 0.5 day |
| 5 Pipeline | 0.5 day |
| 6 Kit tests | 0.5 day |
| 7 Release | 1 day |
| Total | about 7.5 days |

Phases 3 through 6 are independent of each other and can run in parallel once Phase 1 has settled the rung decision.
