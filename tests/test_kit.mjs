import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { inferFamily, inferKind, planPage } from '../docs/kit/select.js';
import { FAMILIES } from '../docs/kit/compose.js';
import { CATALOG } from '../docs/kit/catalog.js';
import { RECIPES } from '../docs/kit/recipes.js';

const repo = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const kit = join(repo, 'docs/kit');
const img = { src: 'x.webp', alt: '' };
const imaged = n => Array.from({ length: n }, (_, i) => ({ title: `t${i}`, image: img }));

// One fixture per branch of inferFamily, in the order the branches are tested.
// The order matters: each fixture must reach its own branch and no earlier one.
const BRANCHES = [
  ['an explicit type wins', { type: 'quote-pull', projects: [{}] }, 'quote-pull'],
  ['projects', { projects: [{}] }, 'project-index'],
  ['before and after images', { before: { image: img }, after: { image: img } }, 'image-comparison'],
  ['chapters with images', { chapters: [{ image: img }] }, 'visual-chapters'],
  ['an expandable image', { expand: true, image: img }, 'expanding-image'],
  ['question and answer items', { items: [{ q: 'Why?', a: 'Because.' }] }, 'faq-rule'],
  ['a quote', { quote: 'Words.' }, 'quote-pull'],
  ['an attribution alone', { by: 'Someone' }, 'quote-pull'],
  ['an email address', { email: 'a@b.c' }, 'contact-split'],
  ['a postal address', { address: '1 Road' }, 'contact-split'],
  ['claims', { claims: ['One'] }, 'claim-stack'],
  ['rows', { rows: [{}] }, 'hours-list'],
  ['marks', { marks: ['Acme'] }, 'client-marks'],
  ['labelled figures with an aside', { aside: 'a', items: [{ label: 'Frames', value: '120' }] }, 'stat-stack'],
  ['labelled items with values', { items: [{ label: 'Mon', value: '9–5' }] }, 'hours-list'],
  ['labelled items without values', { items: [{ label: 'Acme' }] }, 'client-marks'],
  ['chapters without images', { chapters: [{ title: 'One' }] }, 'chapter-index'],
  ['thumbs and an image', { thumbs: [{}], image: img }, 'spotlight-stage'],
  ['a front and a back', { front: {}, back: {} }, 'peek-overlap'],
  ['a note and a body', { note: 'n', body: 'b' }, 'note-margin'],
  ['a captioned image', { caption: 'c', image: img }, 'caption-still'],
  ['a value and a label', { value: '120', label: 'frames' }, 'measure-band'],
  ['a mark and meta', { mark: 'm', meta: 'x' }, 'sign-off'],
  ['left and right text', { left: 'l', right: 'r' }, 'flank-statement'],
  ['a line over an image', { line: 'l', image: img }, 'bleed-line'],
  ['a line with a call to action', { line: 'l', cta: {} }, 'statement-cta'],
  ['a band', { band: 'x' }, 'invert-band'],
  ['a featured item', { item: { image: img } }, 'featured-work'],
  ['three steps', { steps: [{}, {}, {}] }, 'ascent-steps'],
  ['two columns and an image', { columns: [{}, {}], image: img }, 'editorial-split'],
  ['two columns', { columns: [{}, {}] }, 'process-columns'],
  ['titled text items', { items: [{ title: 't', body: 'b' }] }, 'rule-list'],
  ['four stills in a strip', { items: imaged(4), strip: true }, 'film-strip'],
  ['four stills', { items: imaged(4) }, 'work-rail'],
  ['three stills with a tall one', { items: [...imaged(2), { image: img, span: 'tall' }] }, 'material-board'],
  ['three stills', { items: imaged(3) }, 'colonnade'],
  ['two overlapping stills', { items: imaged(2), overlap: true }, 'peek-overlap'],
  ['two stills', { items: imaged(2) }, 'pair-stills'],
  ['a headline, body and void label', { headline: 'h', body: 'b', voidLabel: 'v' }, 'hero-cinematic'],
  ['nothing recognisable', { headline: 'h' }, null],
];

for (const [name, section, family] of BRANCHES) {
  test(`inferFamily: ${name} gives ${family}`, () => {
    assert.equal(inferFamily(section), family);
  });
}

test('every inferred family has a renderer', () => {
  for (const [, , family] of BRANCHES) if (family) assert.ok(FAMILIES.includes(family), family);
});

test('inferKind follows the content shape', () => {
  assert.equal(inferKind({ kind: 'custom' }), 'custom');
  assert.equal(inferKind({ metrics: [{}] }), 'saas');
  assert.equal(inferKind({ featured: { image: img } }), 'studio');
  assert.equal(inferKind({ stills: imaged(2) }), 'studio');
  assert.equal(inferKind({}), 'product');
});

test('the catalog shows every family exactly once', () => {
  const types = CATALOG.sections.map(section => section.type);
  assert.deepEqual([...types].sort(), [...FAMILIES].sort());
});

test('catalog samples infer their own family, apart from explicit-only layouts', () => {
  // These families render content another family also accepts, so an author
  // must name them. Everything else must be recognisable from its content.
  const explicitOnly = new Set(['hero-editorial', 'expanding-image']);
  const mismatches = CATALOG.sections
    .filter(section => !explicitOnly.has(section.type))
    .map(({ type, ...content }) => ({ type, inferred: inferFamily(content) }))
    .filter(({ type, inferred }) => type !== inferred);
  assert.deepEqual(mismatches, []);
});

for (const [id, recipe] of Object.entries(RECIPES)) {
  test(`recipe ${id} plans known, unrepeated families in its stated order`, () => {
    const plan = planPage(recipe.page);
    assert.ok(plan.length > 0);
    for (const section of plan) assert.ok(FAMILIES.includes(section.type), `${section.id}: ${section.type}`);
    const types = plan.map(section => section.type);
    assert.equal(new Set(types).size, types.length, 'a family repeats');
    const order = recipe.page.order ?? [];
    const ranked = plan.map(section => section.id).filter(sectionId => order.includes(sectionId));
    assert.deepEqual(ranked, order.filter(sectionId => ranked.includes(sectionId)));
  });
}

test('every image the kit references exists', () => {
  const sources = new Set();
  const collect = value => {
    if (Array.isArray(value)) value.forEach(collect);
    else if (value && typeof value === 'object') {
      if (typeof value.src === 'string') sources.add(value.src);
      Object.values(value).forEach(collect);
    }
  };
  collect(CATALOG);
  collect(RECIPES);
  for (const src of sources) assert.ok(existsSync(join(kit, src)), `missing ${src}`);
});

test('the published family count matches the renderers', () => {
  const count = String(FAMILIES.length);
  for (const [file, pattern] of [
    ['docs/index.html', /(\d+) section families/],
    ['docs/ONBOARDING.md', /(\d+) section families/],
    ['docs/kit/index.html', /\/ (\d+) families/],
  ]) {
    const match = readFileSync(join(repo, file), 'utf8').match(pattern);
    assert.ok(match, `${file} no longer states a family count; update this test`);
    assert.equal(match[1], count, `${file} says ${match[1]} families; the kit renders ${count}`);
  }
  assert.match(readFileSync(join(kit, 'catalog.js'), 'utf8'), new RegExp(`value: '${count}', label: 'layout families'`));
});

test('every kit asset URL carries the same cache-busting version', () => {
  // Bug 5 in CLAUDE.md: a stale sections.css next to fresh JS painted raw
  // HTML. One version for every kit file means one bump refreshes all of it.
  const files = [
    ...readdirSync(kit).filter(name => /\.(js|css|html)$/.test(name)).map(name => join(kit, name)),
    join(repo, 'docs/examples/commerce/index.html'),
    join(repo, 'docs/examples/commerce/src/bind.js'),
  ];
  const kitFile = /(?:compose|select|story-sections|catalog|recipes|catalog-ui|recipes-ui|preview)\.js|(?:sections|story-sections|catalog|preview)\.css/;
  const versions = new Map();
  for (const file of files) {
    const text = readFileSync(file, 'utf8');
    for (const [, url] of text.matchAll(/(?:from |src=|href=|url\()['"]([^'"]+)['"]/g)) {
      if (!kitFile.test(url.split('?')[0].split('/').pop()) || url.startsWith('http')) continue;
      versions.set(`${file.replace(repo + '/', '')} -> ${url}`, url.match(/\?v=([\w-]+)$/)?.[1] ?? 'none');
    }
  }
  const distinct = new Set(versions.values());
  assert.equal(distinct.size, 1, JSON.stringify(Object.fromEntries(versions), null, 2));
  assert.ok(!distinct.has('none'));
});
