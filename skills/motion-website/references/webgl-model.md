# Live WebGL model hero (Higgsfield / Meshy path)

Use this when the product should be a **sculptural object the camera orbits**, not a pre-rendered frame ladder. Harbor Oven is the craft reference under `docs/examples/local/` — copy its patterns, not its bakery copy.

Frame scrub remains the default kit path. Live WebGL is the optional branch when you have (or can generate) a clean GLB and want continuous light/camera motion instead of a fixed clip.

## When to pick which engine

| Engine | Demo | Motion language | Asset |
|---|---|---|---|
| Frame scrub | `template/`, classic reskins | Camera move baked into a 120-frame ladder | AVIF/WebP sequence under budget |
| Live WebGL | Harbor (`local`) → pattern for **Vortex** / **Halo** | Orbit / explode-assemble / peel — one language per vertical | `models/*.glb` + Three.js |
| Particles | Optional fork | Scroll densifies a field | Canvas only — poster still for LCP |
| Float layers | Optional fork | Layered stills drift in z-depth | A few stills, no sequence decode |

Do **not** ship three demos that all rotate-and-zoom the same way. Harbor proved orbit; Vortex should explode→assemble; Halo should peel material — three verticals **and** three motion languages.

## Harbor craft checklist (reuse for Vortex)

Learnings locked in after the Harbor pass — apply these before calling a WebGL demo “done”:

### Layout & chrome
- **Two-lane hero on desktop** — dark reading lane left, product right. Never park the model under the headline.
- **Mobile** — full-bleed top/bottom scrim (not a left strip); larger headline (`clamp` from ~2.35rem); full-width copy; touch CTAs ≥ ~44px tall.
- **Proximity meta** (eyebrow / proof) lives **bottom-left above the status rail**, not under the topbar. Fade in on scroll as the product draws near (earlier thresholds on mobile).
- **Headline lines** — keep intentional rows (`white-space: nowrap` on lines that must not wrap). Drop `max-width: Nch` that forces awkward breaks.
- **In-page `#` links** — Lenis owns scroll; wire `lenis.scrollTo(el)` (Harbor: `window.__harborLenis` + capture click handler). Native hash alone will feel broken under pin + Lenis.
- **Menu** — paper body matching brand paper/ink; **top chrome matches the hero topbar** (dark frosted bar, white brand, glass close). Animate open/close; static nav HTML as fallback; `role="dialog"` + `aria-modal` + focus trap + Escape + restore focus.

### Scene / GLB
1. **Still** — product on a clean, preferably dark or cutout background. Avoid racks, trays, props that Meshy will bake into the mesh (Harbor's first pass included a cooling rack as a black ring).
2. **`generate_3d`** (Meshy image→3D / PBR) via project MCP `motion-kit-higgsfield`. Prefer the tool over inventing geometry in Three.js.
3. Download the GLB into the site tree (`models/product.glb`). Keep source stills for the poster `<img>`.
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

5. Runtime lives in Harbor's `src/scene.js` + `src/motion.js` (Three r170 + `GLTFLoader` via import map). **Copy that pair** when you need the WebGL path; do not fold it into the frame-scrub `template/src/motion.js`.
6. Soft **flour / dust motes** (or product-appropriate particles) orbit the model — additive, warm or brand-tinted, continuous RAF so they drift when idle. Do not port a full postprocessing particle “sea” unless the vertical asks for it.
7. No decorative plinths / void caps that intersect the mesh — they read as rings on dark backgrounds. Soft bounce light under the object helps baked AO; it does not fix a rack baked into the GLB.

### Credits and size

Meshy GLBs are often **10–20 MB**. That sits outside the **8 MB sequence** budget in `motion.config.json`. Treat model weight as a separate gate: compress (meshopt / Draco) before shipping, or keep the WebGL demo as a craft reference and use frames for production budgets.

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

1. Scaffold from Harbor structure (`config.js` + `bind.js` + page chrome) or promote `docs/examples/saas/` stub.  
2. New motion language only: **parts explode, then seat on scroll** — do not copy Harbor's orbit camera.  
3. Generate a clean DualSense-class GLB (or kitbash) via Higgsfield; same fallback chain.  
4. Reuse Harbor menu / Lenis / proximity / mobile scrim patterns; reskin brand tokens in `config.js`.  
5. Gate: scroll reverse, Slow 4G, real phone, axe on default + menu-open states.

## Verification

```bash
cd docs && python3 -m http.server 8080
# open /examples/local/ — hero should reach data-motion="ready"
# mobile width ~390px: headline readable, CTAs tappable, loaf not under type
# scroll reverse; throttle Slow 4G; confirm poster path with reduced-motion
```
