# Programmatic frames with Remotion

Optional path. Read this only if the project needs frames that a video clip cannot give you.

## When it earns its complexity

Extraction from a generated clip is the default because it is simpler and has no licensing dimension. Reach for Remotion when you need:

- **Exact reproducibility.** Same input, same frames, every time. A regenerated clip is never quite the same clip.
- **Composited brand elements.** Logo, product name, UI chrome, or data burned into the sequence in a way that stays pin-sharp, because it is rendered as vector/text at full resolution rather than being run through a video codec.
- **Parameterization.** One composition, `--props` per client. This is the actual reskin lever — new colors and copy in the sequence itself without regenerating anything.
- **Exact frame counts at exact widths.** No sampling, no resize step. Render 120 frames at 1600px and that is what lands on disk.

For a straightforward "product rotates on a white background" hero, extraction is the right call and Remotion is overhead.

## Licensing — read before recommending it

Remotion is **not** MIT. It is free for individuals and organizations of **up to 3 people**; a paid Company License is required at 4 or more.

The subtlety that matters for client work: a solo freelancer can use Remotion on client projects for free **if the deliverable is the rendered output**. If the client takes ownership of the Remotion project itself — you hand over the code — then both headcounts aggregate toward the 4-person threshold, and a client with a team of four triggers the license requirement.

Practical consequence: if you deliver source code to clients, ship them the ffmpeg extraction path and keep Remotion in your own pre-production. Confirm current terms at remotion.dev/docs/license before quoting anything, since this is the kind of thing that changes.

The rest of this kit is MIT and has no such constraint.

## Rendering frames

Remotion's `render-frames` output is exactly what the pipeline wants — a numbered image sequence, no extraction step.

```bash
npx remotion render src/index.ts HeroSequence out/frames \
  --sequence \
  --image-format=png \
  --frames=0-119 \
  --width=1600 \
  --props='{"brandColor":"#0B5FFF","product":"assets/device.png"}'
```

`--sequence` writes individual frames instead of encoding a video. Feed `out/frames` straight into `optimize_frames.py`, skipping extraction entirely.

## Composition shape

Keep the composition at the exact frame count the budget calls for, so frame index maps 1:1 to scroll progress with no resampling:

```tsx
<Composition
  id="HeroSequence"
  component={HeroSequence}
  durationInFrames={120}
  fps={30}
  width={1600}
  height={900}
  defaultProps={{ brandColor: '#0B5FFF', product: 'assets/device.png' }}
/>
```

Drive motion from `useCurrentFrame()` and normalize to progress, so changing `durationInFrames` rescales the whole animation rather than truncating it:

```tsx
const frame = useCurrentFrame();
const { durationInFrames } = useVideoConfig();
const progress = frame / (durationInFrames - 1);
```

Avoid `spring()` here. Springs are time-based and feel right at playback speed; under scroll scrubbing the visitor controls the clock, and the spring's settle reads as sluggish. Use `interpolate` with an explicit easing curve so the motion is a pure function of progress.
