# Page kit (section families)

The third vertical failed when it reused Vortex's page: numbered modules, a feel panel, three identical finish cards, about, CTA. Swapping nouns in `config.js` does not make a new site.

Layout lives in `docs/kit/`. Harbor and Vortex keep the HTML they earned. A new demo **composes** a sequence. It does not copy `docs/examples/saas/index.html`.

Specimen: serve `docs/` and open `/kit/`.

## What you may copy from Harbor / Vortex

Loader invariant, Lenis + hash scroll, menu dialog (focus trap, Escape), poster `<img>` under canvas, `data-motion="static"` until JS commits, reduced-motion / Save-Data / 2G / no-WebGL fallbacks.

Not the section list. Not `modules` / `feel` / `builds` / `about` / `cta` with new labels.

## Composition rules

1. Describe **content**, then let `planPage()` pick families. Hardcode `type` only for a kit specimen.
2. A page uses **at least four different** families. A family appears **once**.
3. Do not ship the Vortex ids `modules`, `feel`, `builds`, `about`, `cta` together.
4. Three equal cards and four equal stat cells are banned.
5. Eyebrows (small uppercase tracking labels) at most once every three sections. Prefer none.
6. One theme per page. `hero-editorial` is a light family. Do not drop it between dark sections.

`compose.js` warns in the console if a family repeats or the Vortex id list is present. `select.js` maps brief shape to families.

## How the planner chooses

`planPage({ kind, content })` reads the brief, not a type list.

| Content | Family |
|---|---|
| One featured still | `featured-work` |
| Three or more steps | `ascent-steps` |
| Two steps | `process-columns` |
| Four or more titled stills | `work-rail` (`film-strip` if `strip: true`) |
| Three stills, one tall | `material-board` |
| Three stills, studio | `colonnade` |
| Two stills | `pair-stills` |
| Questions | `faq-rule` |
| Invite line + CTA | `statement-cta` |
| Quote | `quote-pull` |
| Metrics, and `kind` is not `studio` | `stat-stack` |

Studio (`kind: 'studio'`, or inferred from a featured still + stills) skips `stat-stack` and never inserts `hero-editorial` mid-page. Halo ships a studio brief; the planner should land on featured → ascent → rail → faq → invite.

A section with no `type` still mounts if `inferFamily()` can read its fields (`items[].q`, `steps`, `item.image`, and so on).

## Families

Thirty families. A page uses a short sequence. The catalog is not a page.

| Type | Use when | Not a substitute for |
|---|---|---|
| `hero-cinematic` | Dark page, type in a reading lane, object in a void | Cloning Harbor/Vortex split chrome and calling it new |
| `hero-editorial` | Light page, tall still, two short notes | Inverting a dark page mid-scroll |
| `stat-stack` | A few metrics that are not the same size | Four-up hero stats |
| `editorial-split` | Mechanism copy + one still | Numbered module list |
| `featured-work` | One piece you want to point at | Three finish cards |
| `flank-statement` | Two words around the object | A decoration strip under the hero |
| `material-board` | Mixed-ratio stills | 3-up identical cards |
| `process-columns` | Two steps, prose only | Another card grid |
| `work-rail` | Horizontal snap strip of stills | Material board or a 3-up grid |
| `colonnade` | Three uneven vertical shafts | Equal feature cards |
| `ascent-steps` | Numbered spine | Two equal process columns |
| `bleed-line` | Full-bleed still, one line over it | Featured card or a type-only CTA |
| `faq-rule` | Questions under a thick rule | Another kicker + h2 block |
| `statement-cta` | One line, one button | Dual-CTA card with a ghost twin |
| `quote-pull` | One large quote | Statement CTA |
| `contact-split` | Address and mail | A form card |
| `pair-stills` | Two unequal frames | Three cards |
| `note-margin` | Body plus a side note | Two process columns |
| `hours-list` | Label / value rows | Stat stack |
| `film-strip` | Contact sheet, no titles | Work rail |
| `invert-band` | Type between thick rules | A light editorial invert |
| `rule-list` | Titles on hairlines | Ascent spine |
| `measure-band` | One number | Three metrics |
| `chapter-index` | Roman index | Nav |
| `caption-still` | One frame, one caption | Featured card |
| `peek-overlap` | Two stills overlap | Pair in a row |
| `sign-off` | Mark and meta | Statement CTA |
| `client-marks` | Names in a line | Logo grid |
| `spotlight-stage` | One stage, thumbs | Work rail |
| `claim-stack` | Staggered claims | Rule list |

`work-rail`, `colonnade`, `ascent-steps`, and `bleed-line` come from GetLayers' public section types (carousel / features / roadmap / showcase). Their prompts are paywalled. These are original layouts in our tokens, not copied prompts.

## Wire-up

```js
import { compose, planPage } from '../../kit/compose.js';

compose(document.querySelector('[data-kit]'), planPage(CONFIG.page));
```

`CONFIG.page` is `{ kind, content }`. Halo is the studio example. Specimens may still pass `{ sections: […] }` with explicit types.

Styles: `docs/kit/sections.css`. Brand tokens (colors, fonts) override on `[data-theme]` in the demo's own CSS. Do not fork `sections.css` to restyle one card into Vortex.

## 3D is a separate decision

This kit is layout. The object still has to clear `webgl-model.md`. Untextured CAD primitives failed on Vortex (torus) and on the deleted Halo cups. Halo's stone is Meshy PBR. The next object is Meshy PBR or a licensed textured GLB, or it stays a poster.
