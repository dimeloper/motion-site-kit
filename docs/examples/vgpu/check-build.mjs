/** Rebuild outside the checkout, compare published bytes, and enforce transfer ceilings. */
import { mkdtemp, readdir, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { gzipSync } from 'node:zlib';
import assert from 'node:assert/strict';

const root = fileURLToPath(new URL('.', import.meta.url));
const scratch = await mkdtemp(join(tmpdir(), 'motion-vgpu-build-'));
async function files(directory, prefix = '') {
  const found = [];
  for (const item of await readdir(join(directory, prefix), { withFileTypes: true })) {
    const name = join(prefix, item.name);
    found.push(...(item.isDirectory() ? await files(directory, name) : [name]));
  }
  return found.sort();
}
try {
  execFileSync(process.execPath, ['node_modules/vite/bin/vite.js', 'build', '--outDir', scratch], { cwd: root, stdio: 'inherit' });
  const generated = await files(scratch);
  assert.deepEqual(await files(join(root, 'demo')), generated, 'Published file list is stale: run npm run build');
  let js = 0;
  for (const name of generated) {
    const bytes = await readFile(join(scratch, name));
    assert.deepEqual(await readFile(join(root, 'demo', name)), bytes, `${name} is stale: run npm run build`);
    if (name.endsWith('.js')) js += gzipSync(bytes, { level: 9 }).length;
  }
  // Current total JS is ~44 kB gzip. 56 KiB allows modest growth without
  // quietly turning this single material study into a general scene engine.
  assert.ok(js <= 56 * 1024, `JS gzip budget exceeded: ${js} bytes; remove imports/shader complexity`);
  // Each finish has a real fallback. Apply the original ceiling to every one.
  for (const name of ['poster.png', 'poster-champagne.png', 'poster-graphite.png']) {
    const bytes = (await readFile(join(scratch, name))).length;
    assert.ok(bytes <= 400 * 1024, `${name} exceeds 400 KiB: ${bytes}; simplify or re-encode it`);
    console.log(`${name}: ${bytes.toLocaleString()} / 409,600 bytes`);
  }
  console.log(`Published build matches source. JS gzip: ${js.toLocaleString()} / 57,344 bytes.`);
} finally { await rm(scratch, { recursive: true, force: true }); }
