# Start here

You can preview the kit without installing anything: open the [examples](https://dimeloper.github.io/motion-site-kit/) or the [four page recipes](https://dimeloper.github.io/motion-site-kit/kit/).

## Run the examples locally

You need Git and Python 3. No Node packages, source clip or image conversion tools are required for this step.

```bash
git clone https://github.com/dimeloper/motion-site-kit.git
cd motion-site-kit
python3 -m http.server 8080 --directory docs
```

Open <http://localhost:8080>. Keep the terminal running. Stop it with Ctrl+C when you finish.

| Open | You will see |
| --- | --- |
| `/` | Docs and the frame-scrub demo |
| `/kit/` | Four complete page recipes, desktop/phone previews and 34 section families |
| `/examples/local/` | Harbor Oven |
| `/examples/saas/` | Vortex |
| `/examples/commerce/` | Halo |
| `/examples/vgpu/demo/` | Fold |

## Choose what to edit

### A site driven by your footage

Start with the included frames. This command replaces `template/frames`; keep a copy first if you have already generated your own sequence. From the repository root:

```bash
bash scripts/use-demo-frames.sh
python3 -m http.server 8081 --directory template
```

Open <http://localhost:8081>. Edit `template/config.js` to change the copy, colors, fonts and sections. Reload to see the change. The frame runtime stays unchanged between projects.

When you have a source clip, follow the [frame pipeline](../skills/motion-website/references/frame-pipeline.md). That step requires FFmpeg and Pillow with AVIF support. Run the budget gate before publishing the new frames.

### A complete page composition

Open `/kit/`, choose a recipe and check both preview widths. Open the standalone preview to scroll through the full page. Copy recipe exports the hero content and page brief; Copy config in the section library exports one section.

The four working briefs live in `docs/kit/recipes.js`. Edit a brief there, then reload `/kit/preview.html?recipe=studio` (or `product`, `hospitality`, `exhibition`). The preview uses `preview.html`, `preview.css`, `preview.js` and the shared section renderer. This gives you a working starting point before integrating it into another project.

The `page.order` array sets the reading order using section IDs. Omitted sections follow the listed ones. `page.content` supplies projects, chapters, stills, comparison images and other content; `planPage()` selects the corresponding layouts. See [kit guidance](kit/README.md).

Image paths in copied recipes are relative to `docs/kit/`. When moving a recipe to another directory or framework, copy the required images and update those paths. Keep each image's alt text and dimensions.

### A live WebGL example

Edit the canonical source under `docs/examples/local`, `saas` or `commerce`. Their scene code is independent of the frame template. Halo uses the shared page kit for its lower sections.

After editing, update the development mirrors:

```bash
python3 scripts/sync_examples.py --write
```

### Fold's WebGPU study

Serving the committed demo needs no build. Editing it requires Node 22.12+:

```bash
npm ci --prefix docs/examples/vgpu
npm run dev --prefix docs/examples/vgpu
```

Edit `docs/examples/vgpu/source/`. After a shader change, regenerate the posters from that shader, then build and check:

```bash
npm run poster --prefix docs/examples/vgpu
npm run build --prefix docs/examples/vgpu
npm run check --prefix docs/examples/vgpu
```

Poster generation requires a working native WebGPU adapter. Keep the existing posters if you are only editing copy or layout. The [Fold guide](examples/vgpu/README.md) explains its fallback and build limits.

## Check and publish

Inspect the page at desktop and phone widths, scroll forward and back, use the keyboard, and turn on reduced motion. For a release, run the [repository checks](../README.md#verification-and-maintenance) and the [QA checklist](../skills/motion-website/references/qa.md).

The docs and examples can be served by a static host. This repository's GitHub Pages configuration publishes `docs/` from `main`. A frame project can publish `template/` after its frames are generated. Fold's standalone output is `docs/examples/vgpu/demo/`.

## If something looks wrong

| Symptom | Check |
| --- | --- |
| `/docs` returns 404 | `docs/` is already the server root. Open `/`. |
| A page opened from Finder fails | Use the HTTP server rather than a `file://` URL. |
| The template shows its poster | Run `use-demo-frames.sh`, check the browser console, and check reduced-motion or data-saving settings. |
| Fold stays still | WebGPU needs localhost or HTTPS and a supported adapter. Finish controls still work with the posters. |
| Port 8080 is occupied | Use `8081` and open that port instead. |
| Copied images are missing | Resolve image paths relative to the new page location. |
