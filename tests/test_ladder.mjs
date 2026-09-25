import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MAX_FRAMES, pickWidth, validateManifest } from '../template/src/ladder.js';
import config from '../motion.config.json' with { type: 'json' };

const widths = [640, 960, 1600];
const valid = { count: 120, widths, formats: ['avif', 'webp'], padding: 4 };

// Viewport widths in CSS pixels and device pixel ratios as the browser reports them.
for (const [device, viewport, dpr, expected] of [
  ['iPhone SE', 375, 2, 960],
  ['iPhone 15', 393, 3, 960],
  ['Pixel 8', 412, 2.625, 960],
  ['1.5x Android', 360, 1.5, 640],
  ['1x small window', 600, 1, 640],
  ['iPad portrait', 820, 2, 1600],
  ['1440 laptop', 1440, 2, 1600],
  ['1080p monitor', 1920, 1, 1600],
]) {
  test(`${device} selects the ${expected} rung`, () => {
    assert.equal(pickWidth(widths, viewport, dpr, 2), expected);
  });
}

test('every rung a phone can select is under the phone ceiling', () => {
  // The budget protects what phones download, so the widths phones select must
  // all sit at or below phoneRungWidth. A 430px phone at 2x is the widest case.
  const phoneWidth = pickWidth(config.frames.widths, 430, 3, 2);
  assert.ok(phoneWidth <= config.budget.phoneRungWidth,
    `phones select ${phoneWidth}px but the phone ceiling stops at ${config.budget.phoneRungWidth}px`);
});

test('maxDpr caps the requested width', () => {
  assert.equal(pickWidth(widths, 400, 3, 1), 640);
});

test('missing or silly devicePixelRatio falls back to 1x', () => {
  assert.equal(pickWidth(widths, 600, undefined, 2), 640);
  assert.equal(pickWidth(widths, 600, NaN, 2), 640);
  assert.equal(pickWidth(widths, 600, 0.5, 2), 640);
});

test('a viewport wider than every rung gets the widest rung', () => {
  assert.equal(pickWidth(widths, 3840, 2, 2), 1600);
});

test('a well-formed manifest validates', () => {
  assert.equal(validateManifest(valid), valid);
});

test('the runtime accepts counts above the default budget', () => {
  // The budget is enforced at build time; the runtime bound is only a sanity check.
  assert.doesNotThrow(() => validateManifest({ ...valid, count: 200 }));
  assert.throws(() => validateManifest({ ...valid, count: MAX_FRAMES + 1 }));
});

for (const [name, patch] of [
  ['zero frames', { count: 0 }],
  ['fractional count', { count: 1.5 }],
  ['empty widths', { widths: [] }],
  ['unsorted widths', { widths: [960, 640] }],
  ['duplicate widths', { widths: [640, 640] }],
  ['unknown format', { formats: ['jpeg'] }],
  ['missing padding', { padding: undefined }],
  ['oversized padding', { padding: 13 }],
]) {
  test(`manifest with ${name} is rejected`, () => {
    assert.throws(() => validateManifest({ ...valid, ...patch }), /Invalid frame manifest/);
  });
}

test('null manifest is rejected', () => {
  assert.throws(() => validateManifest(null), /Invalid frame manifest/);
});
