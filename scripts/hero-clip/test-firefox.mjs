/** Optional installed-Firefox checks through Puppeteer's WebDriver BiDi backend. */
import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';
import { startLocalServer } from './local-server.mjs';

const repo = fileURLToPath(new URL('../../', import.meta.url));
const { server, url } = await startLocalServer(resolve(repo, 'docs'));
let browser;
try {
  browser = await puppeteer.launch({ browser: 'firefox', headless: true,
    executablePath: process.env.FIREFOX_PATH ?? '/Applications/Firefox.app/Contents/MacOS/firefox',
    extraPrefsFirefox: { 'dom.webgpu.enabled': false } });
  console.log(await browser.version());
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.setViewport({ width: 390, height: 844 });
  await page.goto(url);
  await page.waitForFunction(() => { const d = document.querySelector('[data-hero]').dataset; return d.motion === 'ready' || !!d.fallbackReason; });
  const initial = await page.$eval('[data-hero]', el => ({ ...el.dataset }));
  assert.equal(initial.motion, 'ready', JSON.stringify(initial));
  const first = await page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    return Array.from(canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data.filter((_, i) => i % 97 === 0));
  });
  await page.evaluate(async () => {
    const { ScrollTrigger } = await import('/vendor/gsap/ScrollTrigger.js');
    window.scrollTo(0, ScrollTrigger.getAll()[0].end * 0.8);
  });
  await page.waitForFunction(async () => {
    const { ScrollTrigger } = await import('/vendor/gsap/ScrollTrigger.js');
    return ScrollTrigger.getAll()[0].animation.targets()[0].frame > 80;
  });
  const signature = () => page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    return Array.from(canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data.filter((_, i) => i % 97 === 0));
  });
  assert.notDeepEqual(await signature(), first);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForFunction(async first => {
    const canvas = document.querySelector('canvas');
    const pixels = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data.filter((_, i) => i % 97 === 0);
    return pixels.length === first.length && pixels.reduce((sum, value, i) => sum + Math.abs(value - first[i]), 0) / pixels.length < 2;
  }, {}, first);
  console.log('PASS Firefox frame forward/reverse output');
  assert.deepEqual(errors, []);
  await page.close();
  const posterPage = await browser.newPage();
  const posterErrors = [];
  posterPage.on('pageerror', error => posterErrors.push(error.message));
  await posterPage.goto(url + '/examples/vgpu/demo/index.html');
  await posterPage.waitForFunction(() => document.querySelector('.stage').dataset.reason === 'no-webgpu');
  assert.ok(await posterPage.$eval('.stage img', img => img.complete && img.naturalWidth > 0));
  console.log('PASS Firefox vgpu poster fallback');
  assert.deepEqual(posterErrors, []);
  await browser.close();
  browser = await puppeteer.launch({ browser: 'firefox', headless: true,
    executablePath: process.env.FIREFOX_PATH ?? '/Applications/Firefox.app/Contents/MacOS/firefox',
    extraPrefsFirefox: { 'ui.prefersReducedMotion': 1 } });
  const reduced = await browser.newPage();
  await reduced.goto(url);
  await reduced.waitForFunction(() => !!document.querySelector('[data-hero]').dataset.fallbackReason);
  assert.equal(await reduced.$eval('[data-hero]', el => el.dataset.motion), 'static');
  assert.ok(await reduced.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches));
  assert.equal(await reduced.$$eval('.pin-spacer', els => els.length), 0);
  console.log('PASS Firefox reduced-motion preference fallback');
} finally {
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
}
