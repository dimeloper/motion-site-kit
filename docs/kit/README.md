# Page kit

Shared **section families** for a new WebGL vertical. Harbor and Vortex keep their own HTML. Halo composes from here.

Serve: `python3 -m http.server 8080 --directory docs` → `/kit/`

## Rule

Choose sections around the content and its reading order. There is no minimum count. Repeat a layout when the content benefits from it, and vary image scale, density and spacing where the story changes. The renderer warns about repetition so it can be reviewed.

Reuse from Harbor / Vortex: loader, Lenis, menu dialog, poster/canvas, fallbacks. Not the section list.

Start with a complete brief in `recipes.js`. `planPage()` selects families from the content shape. `page.order` sets the reading order using IDs. Explicit `sections` configurations remain available for authored compositions.

A live page must not depend on `sections.css` alone. Designed lists are `div[role=list]`, not `<ol>` or `<ul>`. Cache-bust the kit stylesheet with the JS. If you see browser list markers or a still at its intrinsic width, kit CSS did not apply.

## Complete recipes

Open `index.html` to preview studio, product, hospitality and exhibition pages at desktop or phone widths. `preview.html?recipe=studio` opens the full page. Copy recipe exports both hero content and `page`; image paths are relative to this directory. See [onboarding](../ONBOARDING.md) before moving assets into another project.

The new content keys are `projects`, `chapters`, `comparison` and `expansion`. They select `project-index`, `visual-chapters`, `image-comparison` and `expanding-image`. Visual chapters become an ordinary sequence of illustrated passages on phones. Comparisons use keyboard-operable native range controls. Expanding images use CSS scroll timelines when supported and stay fully visible otherwise. Re-composing a page disconnects its chapter observers.

## Families

Thirty-four families. A page uses a short sequence. The catalog is not a page.

| Type | Layout | Do not confuse with |
|---|---|---|
| `hero-cinematic` | Type left, empty object lane | Harbor / Vortex split with a filled product |
| `hero-editorial` | Light page, tall still, two notes | Dark theme mid-scroll invert |
| `stat-stack` | One glass column, uneven metrics | Four equal stat cells |
| `editorial-split` | Headline + two columns + tall still | Numbered module list |
| `featured-work` | One card | Three finish cards |
| `flank-statement` | Word / void / word | Centered manifesto strip |
| `material-board` | Tall cell + two stacked | 3-up identical cards |
| `process-columns` | Two text columns | Card grid |
| `work-rail` | Horizontal snap strip of stills | Material board / 3-up cards |
| `colonnade` | Three uneven vertical shafts | Equal feature cards |
| `ascent-steps` | Numbered spine | Two equal process columns |
| `bleed-line` | Full-bleed still, one line | Featured card / statement CTA |
| `faq-rule` | Thick rule + accordion | Another kicker + h2 block |
| `statement-cta` | One line, one button | Dual-CTA card |
| `quote-pull` | Large quote, attribution right | Statement CTA |
| `contact-split` | Address / mail | Form card |
| `pair-stills` | Two unequal frames | 3-up cards |
| `note-margin` | Body + side note | Two process columns |
| `hours-list` | Label / value rows | Stat stack |
| `film-strip` | Contact sheet, numbered frames | Work rail with titles |
| `invert-band` | Type between thick rules | Light editorial invert |
| `rule-list` | Title on a hairline | Ascent spine |
| `measure-band` | One number | Stat stack of three |
| `chapter-index` | Roman index | Nav clone |
| `caption-still` | One frame, one caption | Featured card |
| `peek-overlap` | Two stills overlap | Pair in a row |
| `sign-off` | Mark + meta | Statement CTA |
| `client-marks` | Names in a line | Logo grid |
| `spotlight-stage` | One stage, thumbs | Work rail |
| `claim-stack` | Staggered claims | Rule list |
| `visual-chapters` | Persistent image beside scrolling passages | Ordinary image grid |
| `expanding-image` | Image opens from an inset crop | Image carousel |
| `project-index` | Project list with keyboard/touch preview selection | Static list of names |
| `image-comparison` | Two aligned images with a native slider | Finish selector |

## Use

```js
import { compose, planPage } from '../../kit/compose.js';

compose(document.querySelector('[data-kit]'), planPage({
  kind: 'studio',
  content: {
    featured: { headline, title, body, image },
    steps: […],
    stills: […],
    questions: [{ q, a }],
    invite: { line, cta },
  },
}));
```

Studio briefs skip `stat-stack`. Halo orders projects, chapters, an expanding still and a closing link. Four titled stills select `work-rail`; three steps select `ascent-steps`.

Full field notes: `skills/motion-website/references/page-kit.md`.
