/** Browser regression checks. Run with npm run test:motion in this directory.
 * Chrome executable may be supplied with CHROME_PATH. Runtime dependencies are
 * served from pinned npm packages so the checks do not depend on a CDN.
 */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { startLocalServer } from './local-server.mjs';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';

const repo = fileURLToPath(new URL('../../', import.meta.url));
const docs = resolve(repo, process.env.MOTION_DOCS_ROOT ?? 'docs');
const modules = resolve(repo, 'scripts/hero-clip/node_modules');
const { server, url } = await startLocalServer(docs);
let browser;
const tests = [];
function test(name, run) { tests.push([name, run]); }
const state = page => page.$eval('[data-hero]', el => el.dataset.motion);
const ready = page => page.waitForFunction(() => document.querySelector('[data-hero]').dataset.motion === 'ready');
const fallback = page => page.waitForFunction(() => !!document.querySelector('[data-hero]').dataset.fallbackReason);

test('forward, reverse and numeric scrub use an actual GSAP animation', async page => {
  await page.evaluateOnNewDocument(() => {
    window.memoryStats = { live: 0, peak: 0 };
    const bitmapIds = new WeakMap();
    const fetchOriginal = window.fetch.bind(window);
    window.fetch = async (...args) => {
      const response = await fetchOriginal(...args);
      const readBlob = response.blob.bind(response);
      response.blob = async () => { const blob = await readBlob(); blob.sourceUrl = String(args[0]); return blob; };
      return response;
    };
    const drawOriginal = CanvasRenderingContext2D.prototype.drawImage;
    CanvasRenderingContext2D.prototype.drawImage = function (...args) {
      window.lastFrameUrl = bitmapIds.get(args[0]);
      return drawOriginal.apply(this, args);
    };
    const decode = window.createImageBitmap.bind(window);
    window.createImageBitmap = async (...args) => {
      const bitmap = await decode(...args);
      bitmapIds.set(bitmap, args[0].sourceUrl);
      const bytes = bitmap.width * bitmap.height * 4;
      window.memoryStats.live += bytes;
      window.memoryStats.peak = Math.max(window.memoryStats.peak, window.memoryStats.live);
      const close = bitmap.close.bind(bitmap);
      bitmap.close = () => { window.memoryStats.live -= bytes; close(); };
      return bitmap;
    };
    window.frameSignature = () => {
      const canvas = document.querySelector('[data-canvas]');
      const pixels = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
      let hash = 2166136261;
      for (let i = 0; i < pixels.length; i += 97) hash = Math.imul(hash ^ pixels[i], 16777619);
      return hash;
    };
  });
  await page.goto(url);
  await ready(page);
  const firstFrame = await page.evaluate(() => window.frameSignature());
  assert.match(await page.evaluate(() => window.lastFrameUrl), /\/avif\//, 'AVIF-capable Chrome should use AVIF');
  await page.evaluate(() => {
    const c = document.querySelector('canvas');
    window.firstPixels = c.getContext('2d').getImageData(0,0,c.width,c.height).data;
  });
  const inspect = () => page.evaluate(async () => {
    const { ScrollTrigger } = await import('/vendor/gsap/ScrollTrigger.js');
    const st = ScrollTrigger.getAll()[0];
    return { linked: !!st.animation, frame: st.animation?.targets()[0].frame, end: st.end };
  });
  const start = await inspect();
  assert.equal(start.linked, true);
  assert.ok(start.frame < 1);
  await page.evaluate(y => window.scrollTo(0, y), start.end * 0.8);
  await page.waitForFunction(async () => {
    const { ScrollTrigger } = await import('/vendor/gsap/ScrollTrigger.js');
    return ScrollTrigger.getAll()[0].animation.targets()[0].frame > 80;
  });
  await page.waitForFunction(first => window.frameSignature() !== first, {}, firstFrame);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await page.waitForFunction(async () => {
    const { ScrollTrigger } = await import('/vendor/gsap/ScrollTrigger.js');
    return ScrollTrigger.getAll()[0].animation.targets()[0].frame < 1;
  });
  await page.waitForFunction(() => window.lastFrameUrl?.endsWith('/0000.webp') || window.lastFrameUrl?.endsWith('/0000.avif'));
  const difference = await page.evaluate(() => {
    const c = document.querySelector('canvas');
    const pixels = c.getContext('2d').getImageData(0,0,c.width,c.height).data;
    let sum=0, max=0;
    for(let i=0;i<pixels.length;i++) { const d=Math.abs(pixels[i]-window.firstPixels[i]);sum+=d;max=Math.max(max,d); }
    return { mean:sum/pixels.length,max };
  });
  console.log('  Reverse pixel difference', difference);
  assert.ok(difference.mean < 2, 'reverse must restore the first image within rasterization tolerance');
  assert.equal(await state(page), 'ready');
  const memory = await page.evaluate(() => window.memoryStats);
  assert.ok(memory.peak <= 128 * 1024 * 1024);
  console.log(`  Peak live bitmap RGBA accounting: ${(memory.peak / 1048576).toFixed(1)} MiB`);
  await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pagehide')));
  await page.waitForFunction(() => window.memoryStats.live === 0);
});

test('failed AVIF capability probe selects WebP and still animates', async page => {
  const requested = [];
  page.on('request', req => { if (/\/frames\/.*\.(avif|webp)$/.test(req.url())) requested.push(req.url()); });
  await page.evaluateOnNewDocument(() => {
    const original = window.fetch.bind(window);
    window.fetch = (...args) => String(args[0]).startsWith('data:image/avif')
      ? Promise.reject(new Error('AVIF unavailable')) : original(...args);
  });
  await page.goto(url);
  await ready(page);
  assert.ok(requested.some(path => path.endsWith('.webp')));
  assert.ok(requested.every(path => !path.endsWith('.avif')));
});

test('reduced motion stays static and does not request a ladder', async page => {
  let requests = 0;
  page.on('request', req => { if (req.url().endsWith('/manifest.json')) requests++; });
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await page.goto(url);
  await fallback(page);
  assert.equal(await state(page), 'static');
  assert.equal(requests, 0);
  assert.equal(await page.$$eval('.pin-spacer', els => els.length), 0);
});

test('a missing frame returns to the poster and releases decoded bitmaps', async page => {
  await page.evaluateOnNewDocument(() => {
    window.bitmapStats = { opened: 0, closed: 0 };
    const decode = window.createImageBitmap.bind(window);
    window.createImageBitmap = async (...args) => {
      const bitmap = await decode(...args);
      window.bitmapStats.opened++;
      const close = bitmap.close.bind(bitmap);
      bitmap.close = () => { window.bitmapStats.closed++; close(); };
      return bitmap;
    };
  });
  await page.setRequestInterception(true);
  page.on('request', req => req.url().includes('/avif/0007.') || req.url().includes('/webp/0007.')
    ? req.respond({ status: 404 }) : req.continue());
  await page.goto(url);
  await fallback(page);
  const stats = await page.evaluate(() => window.bitmapStats);
  assert.equal(stats.opened, stats.closed);
  assert.equal(await page.$eval('[data-canvas]', el => el.classList.contains('is-ready')), false);
});

test('overlapping initialization cannot remove the newer animation', async page => {
  await page.goto(url);
  await ready(page);
  await page.evaluate(async () => {
    const { initMotion } = await import('/src/motion.js');
    await Promise.all([initMotion(), initMotion()]);
  });
  assert.equal(await state(page), 'ready');
  assert.equal(await page.$$eval('.pin-spacer', els => els.length), 1);
});

test('loading deadline returns to a usable poster', async page => {
  await page.setRequestInterception(true);
  page.on('request', async req => {
    if (req.url().endsWith('/config.js')) {
      const config = (await readFile(resolve(docs, 'config.js'), 'utf8')).replace('loadTimeoutMs: 30000', 'loadTimeoutMs: 150');
      await req.respond({ status: 200, contentType: 'text/javascript', body: config });
    } else if (req.url().endsWith('/manifest.json')) {
      // Deliberately pending until the engine aborts the request.
    } else await req.continue();
  });
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await fallback(page);
  assert.equal(await state(page), 'static');
});

test('late decode failure releases the renderer and returns to the poster', async page => {
  await page.setRequestInterception(true);
  page.on('request', req => /\/(avif|webp)\/0007\./.test(req.url())
    ? req.respond({ status: 200, contentType: 'image/avif', body: 'broken image' }) : req.continue());
  await page.goto(url);
  await fallback(page);
  assert.equal(await page.$eval('[data-hero]', el => el.dataset.fallbackReason), 'decode-failed');
  assert.equal(await page.$$eval('.pin-spacer', els => els.length), 0);
});

test('pagehide releases pin and pageshow restores exactly one animation', async page => {
  await page.goto(url);
  await ready(page);
  await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pagehide', { persisted: true })));
  assert.equal(await state(page), 'static');
  assert.equal(await page.$$eval('.pin-spacer', els => els.length), 0);
  await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true })));
  await ready(page);
  assert.equal(await page.$$eval('.pin-spacer', els => els.length), 1);
});

test('desktop 1600px sequence stays within the same bitmap budget', async page => {
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await tests[0][1](page);
});

for (const name of ['local', 'saas', 'commerce']) {
  test(`${name}: offscreen suspension and context-loss fallback`, async page => {
    await page.evaluateOnNewDocument(() => {
      window.gpuDraws = 0;
      const Observer = window.IntersectionObserver;
      window.IntersectionObserver = class extends Observer {
        constructor(callback, options) {
          super((entries, observer) => {
            for (const entry of entries) {
              if (entry.target.hasAttribute('data-hero')) window.heroIntersection = entry.isIntersecting;
            }
            // Model a browser delivery that batches an earlier visible crossing
            // with the newest offscreen crossing. Consumers must use the latest.
            const last = entries.at(-1);
            if (last?.target.hasAttribute('data-hero') && !last.isIntersecting) {
              callback([{ target: last.target, isIntersecting: true }, ...entries], observer);
            } else callback(entries, observer);
          }, options);
        }
      };
      for (const name of ['drawArrays', 'drawElements']) {
        const original = WebGL2RenderingContext.prototype[name];
        WebGL2RenderingContext.prototype[name] = function (...args) {
          window.gpuDraws++;
          return original.apply(this, args);
        };
      }
    });
    await page.goto(`${url}/examples/${name}/index.html`);
    await ready(page);
    await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
    await page.waitForFunction(() => document.querySelector('[data-hero]').getBoundingClientRect().bottom < 0);
    // Geometry changes before the browser necessarily delivers its observer
    // callback. Wait for that delivery, then assert actual GPU submissions stop.
    await page.waitForFunction(() => window.heroIntersection === false);
    const paused = await page.evaluate(async () => {
      await new Promise(resolve => setTimeout(resolve, 300));
      const before = window.gpuDraws;
      await new Promise(resolve => setTimeout(resolve, 300));
      return { before, after: window.gpuDraws, bottom: document.querySelector('[data-hero]').getBoundingClientRect().bottom, scroll: scrollY };
    });
    assert.equal(paused.before, paused.after, `offscreen hero should not submit GPU draws: ${JSON.stringify(paused)}`);
    const before = await page.evaluate(() => window.gpuDraws);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await page.waitForFunction(before => window.gpuDraws > before, {}, before);
    await page.evaluate(() => {
      const canvas = document.querySelector('[data-canvas]');
      const context = canvas.getContext('webgl2');
      context.getExtension('WEBGL_lose_context').loseContext();
    });
    await fallback(page);
    assert.equal(await page.$eval('[data-hero]', el => el.dataset.fallbackReason), 'context-lost');
    assert.equal(await page.$$eval('.pin-spacer', els => els.length), 0);
    assert.ok(await page.$eval('.hero__poster', el => Number(getComputedStyle(el).opacity) > 0));
  });
}

test('failed Halo model returns to the real poster', async page => {
  await page.setRequestInterception(true);
  page.on('request', req => req.url().endsWith('.glb') ? req.respond({ status: 404 }) : req.continue());
  await page.goto(`${url}/examples/commerce/index.html`);
  await fallback(page);
  assert.equal(await page.$eval('[data-hero]', el => el.dataset.fallbackReason), 'webgl-failed');
});

for (const demo of ['local', 'saas', 'commerce']) {
  test(`${demo}: keyboard menu and accessibility`, async page => {
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    await page.goto(`${url}/examples/${demo}/index.html`);
    await fallback(page);
    await page.addScriptTag({ path: resolve(modules, 'axe-core/axe.min.js') });
    const audit = async () => {
      const violations = await page.evaluate(async () => (await window.axe.run(document, {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] },
      })).violations.map(v => ({ id: v.id, targets: v.nodes.map(n => ({ target: n.target, summary: n.failureSummary })) })));
      assert.deepEqual(violations, []);
    };
    await audit();
    await page.focus('[data-menu-open]');
    await page.keyboard.press('Enter');
    await page.waitForFunction(() => document.activeElement === document.querySelector('[data-menu-close]'));
    assert.equal(await page.$eval('[data-menu-open]', el => el.getAttribute('aria-expanded')), 'true');
    await page.keyboard.down('Shift');
    await page.keyboard.press('Tab');
    await page.keyboard.up('Shift');
    assert.ok(await page.evaluate(() => document.querySelector('[data-nav-menu]').contains(document.activeElement)));
    await page.keyboard.press('Tab');
    assert.ok(await page.evaluate(() => document.querySelector('[data-nav-menu]').contains(document.activeElement)));
    await audit();
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => document.querySelector('[data-nav-menu]').hidden);
    assert.ok(await page.evaluate(() => document.activeElement === document.querySelector('[data-menu-open]')));
    assert.equal(await page.$eval('[data-menu-open]', el => el.getAttribute('aria-expanded')), 'false');
  });
}

for (const demo of ['local', 'saas', 'commerce']) {
  test(`${demo}: reopening a menu survives the previous close timer`, async page => {
    await page.evaluateOnNewDocument(() => {
      const original = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (type, ...args) {
        return /webgl/.test(type) ? null : original.call(this, type, ...args);
      };
    });
    await page.goto(`${url}/examples/${demo}/index.html`);
    await fallback(page);
    await page.click('[data-menu-open]');
    await page.waitForFunction(() => document.querySelector('[data-nav-menu]').classList.contains('is-open'));
    await page.evaluate(() => {
      document.querySelector('[data-menu-close]').click();
      document.querySelector('[data-nav-menu]').dispatchEvent(new TransitionEvent('transitionend', { propertyName: 'opacity' }));
      document.querySelector('[data-menu-open]').click();
    });
    await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 500)));
    assert.equal(await page.$eval('[data-nav-menu]', menu => menu.hidden), false);
    assert.ok(await page.evaluate(() => document.querySelector('[data-nav-menu]').contains(document.activeElement)));
  });
}

test('invalid concurrency returns to poster before fetching frames', async page => {
  let ladders = 0;
  await page.setRequestInterception(true);
  page.on('request', async req => {
    if (req.url().endsWith('/manifest.json')) ladders++;
    if (req.url().endsWith('/config.js')) {
      const body = (await readFile(resolve(docs, 'config.js'), 'utf8')).replace('concurrency: 8', 'concurrency: 0');
      await req.respond({ status: 200, contentType: 'text/javascript', body });
    } else await req.continue();
  });
  await page.goto(url);
  await fallback(page);
  assert.equal(await page.$eval('[data-hero]', el => el.dataset.fallbackReason), 'invalid-config');
  assert.equal(ladders, 0);
});

test('changing reduced motion stops an active frame hero and can restore it', async page => {
  await page.goto(url);
  await ready(page);
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await fallback(page);
  assert.equal(await state(page), 'static');
  assert.equal(await page.$$eval('.pin-spacer', els => els.length), 0);
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);
  await ready(page);
  assert.equal(await page.$$eval('.pin-spacer', els => els.length), 1);
});

test('vgpu unavailable keeps its real poster without loading the engine', async page => {
  const engines = [];
  page.on('request', req => { if (req.url().includes('/engine-')) engines.push(req.url()); });
  await page.evaluateOnNewDocument(() => Object.defineProperty(navigator, 'gpu', { value: undefined }));
  await page.goto(`${url}/examples/vgpu/demo/index.html`);
  await page.waitForFunction(() => document.querySelector('.stage').dataset.reason === 'no-webgpu');
  assert.equal(engines.length, 0);
  assert.ok(await page.$eval('.stage img', img => img.complete && img.naturalWidth > 0));
  await page.click('[data-finish="1"]');
  await page.waitForFunction(() => {
    const image = document.querySelector('.artwork img');
    return image.src.endsWith('poster-champagne.png') && image.complete;
  });
  assert.equal(await page.$eval('[data-finish="1"]', el => el.getAttribute('aria-pressed')), 'true');
  await page.addScriptTag({ path: resolve(modules, 'axe-core/axe.min.js') });
  assert.deepEqual(await page.evaluate(async () => (await window.axe.run(document, {
    runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] },
  })).violations.map(v => ({ id: v.id, targets: v.nodes.map(n => n.target) }))), []);
  await page.screenshot({ path: '/tmp/motion-fold-mobile.png', fullPage: true });
});

test('vgpu accepts finish selection and reduced motion while initialization is pending', async page => {
  await page.evaluateOnNewDocument(() => Object.defineProperty(navigator, 'gpu', { value: {} }));
  await page.setRequestInterception(true);
  page.on('request', async request => {
    if (request.url().includes('/engine-')) {
      await request.respond({ status: 200, contentType: 'text/javascript', body: `
        export async function createStudy() {
          await new Promise(resolve => { window.releaseStudy = resolve; });
          return { draw() {}, dispose() { window.studyDisposed = true; } };
        }
      ` });
    } else await request.continue();
  });
  await page.goto(`${url}/examples/vgpu/demo/index.html`);
  await page.waitForFunction(() => !!window.releaseStudy);
  await page.click('[data-finish="1"]');
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  assert.equal(await page.$eval('.stage', el => el.dataset.reason), undefined,
    'selecting a finish before initialization must not fail the renderer');
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await page.waitForFunction(() => document.querySelector('.stage').dataset.reason === 'reduced-motion');
  await page.evaluate(() => window.releaseStudy());
  await page.waitForFunction(() => window.studyDisposed);
  assert.equal(await page.$eval('.stage', el => el.dataset.state), 'static');
});

test('vgpu renders, reverses and falls back after device loss when available', async page => {
  await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1 });
  await page.evaluateOnNewDocument(() => {
    if (typeof GPUAdapter === 'undefined') return;
    const original = GPUAdapter.prototype.requestDevice;
    GPUAdapter.prototype.requestDevice = async function (...args) {
      const device = await original.apply(this, args);
      window.testDevice = device;
      device.lost.then(info => { window.testDeviceFailure = { reason: info.reason, message: info.message }; });
      device.addEventListener('uncapturederror', event => {
        window.testDeviceFailure = { error: event.error.message };
      });
      return device;
    };
  });
  await page.goto(`${url}/examples/vgpu/demo/index.html`);
  await page.waitForFunction(() => {
    const state = document.querySelector('.stage').dataset;
    return state.state === 'ready' || !!state.reason;
  });
  // A software adapter may fail asynchronously after the first submission,
  // while the canvas is still fading in. Ready is not a permanent state.
  await page.waitForFunction(() => !!document.querySelector('.stage').dataset.reason ||
    Number(getComputedStyle(document.querySelector('canvas')).opacity) === 1);
  const status = await page.$eval('.stage', el => ({ ...el.dataset }));
  if (status.state !== 'ready') {
    assert.equal(status.state, 'static');
    assert.ok(await page.$eval('.stage img', img => img.complete && img.naturalWidth > 0));
    assert.equal(await page.$eval('.track', el => el.classList.contains('is-live')), false);
    console.log('  Adapter diagnostic:', await page.evaluate(() => window.testDeviceFailure ?? null));
    console.log(`  Browser WebGPU unavailable: ${status.reason}; native shader pixel tests are separate.`);
    return;
  }
  const move = async progress => {
    await page.evaluate(progress => {
      const track = document.querySelector('.track'), stage = document.querySelector('.stage');
      window.scrollTo({ top: track.offsetTop + progress * (track.offsetHeight - stage.offsetHeight) - parseFloat(getComputedStyle(stage).top), behavior: 'instant' });
    }, progress);
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    await page.evaluate(() => window.testDevice.queue.onSubmittedWorkDone());
    // Element screenshots can scroll an oversized artwork into view, changing
    // the very scroll progress being tested. Capture the visible stage directly.
    const clip = await page.$eval('.stage', el => {
      const r = el.getBoundingClientRect();
      return { x: r.left + scrollX, y: Math.max(0, r.top) + scrollY,
        width: r.width, height: Math.min(r.height, innerHeight - Math.max(0, r.top)) };
    });
    return await page.screenshot({ clip, captureBeyondViewport: false });
  };
  const first = await move(0);
  const last = await move(1);
  const hash = bytes => createHash('sha256').update(bytes).digest('hex');
  assert.notEqual(hash(first), hash(last), 'scroll must visibly change the study');
  const reverse = await move(0);
  assert.equal(hash(first), hash(reverse), 'reverse must restore the study');
  await page.screenshot({ path: '/tmp/motion-fold-desktop.png' });
  await page.evaluate(() => window.testDevice.destroy());
  await page.waitForFunction(() => document.querySelector('.stage').dataset.state === 'static');
  assert.ok(await page.$eval('.stage img', img => img.complete && img.naturalWidth > 0));
});

test('docs remains readable without JavaScript and exposes real example links', async page => {
  await page.setViewport({ width: 320, height: 800, deviceScaleFactor: 1 });
  await page.setJavaScriptEnabled(false);
  await page.goto(url);
  assert.equal(await page.$eval('h1', el => el.textContent.replace(/\s+/g, ' ')), 'Make theweb move.');
  assert.equal(await page.$$eval('.project', items => items.length), 4);
  assert.ok(await page.$eval('[data-hero] img', img => img.complete && img.naturalWidth > 0));
  assert.equal(await page.$eval('[data-loader]', el => getComputedStyle(el).display), 'none');
  assert.ok(await page.$eval('#setup', el => el.textContent.includes('git clone')));
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
});

test('docs copy controls and catalog search, selection and config work', async page => {
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await page.evaluateOnNewDocument(() => Object.defineProperty(navigator, 'clipboard', {
    value: { writeText: async text => { window.copiedText = text; } },
  }));
  await page.goto(url);
  await page.click('[data-copy]');
  assert.ok(await page.evaluate(() => window.copiedText.includes('git clone')));
  await page.addScriptTag({ path: resolve(modules, 'axe-core/axe.min.js') });
  const audit = () => page.evaluate(async () => (await window.axe.run(document, {
    runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] },
  })).violations.map(v => ({ id: v.id, targets: v.nodes.map(n => n.target) })));
  assert.deepEqual(await audit(), []);
  await page.goto(`${url}/kit/index.html`);
  await page.waitForSelector('[data-family="featured-work"]');
  await page.type('#family-search', 'material');
  assert.equal(await page.$$eval('.catalog-families button:not([hidden])', els => els.length), 1);
  await page.click('.catalog-families button:not([hidden])');
  assert.equal(await page.$eval('.catalog-preview [data-family]', el => el.dataset.family), 'material-board');
  await page.click('[data-copy]');
  assert.equal(await page.evaluate(() => JSON.parse(window.copiedText).type), 'material-board');
  await page.$eval('#family-search', el => { el.value = ''; el.dispatchEvent(new Event('input')); });
  const families = await page.$$eval('.catalog-families button', els => els.map(el => el.dataset.family));
  assert.equal(families.length, 30);
  for (const family of families) {
    await page.click(`.catalog-families button[data-family="${family}"]`);
    assert.equal(await page.$eval('[data-source]', el => JSON.parse(el.textContent).type), family);
    assert.equal(await page.$$eval('h1', els => els.length), 1);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${family} overflows`);
  }
  await page.click('.catalog-families button[data-family="featured-work"]');
  await page.addScriptTag({ path: resolve(modules, 'axe-core/axe.min.js') });
  assert.deepEqual(await audit(), []);
});

try {
  browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args: ['--enable-unsafe-swiftshader', '--enable-unsafe-webgpu'] });
  if (process.env.TEST_FILTER && !tests.some(([name]) => name.includes(process.env.TEST_FILTER))) {
    throw new Error(`No tests match TEST_FILTER=${process.env.TEST_FILTER}`);
  }
  for (const [name, run] of tests) {
    if (process.env.TEST_FILTER && !name.includes(process.env.TEST_FILTER)) continue;
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
    try { await run(page); assert.deepEqual(errors, []); console.log(`PASS ${name}`); }
    finally { await page.close(); }
  }
} finally {
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
}
