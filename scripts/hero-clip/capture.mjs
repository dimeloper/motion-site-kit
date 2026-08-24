#!/usr/bin/env node
/**
 * Capture 120 PNGs of a Three.js studio scene.
 *
 *   python3 -m http.server 8090 --directory scripts/hero-clip
 *   node scripts/hero-clip/capture.mjs
 *   HERO_CLIP_PAGE=saas.html HERO_CLIP_OUT=frames/raw-saas node scripts/hero-clip/capture.mjs
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');
const PAGE = process.env.HERO_CLIP_PAGE || 'index.html';
const OUT = process.env.HERO_CLIP_OUT
  ? join(ROOT, process.env.HERO_CLIP_OUT)
  : join(ROOT, 'frames/raw');
const COUNT = Number(process.env.HERO_CLIP_COUNT || 120);
const INDICES = process.env.HERO_CLIP_INDICES
  ? process.env.HERO_CLIP_INDICES.split(',').map(Number)
  : Array.from({ length: COUNT }, (_, i) => i);
const WIDTH = 1600;
const HEIGHT = 900;
const BASE = process.env.HERO_CLIP_URL || 'http://127.0.0.1:8090';
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

await mkdir(OUT, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--use-gl=angle', '--use-angle=metal', '--ignore-certificate-errors'],
});

try {
  const page = await browser.newPage();
  await page.setViewport({ width: WIDTH, height: HEIGHT, deviceScaleFactor: 1 });
  await page.goto(`${BASE}/${PAGE}?count=${COUNT}&w=${WIDTH}&h=${HEIGHT}`, {
    waitUntil: 'networkidle0',
    timeout: 60000,
  });
  await page.waitForFunction(() => document.documentElement.dataset.ready === '1', { timeout: 30000 });

  for (const i of INDICES) {
    await page.evaluate((frame) => window.renderFrame(frame), i);
    const canvas = await page.$('canvas');
    const buf = await canvas.screenshot({ type: 'png' });
    await writeFile(join(OUT, String(i).padStart(4, '0') + '.png'), buf);
    if (i % 15 === 0 || i === INDICES.at(-1)) console.error(`captured ${i + 1}/${COUNT}`);
  }
} finally {
  await browser.close();
}

console.log(`wrote ${COUNT} frames -> ${OUT}`);
