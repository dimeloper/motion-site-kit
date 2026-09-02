# Page kit

Shared **section families** for a new WebGL vertical. Harbor and Vortex keep their own HTML. Halo composes from here.

Serve: `python3 -m http.server 8080 --directory docs` → `/kit/`

## Rule

A page picks **four or more different families**. A family appears once. The Vortex sequence (`modules` → `feel` → `builds` → `about` → `cta`) is banned.

Reuse from Harbor / Vortex: loader, Lenis, menu dialog, poster/canvas, fallbacks. Not the section list.

Pass a **content brief**. `planPage()` chooses families from the shape (one featured still, three steps, four stills, questions). Do not hardcode types unless you are writing a kit specimen.

## Families

Thirty families. A page uses a short sequence. The catalog is not a page.

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

Studio briefs skip `stat-stack` and `hero-editorial`. Four titled stills become `work-rail`. Three steps become `ascent-steps`.

Full field notes: `skills/motion-website/references/page-kit.md`.
