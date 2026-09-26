/** Real Safari smoke checks through Apple's installed safaridriver.
 * Run safaridriver -p 4444 first, with Safari's Allow remote automation enabled.
 * Set SAFARI_DEVICE_UDID and SAFARI_BASE_URL to test a connected physical iPhone.
 * The base URL must be reachable from the phone; HTTPS is required for live WebGPU.
 * Or set SAFARI_DEVICE_UDID and SAFARI_LAN_HOST (this Mac's address on the phone's
 * network) to serve the local build to the phone, which also runs the late-pin
 * check that needs this script to hold frame responses.
 */
import { startLocalServer } from './local-server.mjs';
import { resolve } from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { FAMILIES } from '../../docs/kit/compose.js';
const endpoint = process.env.SAFARI_WEBDRIVER_URL ?? 'http://127.0.0.1:4444';
const device = process.env.SAFARI_DEVICE_UDID;
const lanHost = process.env.SAFARI_LAN_HOST;
if (device && !process.env.SAFARI_BASE_URL && !lanHost) {
  throw new Error('Physical-device tests need SAFARI_BASE_URL or SAFARI_LAN_HOST; 127.0.0.1 is the Mac, not the phone');
}
const local = process.env.SAFARI_BASE_URL ? null
  : await startLocalServer(resolve('docs'), lanHost ? { host: '0.0.0.0', publicHost: lanHost } : {});
const url = (process.env.SAFARI_BASE_URL ?? local.url).replace(/\/$/, '');
const output = resolve(process.env.SAFARI_OUT ?? (device ? 'out/iphone-qa' : 'out/safari-qa'));
await mkdir(output, { recursive: true });
let session;
const observations = [];
async function command(path, body, method = 'POST') {
  const response = await fetch(endpoint + path, { method, headers: { 'Content-Type': 'application/json' },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
  const result = await response.json();
  if (!response.ok || result.value?.error) throw new Error(result.value?.message ?? JSON.stringify(result));
  return result.value;
}
const run = (script, args = []) => command(`/session/${session}/execute/sync`, { script, args });
async function until(script, timeout = 45000) {
  const end = Date.now() + timeout;
  while (Date.now() < end) {
    const value = await run(script);
    if (value) return value;
    await new Promise(resolve => setTimeout(resolve, 150));
  }
  throw new Error(`Safari condition timed out: ${script}`);
}
async function screenshot(name) {
  const png = await command(`/session/${session}/screenshot`, undefined, 'GET');
  await writeFile(resolve(output, name + '.png'), Buffer.from(png, 'base64'));
}
try {
  const created = await command('/session', { capabilities: { alwaysMatch: { browserName: 'safari', ...(device ? { platformName: 'iOS', 'safari:useSimulator': false, 'safari:deviceUDID': device } : {}) } } });
  session = created.sessionId;
  console.log(`Safari ${created.capabilities.browserVersion}`);
  if (!device) await command(`/session/${session}/window/rect`, { width: 1440, height: 1000 });
  for (const [name, route] of [['docs', '/'], ['harbor', '/examples/local/index.html'],
    ['vortex', '/examples/saas/index.html'], ['halo', '/examples/commerce/index.html'], ['fold', '/examples/vgpu/demo/index.html']]) {
    await command(`/session/${session}/url`, { url: url + route });
    const state = await until(`const el = document.querySelector('[data-hero],.stage');
      return el && (el.dataset.motion === 'ready' || el.dataset.state === 'ready' || el.dataset.fallbackReason || el.dataset.reason) && {...el.dataset};`);
    assert.ok(await run(`const img=document.querySelector('[data-hero] img,.artwork img');return img.complete && img.naturalWidth>0;`), `${name}: real poster`);
    assert.equal(await run('return document.documentElement.scrollWidth > innerWidth;'), false, `${name}: overflow`);
    if (name !== 'fold') assert.equal(state.motion, 'ready', `${name}: motion initialization`);
    await until(`const loader=document.querySelector('[data-loader]');return !loader || getComputedStyle(loader).display==='none' || Number(getComputedStyle(loader).opacity)===0;`, 10000);
    await screenshot(name + '-start');
    if (name === 'docs') {
      await run(`window.firstPixels = Array.from(document.querySelector('canvas').getContext('2d').getImageData(0,0,document.querySelector('canvas').width,document.querySelector('canvas').height).data);window.scrollTo({top:innerHeight*2,behavior:'instant'});`);
      const difference = `const c=document.querySelector('canvas'),p=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let sum=0;for(let i=0;i<p.length;i+=16)sum+=Math.abs(p[i]-window.firstPixels[i]);return sum/(p.length/16);`;
      await until(difference.replace('return sum/(p.length/16);', 'return sum/(p.length/16)>2;'));
      await screenshot('docs-forward');
      await run(`window.scrollTo({top:0,behavior:'instant'});`);
      await until(difference.replace('return sum/(p.length/16);', 'return sum/(p.length/16)<2;'));
      observations.push({ name, state, forwardReverse: 'passed' });
    } else if (name !== 'fold') {
      await run(`window.scrollTo({top:innerHeight*1.5,behavior:'instant'});`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      await screenshot(name + '-forward');
      await run(`window.scrollTo({top:0,behavior:'instant'});`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      await screenshot(name + '-reverse');
      await run(`document.querySelector('[data-menu-open]').click();`);
      await until(`return document.querySelector('[data-menu-open]').getAttribute('aria-expanded')==='true';`);
      await run(`document.querySelector('[data-menu-close]').click();`);
      await until(`return document.querySelector('[data-nav-menu]').hidden;`);
      await run(`document.querySelector('canvas').getContext('webgl2').getExtension('WEBGL_lose_context').loseContext();`);
      await until(`return document.querySelector('[data-hero]').dataset.fallbackReason==='context-lost';`);
      observations.push({ name, state, menuAndContextLoss: 'passed', motionScreenshots: 'captured for visual review' });
    } else {
      await run(`document.querySelector('[data-finish="1"]').click();`);
      await until(`const img=document.querySelector('.artwork img');return img.src.endsWith('poster-champagne.png')&&img.complete;`);
      await screenshot('fold-champagne');
      observations.push({ name, state, finishSelection: 'passed', liveWebGPU: state.state === 'ready' });
    }
    console.log(`PASS Safari ${name}: ${JSON.stringify(observations.at(-1))}`);
  }
  await command(`/session/${session}/url`, { url: url + '/kit/index.html' });
  await until(`return document.querySelectorAll('.catalog-families button').length===${FAMILIES.length};`);
  await run(`const s=document.querySelector('#family-search');s.value='material';s.dispatchEvent(new Event('input'));document.querySelector('.catalog-families button:not([hidden])').click();`);
  assert.equal(await run(`return document.querySelector('.catalog-preview [data-family]').dataset.family;`), 'material-board');
  await screenshot('catalog');
  observations.push({ name: 'catalog', searchAndSelection: 'passed' });
  console.log('PASS Safari catalog search and selection');
  if (local) {
    // Safari has no scroll anchoring, so this is where a late pin would move
    // the page under a visitor who scrolled past the hero while it loaded.
    local.holdFrames();
    await command(`/session/${session}/url`, { url: `${url}/?pin=${Date.now()}` });
    await until(`return document.querySelector('[data-hero]').dataset.motion === 'preloading';`);
    await run(`window.scrollTo({ top: 2400, behavior: 'instant' });`);
    await until(`return Math.abs(scrollY - 2400) < 2;`);
    const before = await run(`const el = document.elementFromPoint(innerWidth / 2, innerHeight / 2); el.dataset.probe = '1'; return el.getBoundingClientRect().top;`);
    local.releaseFrames();
    await until(`return document.querySelector('[data-hero]').dataset.motion === 'ready';`);
    await new Promise(resolve => setTimeout(resolve, 700));
    const moved = await run(`return document.querySelector('[data-probe]').getBoundingClientRect().top;`) - before;
    assert.ok(Math.abs(moved) <= 2, `content moved ${moved}px when the pin engaged`);
    observations.push({ name: 'late-pin', contentMoved: Math.round(moved) });
    console.log(`PASS Safari late pin keeps the page still: moved ${Math.round(moved)}px`);
  }
  await writeFile(resolve(output, 'results.json'), JSON.stringify({ observedAt: new Date().toISOString(), capabilities: created.capabilities,
    scope: device ? 'Physical iPhone Safari via USB WebDriver. Network type not established; no cellular or performance claim.' : 'Real macOS Safari. No physical-phone, cellular or performance claim.', baseUrl: url, observations }, null, 2) + '\n');
} finally {
  if (session) await command(`/session/${session}`, undefined, 'DELETE').catch(() => {});
  if (local) await new Promise(resolve => local.server.close(resolve));
}
