# Live WebGL model hero

Use this when the product should be a sculptural object the camera moves
around, with live light, rather than a pre-rendered frame ladder. Frame scrub
stays the default. Live WebGL is the optional branch when you have, or can make,
a clean GLB.

The examples live in the repository, not in this skill:
[Harbor, Vortex and Halo](https://github.com/dimeloper/motion-site-kit/tree/main/docs/examples),
with their shared runtime in `docs/examples/shared/`. Start a new WebGL hero by
copying one example's folder and the `shared/` folder beside it.

**Generating a model needs a paid service.** The image-to-3D recipe below uses
Meshy through the Higgsfield MCP server (`https://mcp.higgsfield.ai/mcp`), which
spends account credits. Without it, use a GLB you are licensed to ship, build
the object in code (as Vortex does), or stay on the frame path.

## Choosing the engine

| Engine | Example | Motion language | Asset |
|---|---|---|---|
| Frame scrub | `assets/template/` | A camera move baked into a 120-frame ladder | AVIF/WebP sequence under the budget |
| Live WebGL, GLB | Harbor | The camera orbits a loaf | Meshy GLB, meshopt compressed, ~1 MB |
| Live WebGL, code | Vortex | Particles peel off a titanium band and reseat | No model: the band is a lathe built in `scene.js` |
| Live WebGL, GLB + code | Halo | Two rings of light lift off a stone and seat on reverse | Meshy GLB for the stone; the rings are code |

Give each page its own motion language. Three pages that all rotate and zoom
read as one template.

## The gate before anyone sees it

Do not ask a client to judge a WebGL hero until every item is true in a visible
tab. Background tabs throttle `requestAnimationFrame` and GSAP, so never gate
the loader on `requestAnimationFrame`; use `setTimeout`. Then run the
**WebGL hero** section of `qa.md`.

1. **The asset path was chosen on purpose.** See the decision tree. If image-to-3D produced clay, seams or a hole that looks cracked, discard the GLB and change path. Better lighting does not fix it.
2. **The licence was checked** before promising a third-party file. A Sketchfab model with `isDownloadable: false` or no named licence cannot be shipped. Record the source and terms in `docs/examples/ASSETS.md`.
3. **Framing on desktop.** Reading lane on the left, product in the right third. The product's longest on-screen axis is about 35–50% of the hero's height. It never sits under the headline or crops at the top.
4. **The supporting field fills the hero after the intro.** Particles appear on the object first, then spread across the hero after about half a second. At rest they are not a tight shell that makes a good mesh look noisy.
5. **One body mesh.** Extra liner or inlay meshes z-fight and look cracked. Lighting does not fix intersecting geometry.
6. **Poster is a real `<img>`**, the canvas fades in over it, and `data-motion` starts at `static`. Phones get the animation.

## Asset decision tree

| Product shape | Path | Why |
|---|---|---|
| Sculptural, two or three materials, no hole (loaf, over-ear cups, speaker) | Clean still → background removal → Meshy image-to-3D with PBR → `scripts/compress_glb.sh` | Works when the still shows the product alone |
| Genus-1 or thin tube (rings, bangles) | Build it in Three.js: a high-segment torus or lathe | Image-to-3D reconstructs a hole as cracked clay, even at the highest setting |
| Mixed plastics, sticks, hollow cups, game controllers | Skip image-to-3D: licensed CAD, code, or frame scrub | Sticks and cavities turn into grit |
| Someone sent a Sketchfab or store link | Check the API or page first for a download and a named licence | CAD-quality models are often view-only |

## Scene and GLB

1. **Start from a clean still.** The product alone, fully in frame, three-quarter view. Racks, trays and props get baked into the mesh; a cooling rack under a loaf becomes a black ring.
2. **Generate** (Higgsfield MCP): import the image with `media_import_url`, run `remove_background` if it sits on a surface, then `generate_3d` with `meshy_v7_image_to_3d`, `should_texture: true`, `enable_pbr: true`, `symmetry_mode: 'on'` for symmetric products and `target_polycount` around 40–80k. Preflight with `get_cost: true` and check `balance` before regenerating. Download URLs expire; fetch again through `job_status` if one returns 403.
3. **Compress.** Image-to-3D GLBs are often 10–20 MB. Harbor's loaf arrived at 15.7 MB, of which 12.4 MB was two 2048² textures and 1.6 MB geometry.

   ```bash
   scripts/compress_glb.sh loaf.glb models/loaf.glb
   # meshopt geometry, WebP textures at 1024px, no simplification: ~1.0 MB
   ```

   The loader must call `setMeshoptDecoder(MeshoptDecoder)` or the file will not parse. `scripts/check_example_budget.py` in the repository caps each GLB at 2 MiB and fails on a model no page references.
4. **Poster.** Composite the cutout onto the hero's background as the poster `<img>`. It is the LCP element and the fallback.
5. **Wire `config.js`.**

   ```js
   motion: {
     modelUrl: 'models/product.glb',
     scrollLengthVh: 3.4,
     scrub: 0.6,
     maxDpr: 2,
     lenisDuration: 1.1,
     mobileBreakpoint: 1023,   // match the layout switch in styles.css
   }
   ```

6. **Runtime.** Each example's `motion.js` is a few lines that call `startWebGLHero()` from `shared/hero.js` with its scene factory. Brand logic lives in `scene.js` and `config.js`; do not fold it into the frame template's engine.
7. **Draw only when something changed.** Wrap the scene's draw in `createFrameDriver()` from `shared/lifecycle.js`. Pass `continuous: true` only when a shader animates on its own clock, as Harbor's flour motes do. A scene that only responds to scroll should submit no GPU work while idle.
8. **Release everything.** Call `releaseRenderer()` from `shared/lifecycle.js`, and dispose any post-processing pass yourself before it. `EffectComposer.dispose()` does not free an `UnrealBloomPass`. After a bfcache restore the next scene reuses the same canvas and context, so anything missed accumulates.
9. **No decorative plinths** that intersect the mesh. They read as rings on a dark background.

## Layout and chrome

- **Two lanes on desktop:** a dark reading lane on the left, the product on the right.
- **Phones:** a full-bleed scrim top and bottom rather than a side strip, a larger headline, full-width copy and touch targets at least 44px tall.
- **Proximity copy** (eyebrow, proof) sits bottom-left and fades in as the product draws near. Timings are in `config.js` under `motion.proximity`.
- **In-page links** go through `shared/smooth-scroll.js`, which scrolls once with Lenis when it is running and natively when it is not.
- **Menu:** `role="dialog"`, `aria-modal`, a focus trap, Escape to close, focus restored, and `lockScroll()` while open. Hiding the root's overflow alone does not stop Lenis.

## Fallback chain

The same contract as the frame engine, plus the WebGL exits:

1. `prefers-reduced-motion: reduce` → poster
2. `navigator.connection.saveData` → poster
3. Effective type `slow-2g` or `2g` → poster
4. No WebGL, a lost context, or a failed GLB load → poster (`data-fallback-reason` says which)
5. No model at all → use the frame engine with the same poster rather than an empty canvas

The loader stays hidden until the engine commits to running. Phones are never
excluded by width.

## Accessibility

- `html lang`, a skip link to `#content`, one `<main>`, a labelled `<nav>`
- Visible focus on every link and button
- Touch targets at least 24×24 CSS px; the examples use 44×44
- Copy over the hero keeps 4.5:1 contrast against the brightest frame, not just the poster
- Under reduced motion: no menu animation, proximity copy at full opacity, the static poster

## Verification

```bash
python3 -m http.server 8080 --directory docs
# /examples/local/     Harbor reaches data-motion="ready"; the loaf GLB is about 1 MB
# /examples/saas/      the band is visible at rest and clear of the headline; scroll peels, reverse reseats
# /examples/commerce/  the rings lift off the stone and seat on reverse; page-kit sections below
# At 390px wide: headline readable, CTAs tappable, product not under the type.
# Scroll back up, throttle to Slow 4G, and check the reduced-motion poster.
npm run test:motion --prefix scripts/hero-clip   # idle draws, GPU leaks, menu lock, fallbacks
```
