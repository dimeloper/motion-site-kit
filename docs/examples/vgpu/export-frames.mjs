/** Bake the exact material shader into the default pipeline's PNG input format. */
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { createHash } from 'node:crypto';
import { init, effect, target, frame } from 'vgpu/node';
import { PNG } from 'pngjs';

const outputDirectory = process.argv[2];
if (!outputDirectory) throw new Error('Usage: node export-frames.mjs NEW_OUTPUT_DIRECTORY');
const outputPath = resolve(outputDirectory);
// Refuse an existing directory so a rerun cannot silently mix old/new frames.
await mkdir(outputPath);
const shaderPath = process.env.FOLD_SHADER ?? './source/material.wgsl';
const source = await readFile(new URL(shaderPath, import.meta.url), 'utf8');
const width = 1600, height = 1200, count = 120;
const paramsAt = progress => ({ progress, aspect: width / height,
  ...(/finish\s*:\s*f32/.test(source) ? { finish: 0 } : {}) });
const gpu = await init();
try {
  const image = target(gpu, { size: [width, height], format: 'rgba8unorm' });
  const material = effect(gpu, source, { set: { params: paramsAt(0) } });
  for (let i = 0; i < count; i++) {
    material.set({ params: paramsAt(i / (count - 1)) });
    frame(gpu, f => f.pass(image, material));
    const png = new PNG({ width, height });
    png.data.set(await image.read());
    // Flatten transparent studio pixels onto the page paper for frame formats.
    for (let pixel = 0; pixel < png.data.length; pixel += 4) {
      const alpha = png.data[pixel + 3] / 255;
      for (let channel = 0; channel < 3; channel++) {
        png.data[pixel + channel] = Math.round(png.data[pixel + channel] + [239, 238, 233][channel] * (1 - alpha));
      }
      png.data[pixel + 3] = 255;
    }
    await writeFile(join(outputPath, `${String(i).padStart(4, '0')}.png`), PNG.sync.write(png));
    if ((i + 1) % 30 === 0) console.log(`Rendered ${i + 1}/${count}`);
  }
  await writeFile(join(outputPath, 'provenance.json'), JSON.stringify({
    source: `docs/examples/vgpu/${shaderPath.replace(/^\.\//, '')}`,
    background: '#efeee9',
    sourceSha256: createHash('sha256').update(source).digest('hex'),
    renderer: 'vgpu 0.4.1 native WebGPU', width, height, count,
    progress: 'index / (count - 1)', license: 'MIT (authored for motion-site-kit)',
    note: 'Deterministic stylized material study; no external footage. GPU implementations may round pixels differently.',
  }, null, 2) + '\n');
  console.log(`Exported ${count} frames with source provenance to ${outputPath}`);
} finally { gpu.dispose(); }
