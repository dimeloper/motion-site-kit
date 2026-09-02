# Live WebGL model hero (Higgsfield / Meshy path)

Use this when the product should be a **sculptural object the camera orbits**, not a pre-rendered frame ladder. Harbor Oven is the craft reference under `docs/examples/local/` — copy its patterns, not its bakery copy.

Frame scrub remains the default kit path. Live WebGL is the optional branch when you have (or can generate) a clean GLB and want continuous light/camera motion instead of a fixed clip.

## When to pick which engine

| Engine | Demo | Motion language | Asset |
|---|---|---|---|
| Frame scrub | `template/`, classic reskins | Camera move baked into a 120-frame ladder | AVIF/WebP sequence under budget |
| Live WebGL | Harbor (`local`) → **Vortex** → **Halo** | Orbit / particle peel-seat / **rings lift and seat** | Harbor: meshopt GLB. Vortex: CAD torus. Halo: textured stone + emissive rings. Compose from `docs/kit/`. |
| Particles | Optional fork | Scroll densifies a field | Canvas only — poster still for LCP |
| Float layers | Optional fork | Layered stills drift in z-depth | A few stills, no sequence decode |

Do **not** ship three demos that all rotate-and-zoom the same way. Harbor proved orbit; Vortex peels particles off a CAD titanium band and reseats them. Halo lifts two rings of light off textured stone and seats them on reverse, on a page composed from `docs/kit/`, not Vortex's section list.

## Do not show the user until this gate is green

Vortex burned rounds on a cracked Meshy ring, a model under the headline, and a halo that hugged the mesh. **Do not ask the visitor (or the client) to judge a WebGL hero until every item below is true in a visible tab.** Background tabs throttle `requestAnimationFrame` and GSAP — never gate the loader on `rAF`; use `setTimeout`. Then run `references/qa.md` → **WebGL hero**.

1. **Asset path chosen on purpose** — see the decision tree. If Meshy produced clay, seams, or a hole that looks cracked, **throw the GLB away** and switch path. Do not light it better and ship it.
2. **License checked** before promising a third-party file. Sketchfab `isDownloadable: false` or empty `license` means **do not rip the viewer**. Ask for a downloadable CC file or build CAD.
3. **Framing contract (desktop)** — reading lane left, product in the right third. Longest on-screen axis of the product is **about 35–50% of hero height**. The model does not sit under the headline or crop the top of the object.
4. **Supporting field fills the hero after intro** — particles / peel shards appear on the object first, then expand across the hero (~0.5s delay). At rest they must not be a tight shell that reads as noise on the mesh.
5. **Motion language is the vertical's** — Harbor orbit, Vortex particle peel→seat. Halo is not a third orbit and not another particle halo. Do not clone the last demo's camera.
6. **One body mesh** — extra liner/inlay tori z-fight and look cracked. Lights and env maps do not fix intersecting geometry.
7. **Poster is a real `<img>`**; canvas fades in; `data-motion` starts `static`. Phones get the animation.

## Asset decision tree

| Product shape | Path | Why |
|---|---|---|
| Sculptural, 2–3 materials, no hole (loaf, over-ear cups, speaker) | Unsplash/Recraft still → cutout → Meshy v7 + PBR, then `scripts/compress_glb.sh` | Harbor proved this when the still is clean |
| Genus-1 / thin tube (rings, bangles) | **CAD in Three.js** (high-segment torus / lathe) | Image-to-3D reconstructs cracked clay even at Meshy ultra |
| Mixed plastics, sticks, hollow cups, DualSense | **Skip Meshy** — CAD, licensed CAD, or frame-scrub | Sticks and cavities turn into grit |
| Someone sent a Sketchfab / store link | Fetch the API/page **first**: downloadable + named license | Vortex's U&W Viz Smart Ring was CAD-quality and **not downloadable** |

## WebGL craft checklist (Harbor + Vortex → Halo)

Learnings locked in after Harbor and Vortex — apply these before calling a WebGL demo “done”:

### Layout & chrome
- **Two-lane hero on desktop** — dark reading lane left, product right. Never park the model under the headline.
- **Mobile** — full-bleed top/bottom scrim (not a left strip); larger headline (`clamp` from ~2.35rem); full-width copy; touch CTAs ≥ ~44px tall.
- **Proximity meta** (eyebrow / proof) lives **bottom-left above the status rail**, not under the topbar. Fade in on scroll as the product draws near (earlier thresholds on mobile).
- **Headline lines** — keep intentional rows (`white-space: nowrap` on lines that must not wrap). Drop `max-width: Nch` that forces awkward breaks.
- **In-page `#` links** — Lenis owns scroll; wire `lenis.scrollTo(el)` (Harbor: `window.__harborLenis` + capture click handler). Native hash alone will feel broken under pin + Lenis.
- **Menu** — paper body matching brand paper/ink; **top chrome matches the hero topbar** (dark frosted bar, white brand, glass close). Animate open/close; static nav HTML as fallback; `role="dialog"` + `aria-modal` + focus trap + Escape + restore focus.

### Scene / GLB
1. **Still** — product alone on a clean background (or a cutout). Avoid racks, trays, consoles, props that Meshy will bake into the mesh (Harbor's first pass included a cooling rack as a black ring). **Skip DualSense-class controllers** — sticks, mixed plastics, and translucent buttons turn into clay + grit. Prefer a sculptural object with two or three materials (loaf, over-ear cups, speaker).
2. Prefer the **Unsplash → cutout → Meshy** path below over inventing geometry in Three.js — **except genus-1 rings**. A thin tube with a hole reconstructs as cracked clay (tried Unsplash still + Recraft + Meshy v7 ultra). The Sketchfab Smart Ring look target (`4fdc3424f54d4e1cb5942af310fc1a17`, U&W Viz) is CAD: 0 textures, 8 materials, 24k tris, **not downloadable**. Vortex ships a high-segment torus with inner sensors instead of ripping the viewer.
3. Download the GLB into the site tree (`models/product.glb`). Composite the cutout onto a dark field for the poster `<img>` (LCP).
4. Wire `config.js`:

```js
motion: {
  engine: 'webgl',
  modelUrl: 'models/product.glb',
  scrollLengthVh: 3.4,
  scrub: 0.6,
  maxDpr: 2,
}
```

5. Runtime lives in Harbor's / Vortex's `src/scene.js` + `src/motion.js` (Three r170 + `GLTFLoader` via import map). **Copy that pair** when you need the WebGL path; do not fold it into the frame-scrub `template/src/motion.js`.
6. Soft **flour / dust / assemble particles** — additive, brand-tinted, continuous RAF. Harbor: motes orbit the loaf. Vortex: particles **peel off and reseat** the CAD band (sampled from the torus surface), then **fill the hero** after intro. Halo must not be a third particle halo. Do not send DualSense / hollow cups / rings through image-to-3D. Untextured CAD primitives failed on the ring and on the deleted cups. Next object: Meshy PBR or a licensed textured GLB.
7. No decorative plinths / void caps that intersect the mesh — they read as rings on dark backgrounds. Soft bounce light under the object helps baked AO; it does not fix a prop baked into the GLB.

### Unsplash → Higgsfield 3D (Harbor recipe; skip for rings)

Use this when you need a **realistic PBR product mesh** and do not already have a clean studio GLB.

1. **Find a still** on Unsplash (or equivalent) of the **product alone** — full object in frame, no sibling hardware, no trays. Three-quarter product shots work best. DualSense / gamepads fail this path; over-ear headphones and bakery loaves do not.
2. **`media_import_url`** the HTTPS image into Higgsfield. Never pass raw Unsplash URLs into `generate_3d` medias.
3. **`remove_background`** on that media_id when the subject sits on wood/cloth/desk — Meshy will otherwise extrude the surface into the mesh.
4. **`generate_3d`** with `meshy_v7_image_to_3d` (or `image_to_3d`): `should_texture: true`, `enable_pbr: true`, `symmetry_mode: 'on'` for bilateral products, `target_polycount` ~40–80k. Preflight with `get_cost: true` (often ~38 credits on Plus).
5. Download the `.glb` into `docs/examples/<demo>/models/`. Keep the cutout + a dark-composited JPEG/AVIF as `images/` poster.
6. Wire `modelUrl` and a motion language that fits a **single mesh** (coalesce / orbit / peel) — do not fake multi-part explode with box primitives.

Check `balance` before regenerating. CloudFront GLB URLs expire; re-fetch via `job_status` if a download 403s.

### Credits and size

Meshy GLBs are often **10–20 MB** on download (Harbor loaf was 15.7 MB: 7.5 MB PNG normal + 4.9 MB JPEG albedo at 2048²; geometry was only 1.6 MB). That sits outside the **8 MB sequence** budget in `motion.config.json`. Compress before shipping:

```bash
./scripts/compress_glb.sh docs/examples/local/models/loaf.glb /tmp/loaf-opt.glb
# meshopt + WebP @ 1024px, no simplify — Harbor loaf lands ~1.0 MB
```

Canonical models live under `docs/examples/*/models/` (GitHub Pages). `examples/*/models/*.glb` are symlinks so git does not store the binary twice. `GLTFLoader` must call `setMeshoptDecoder(MeshoptDecoder)` from `three/addons/libs/meshopt_decoder.module.js` or the compressed file will fail to parse.

Check remaining Higgsfield credits with the MCP `balance` tool before batch regenerations.

## Fallback chain (required)

Same accessibility contract as the frame engine. Live WebGL adds two more exits:

1. `prefers-reduced-motion: reduce` → poster only  
2. `navigator.connection.saveData` → poster only  
3. Effective type `slow-2g` / `2g` → poster only  
4. No WebGL / context lost / GLB load failure → poster only (`data-fallback="no-webgl"` / `webgl-failed`)  
5. Optional product choice: if you never generated a GLB, **fall back to the frame-scrub engine** with the same poster — do not leave a broken canvas

Loader invariant still holds: `data-motion` starts at `static`; set `preloading` only after the engine has committed to running.

Poster is a real `<img>`; the canvas fades in over it (`aria-hidden` on canvas). Never make the canvas the LCP candidate. Phones get the animation — never gate on viewport width.

## Accessibility bar (Harbor verified patterns)

- `html lang`, skip link → `#content`, one `<main>`, labelled `<nav>`
- Focus-visible on links/buttons; menu dialog focus trap + Escape
- Touch targets ≥ 24×24 CSS px (Harbor cards use ~44×44 icon buttons)
- Status / proximity text must keep contrast on the dark hero (avoid pure mid-grey on charcoal)
- Reduced-motion: skip menu motion, show proximity at full opacity, static poster path

## Starting Vortex

1. Live craft reference: `docs/examples/saas/` (Vortex). Do **not** reskin Harbor's bakery sections — chrome should read as a dark hardware / GetLayers-style landing (floating glass pill nav, numbered module list, finish cards, Baseline-style full-screen menu).
2. Motion language: **peel → seat** on a CAD titanium band. The band stays visible (Harbor lesson). Cyan motes sample the torus surface, puff along normals, then reseat. A short yaw shows the inner sensors — not a full loaf orbit. Image-to-3D of a ring stays cracked; do not ship that mesh.
3. Poster is a real `<img>` of the Recraft ring (cutout composited onto a dark field). `data-motion` starts `static`; once JS commits, the canvas fades in over it. Same fallback chain as Harbor.
4. Reuse Harbor **a11y / Lenis / menu dialog / loader** patterns only; brand tokens and section composition stay Vortex-specific in `config.js`.
5. Gate: ring readable on the dark field (not a glowing primitive); halo fills the hero after intro; scroll reverse peels then reseats; Slow 4G; real phone; axe on default + menu-open states.

## Halo (shipped)

Halo is a **studio**, not a SKU (`docs/examples/commerce/`). The page is a content brief (`kind: 'studio'`) and `planPage()` maps it to `featured-work` / `ascent-steps` / `work-rail` / `faq-rule` / `statement-cta`. Motion: two rings of light lift off a textured stone and seat on reverse.

1. Do **not** copy Vortex HTML or bind `modules` / `feel` / `builds` / `about` / `cta`.
2. Reuse Harbor / Vortex loader, Lenis, menu, poster/canvas, fallbacks only.
3. Stone is a Meshy PBR GLB (`models/pillar.glb`, meshopt + WebP, ~1.1 MB). Rings are CAD emissive (genus-1). Untextured product primitives stay banned.
4. Camera stays put. The rings move. That is not Harbor orbit and not a particle halo.
5. Gate in a visible tab. Reverse must seat the rings. Poster is a real `<img>`; canvas fades in and the poster drops out once `data-motion="ready"`.

## Verification

```bash
cd docs && python3 -m http.server 8080
# open /examples/local/ — hero should reach data-motion="ready"; loaf.glb ~1 MB
# open /examples/saas/ — CAD band visible at rest, off the headline; halo fills the hero after intro; scroll peels then reseats; reverse opens the halo
# open /kit/ — page families must not read as Vortex (no 3-up cards, no modules/feel/builds)
# open /examples/commerce/ — Halo studio: rings lift off the stone; reverse seats; kit families below the hero
# mobile width ~390px: headline readable, CTAs tappable, product not under type
# scroll reverse; throttle Slow 4G; confirm poster path with reduced-motion
# visible tab only — rAF/GSAP stall in background and fake a broken loader
```
