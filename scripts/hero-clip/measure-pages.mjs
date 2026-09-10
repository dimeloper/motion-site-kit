/** Reproducible local-harness resource observations, not production speed claims. */
import { startLocalServer } from './local-server.mjs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdir, writeFile } from 'node:fs/promises';
import puppeteer from 'puppeteer-core';

const repo = fileURLToPath(new URL('../../', import.meta.url));
const root = resolve(repo, process.env.MOTION_DOCS_ROOT ?? 'docs');
const { server, url } = await startLocalServer(root);
const routes = process.env.MOTION_ROUTES?.split(',') ?? ['/', '/examples/local/index.html',
  '/examples/saas/index.html', '/examples/commerce/index.html', '/examples/vgpu/demo/index.html'];
let browser;
try {
  browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true, args: ['--enable-unsafe-swiftshader', '--enable-unsafe-webgpu'] });
  const observations = [];
  for (const route of routes) {
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
    const client = await page.createCDPSession();
    await client.send('Network.enable');
    await client.send('Network.setCacheDisabled', { cacheDisabled: true });
    const requests = new Map(), failures = [];
    client.on('Network.requestWillBeSent', e => requests.set(e.requestId, {
      url: e.request.url.replace(url, '<local>'), type: e.type, encodedNetworkBytes: 0,
    }));
    client.on('Network.responseReceived', e => {
      const request = requests.get(e.requestId);
      if (request) Object.assign(request, { status: e.response.status, mime: e.response.mimeType });
    });
    client.on('Network.loadingFinished', e => {
      const request = requests.get(e.requestId);
      if (request) request.encodedNetworkBytes = e.encodedDataLength;
    });
    client.on('Network.loadingFailed', e => failures.push({ url: requests.get(e.requestId)?.url, error: e.errorText }));
    await page.goto(url + route, { waitUntil: 'load', timeout: 60000 });
    await page.waitForFunction(() => {
      const hero = document.querySelector('[data-hero], .stage');
      return hero?.dataset.motion === 'ready' || hero?.dataset.state === 'ready' ||
        !!hero?.dataset.fallbackReason || !!hero?.dataset.reason;
    }, { timeout: 40000 });
    let networkSettled = true;
    try { await page.waitForNetworkIdle({ idleTime: 500, timeout: 10000 }); }
    catch { networkSettled = false; }
    const hero = await page.$eval('[data-hero], .stage', el => ({ ...el.dataset }));
    const resources = [...requests.values()].filter(r => /^https?:|^<local>/.test(r.url));
    observations.push({ route, hero, networkSettled, failures,
      encodedNetworkBytes: resources.reduce((sum, r) => sum + r.encodedNetworkBytes, 0), resources });
    console.log(`${route}: ${observations.at(-1).encodedNetworkBytes.toLocaleString()} observed bytes; ${JSON.stringify(hero)}`);
    if (process.env.MOTION_SCREENSHOT_DIR) {
      const directory = resolve(process.env.MOTION_SCREENSHOT_DIR);
      await mkdir(directory, { recursive: true });
      await page.screenshot({ path: resolve(directory, `${route.replace(/[^a-z0-9]+/gi, '-') || 'root'}.png`), fullPage: true });
    }
    await page.close();
  }
  const result = { observedAt: new Date().toISOString(), browser: await browser.version(),
    method: 'Cold-cache local HTTP harness at 390x844 DPR2; no network throttling. Pinned npm modules replace CDN imports and are served uncompressed. CDP encodedDataLength includes HTTP overhead; external font requests are included when successful. No scroll/lazy below-fold load. Behavioral software-GPU flags enabled; these are resource observations, not production timing or phone benchmarks.',
    observations };
  const destination = resolve(process.env.MOTION_METRICS_OUT ?? resolve(repo, 'out/page-measurements.json'));
  await mkdir(resolve(destination, '..'), { recursive: true });
  await writeFile(destination, JSON.stringify(result, null, 2) + '\n');
  console.log(`Saved ${destination}`);
} finally {
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
}
