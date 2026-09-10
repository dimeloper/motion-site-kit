# Use case: turn a product clip into a scroll reveal

Suppose a product team has a six-second, 1920×1080 turntable video of a new speaker. The launch page should hold the speaker in place while scrolling reveals its front, controls and rear panel. It also needs a readable static version for visitors using reduced motion or data-saving settings.

Use the default frame engine for this job. Add the source clip and edit `template/config.js`. Keep `template/src/motion.js` unchanged.

## 1. Prepare the clip

Use a clean loop or a single continuous move. Keep the product in roughly the same part of the frame and avoid cuts: scroll can move backward, so every transition must also make sense in reverse.

Place the source video at the repository root as `speaker-turntable.mp4`. Install FFmpeg and Pillow 11.3 or newer, then extract 120 evenly spaced PNGs:

```bash
python3 skills/motion-website/scripts/extract_frames.py \
  speaker-turntable.mp4 --out frames/raw-speaker --count 120 --width 1600
```

The extractor samples the full six seconds. Clip duration does not change the frame count.

## 2. Build the responsive frame ladder

```bash
python3 skills/motion-website/scripts/optimize_frames.py \
  frames/raw-speaker --out template/frames --config motion.config.json
```

This creates 640, 960 and 1600px ladders in AVIF and WebP, plus the manifest the browser reads. A phone downloads the rung selected for its rendered width and device pixel ratio; it does not fetch every size.

## 3. Describe the page in one file

Edit `template/config.js`. For this speaker page, replace the placeholder fields with concrete content such as:

| Field | Example value |
| --- | --- |
| `brand.name` | `Arc One` |
| `hero.eyebrow` | `Wireless speaker` |
| `hero.headline` | `Sound from every side.` |
| `hero.sub` | `Scroll to inspect the controls, ports and wraparound grille.` |
| `hero.cta` | `{ label: 'See the specifications', href: '#proof' }` |
| `hero.animationDescription` | `A compact speaker rotates from its front grille to its rear power and audio ports.` |
| First section | Explain the enclosure and grille without repeating the hero copy. |
| Second section | Give a measured specification or link to test methodology. |
| Final CTA | Link to a retailer, preorder page or product sheet. |

Keep `animationDescription` literal. The canvas is hidden from assistive technology, so this text is the description of the motion sequence.

Preview the result:

```bash
python3 -m http.server 8080 --directory template
```

Open <http://localhost:8080>, scroll to the final frame, then scroll back to the beginning. Reverse playback often exposes discontinuities that a forward-only review misses.

## 4. Check the delivery cost

```bash
python3 skills/motion-website/scripts/check_budget.py \
  --config motion.config.json --strict --verbose
```

If the gate fails, use the cut list it prints. Shorten the sequence, reduce the frame count or adjust the source composition before considering a higher budget. Do not raise the limits to make a particular render pass.

## 5. Test the fallbacks

Before publishing:

- Turn on reduced motion and confirm the poster, copy and CTA remain usable.
- Enable Save-Data or emulate a 2G connection and confirm the short static layout appears.
- Test at a real phone width; narrow screens still receive animation under normal connection and motion settings.
- Throttle to Slow 4G, reload, and confirm the poster remains visible while frames load.
- Run the full [QA checklist](../skills/motion-website/references/qa.md).

The same workflow fits a shoe rotation, packaging reveal, furniture assembly or any continuous piece of footage that remains understandable in reverse.
