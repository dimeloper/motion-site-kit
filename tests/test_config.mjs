import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG } from '../template/config.js';
import { validateMotionConfig } from '../template/src/validate-config.js';

test('default motion configuration is valid', () => {
  assert.doesNotThrow(() => validateMotionConfig(CONFIG.motion));
});

for (const [key, value] of [
  ['concurrency', 0], ['concurrency', 2.5], ['concurrency', 100],
  ['maxDecodedBytes', NaN], ['loadTimeoutMs', -1], ['framesBase', ''],
  ['maxDpr', Infinity], ['lenisDuration', '1.1'], ['scrollLengthVh', 0], ['scrub', -1],
]) {
  test(`reject invalid ${key}: ${value}`, () => {
    assert.throws(() => validateMotionConfig({ ...CONFIG.motion, [key]: value }), new RegExp(key));
  });
}
