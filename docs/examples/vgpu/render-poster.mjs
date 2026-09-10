/** The fallback is rendered from the same authored shader as the live study. */
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { init, effect, target, frame } from 'vgpu/node';
import { PNG } from 'pngjs';
import assert from 'node:assert/strict';

const gpu = await init();
try {
  const width = 1200, height = 900;
  const output = target(gpu, { size: [width, height], format: 'rgba8unorm' });
  const source = await readFile(new URL('./source/material.wgsl', import.meta.url), 'utf8');
  const material = effect(gpu, source, { set: { params: { progress: 0, aspect: width / height, finish: 0 } } });
  const render = async (progress, finish = 0) => {
    material.set({ params: { progress, finish, aspect: width / height } });
    frame(gpu, f => f.pass(output, material));
    return await output.read();
  };
  const first = await render(0);
  const last = await render(1);
  assert.notDeepEqual(first, last, 'scroll must change the image');
  assert.deepEqual(await render(0), first, 'reverse must restore the same pixels');
  await mkdir(new URL('./source/public/', import.meta.url), { recursive: true });
  for (const [finish, name] of [[0, 'poster'], [1, 'poster-champagne'], [2, 'poster-graphite']]) {
    const png = new PNG({ width, height });
    png.data.set(finish === 0 ? first : await render(0, finish));
    await writeFile(new URL(`./source/public/${name}.png`, import.meta.url), PNG.sync.write(png));
  }
  console.log('Rendered poster and verified deterministic forward/reverse pixels on native WebGPU.');
} finally { gpu.dispose(); }
