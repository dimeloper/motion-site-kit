# Examples

| Example | Engine | Motion | Asset |
|---|---|---|---|
| `local/` Harbor Oven | Three.js | The camera orbits a loaf while flour motes drift | Meshy GLB, ~1 MB |
| `saas/` Vortex | Three.js | A particle halo peels off a titanium band and reseats | None: the band is built in `scene.js` |
| `commerce/` Halo | Three.js | Two rings of light lift off a stone and seat on reverse | Meshy GLB for the stone; sections from `../kit/` |
| `vgpu/` Fold | vgpu (WebGPU) | A procedural sheet whose material responds to scroll | None: a WGSL shader |

Harbor, Vortex and Halo share their runtime in `shared/`:

| File | What it owns |
|---|---|
| `hero.js` | Fallback decision, loader, lifecycle, the ScrollTrigger pin and proximity copy |
| `lifecycle.js` | Visibility and context-loss ownership, `createFrameDriver()`, `releaseRenderer()`, GLB loading |
| `smooth-scroll.js` | The one Lenis instance, the scroll lock, in-page anchors |
| `page-chrome.js` | Loader numerals, reveals and the mobile menu dialog |

Each example keeps only its brand in `config.js` and `src/bind.js`, `motion.js`,
`page.js`, `scene.js` and `styles.css`. To start a new one, copy an example
folder next to `shared/` and change those files.

```bash
python3 -m http.server 8080 --directory docs
# /examples/local/  /examples/saas/  /examples/commerce/  /examples/vgpu/demo/
```

The frame-scrub template is the default path and lives in the skill. The model
recipe and visual gate are in
[webgl-model.md](../../skills/motion-website/references/webgl-model.md). Every
image and model here is listed with its source and terms in
[ASSETS.md](ASSETS.md).
