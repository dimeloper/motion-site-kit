# Docs and example design review

Reviewed against the public [GetLayers library](https://www.getlayers.ai/) on
9 September 2026. The reference sets an expectation for composed first screens,
clear type hierarchy, distinctive art direction and useful visual previews.
No GetLayers artwork, premium prompts or source code was copied.

## Before and after

| Surface | Review finding | Implemented change |
| --- | --- | --- |
| Docs home | A small headline over a phone demo, followed by widely separated text panels. Navigation and the examples were difficult to discover. | A full editorial homepage with a strong wordmark/headline, lime and paper palette, visual example gallery, pipeline, defaults, setup commands and page-kit entry. Real HTML remains usable without JavaScript. |
| Page kit | Thirty text links above a very long sequence of specimens; the first preview was an empty object slot. | Searchable family navigation, one live specimen at a time, selected state, configuration display and copy control. Default preview uses real kit imagery. All 30 families remain available. |
| Harbor | Small serif hero, dashboard-like clock, repeated bread imagery with tart/lunch captions, and uniform boxed sections. | Larger serif composition, quieter navigation, warm paper sections, an offset two-image story with accurate captions, and a mobile card position that leaves more of the loaf visible. |
| Vortex | Weak headline contrast and a long run of similar dark rows/cards. Placeholder preorder and social destinations. | Stronger type, a divided feature grid, light blue material statement, a large featured finish with a tighter object crop, and working exploration/source links. Decorative labels no longer imply nonexistent actions. |
| Halo | Compressed headline and a mostly uniform dark page. | Sculptural serif headline, a warm-paper featured object, staggered studio stills and a gold closing section. Repaired inherited button contrast. |

The frame template remains independent. Docs chrome uses its own HTML/CSS and
small clipboard module, while its frame runtime stays mirrored from
`template/src`. None of the model renderers was rewritten for this design pass.
Existing particle density, budgets, phone motion and poster fallbacks remain.

## Verification

- The complete 26-scenario Chromium suite passed after the redesign, including
  frame output/reversal, failure recovery, bitmap accounting, WebGL suspension,
  menu interaction/contrast and Fold behavior.
- New checks cover docs without JavaScript, command copying, catalog search,
  all 30 selections, configuration copying and a single page-level heading.
  The 320px docs overflow check found and fixed the width of the rung graphic.
- Desktop 1440px and phone-sized 390px screenshots were visually inspected for
  every surface. Additional 320px checks found no page overflow in the docs or
  the three WebGL examples after correction. The catalog's 30 specimens were
  checked for page overflow at 390px.
- Axe passes in the tested docs and featured-work catalog states, and with the
  three example menus open/closed under reduced motion. This does not certify
  every animated pixel or every catalog specimen's contrast.
- Three Firefox 151.0.3 smoke checks pass: frame forward/reverse, Fold's
  no-WebGPU fallback and reduced motion. Subsequent Safari and physical-device
  evidence is tracked in [release QA](RELEASE-QA.md).
- Frame budgets, first-party example JS/model gates and canonical mirrors pass.
  No ceilings were increased. Full screenshot sources stay ignored under
  `out/design-before` and `out/design-after`; compact gallery WebPs and their
  provenance are in `docs/assets`.

The offscreen regression now uses an explicit instant jump. CSS smooth scrolling
previously let the requested move remain in progress during the assertion,
which made the result depend on timing. The test still requires observer delivery
and directly compares GPU submission counts while the hero is offscreen.

## Reproduce the visual audit

From the repository root, after installing the pinned test packages:

```bash
DESIGN_OUT=out/design-review node scripts/hero-clip/audit-design.mjs
# Optional subset:
DESIGN_FILTER=docs,kit DESIGN_OUT=out/design-review node scripts/hero-clip/audit-design.mjs
```

Serve `docs` and open `/index.html`; `/docs` is not a route when that directory
is already the server root. The layout review is a design assessment, not an
objective claim of parity with every GetLayers template. Real-device power and
cellular delivery remain separate performance checks. This design checkpoint
preceded publication; see [release QA](RELEASE-QA.md) for current browser and
release status.

## Composition follow-on, 10 September 2026

Halo now presents named website studies through a project index, image-led
chapters and an expanding context image. Its hero keeps the stone and rings,
with thinner luminous cores and reduced bloom. Fold uses broader pleats, softer
reflections and a working finish comparison. Both retain their existing runtime
and poster fallback contracts.

The kit now has 34 section families and four complete recipes. Studio uses an
asymmetric portfolio, product moves through construction and context, hospitality
uses bread photography and service copy, and exhibition compares finishes before
showing the full material. Explicit section ordering supports these sequences.
Desktop and 390px previews share the same brief; export includes its hero and page
content. The product hero's crop was corrected after screenshot review found the
band too small and then off-center.

Reviewed recipe first screens and lower-section captures at 1440px and 390px,
including Fold's narrow finish comparison. Screenshots remain in ignored
`out/final-visual/`. The full 29-scenario Chromium suite passes, including all
four recipes at both widths, content order, native comparison keyboard controls,
project selection, preview switching and export. Axe covers the complete recipes
and the tested catalog states; this is not an accessibility certification.

Public copy now identifies Vortex as a concept study instead of presenting
unsubstantiated ratings, battery figures or a shipping date. Harbor captions
match the bread imagery. The new onboarding guide covers each working route,
image-path handling and the distinction between editing source and serving a build.
