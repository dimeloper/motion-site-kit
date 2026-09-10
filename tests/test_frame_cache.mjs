import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createFrameCache } from '../template/src/frame-cache.js';

async function idle(cache) {
  const end = Date.now() + 2000;
  while (cache.stats.pending) {
    if (Date.now() > end) throw new Error('cache did not settle');
    await new Promise(resolve => setImmediate(resolve));
  }
}

test('large jumps and reverse decode the requested frame within the live bitmap bound', async () => {
  let live = 0, peak = 0;
  const cache = await createFrameCache(Array.from({ length: 120 }, (_, i) => i), {
    maxBytes: 12,
    decode: async id => {
      live++; peak = Math.max(peak, live);
      let closed = false;
      return { id, width: 1, height: 1, close() { assert.equal(closed, false); closed = true; live--; } };
    },
  });
  for (const index of [0, 119, 1, 65, 0]) {
    cache.request(index);
    await idle(cache);
    assert.equal(cache.get(index).id, index);
    assert.ok(cache.stats.decodedBytes <= 12);
  }
  assert.ok(peak <= 3);
  cache.dispose(); cache.dispose();
  assert.equal(live, 0);
});

test('disposing during native decode closes the late bitmap', async () => {
  let resolveDecode;
  let closed = 0;
  const bitmap = () => ({ width: 1, height: 1, close() { closed++; } });
  const cache = await createFrameCache([0, 1], {
    maxBytes: 8, decode: async id => id === 0 ? bitmap() : new Promise(resolve => { resolveDecode = resolve; }),
  });
  cache.request(1);
  cache.dispose();
  resolveDecode(bitmap());
  await idle(cache);
  assert.equal(closed, 2);
});

test('decode failure releases the cache and reports failure', async () => {
  let closed = 0, reported;
  const cache = await createFrameCache([0, 1], {
    maxBytes: 8,
    decode: async id => { if (id) throw new Error('broken image'); return { width: 1, height: 1, close() { closed++; } }; },
    onError: error => { reported = error; },
  });
  cache.request(1);
  await idle(cache);
  assert.equal(reported.message, 'broken image');
  assert.equal(closed, 1);
});

test('new scroll target takes precedence over queued neighbours', async () => {
  const requested = [];
  let resume;
  const bitmap = id => ({ id, width: 1, height: 1, close() {} });
  const cache = await createFrameCache(Array.from({ length: 100 }, (_, i) => i), {
    maxBytes: 12,
    decode: async id => {
      requested.push(id);
      if (id === 1) await new Promise(resolve => { resume = resolve; });
      return bitmap(id);
    },
  });
  cache.request(1);
  cache.request(90);
  resume();
  await idle(cache);
  assert.equal(requested[2], 90);
  assert.equal(cache.get(90).id, 90);
  cache.dispose();
});

test('invalid cache arguments fail before native decode', async () => {
  const decode = () => { throw new Error('decode must not run'); };
  await assert.rejects(createFrameCache([], { decode }), /at least one/);
  await assert.rejects(createFrameCache([0], { maxBytes: NaN, decode }), /budget/);
});

test('non-finite requested frame cannot enter the prefetch loop', async () => {
  const cache = await createFrameCache([0, 1], {
    maxBytes: 8, decode: async () => ({ width: 1, height: 1, close() {} }),
  });
  assert.throws(() => cache.request(NaN), /finite/);
  cache.dispose();
});
