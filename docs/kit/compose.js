/**
 * Page kit. Mount distinct layout families from config.
 * Review the full reading order and repeated layouts against the content.
 * Prefer planPage() when the brief is content, not types.
 */

import { renderChapters, renderExpand, renderProjectIndex, renderComparison, disposeStory } from './story-sections.js';

import { inferFamily, inferKind, planPage } from './select.js';

export { inferFamily, inferKind, planPage };

export const FAMILIES = [
  'hero-cinematic',
  'hero-editorial',
  'stat-stack',
  'editorial-split',
  'featured-work',
  'flank-statement',
  'material-board',
  'process-columns',
  'work-rail',
  'colonnade',
  'ascent-steps',
  'bleed-line',
  'faq-rule',
  'statement-cta',
  'quote-pull',
  'contact-split',
  'pair-stills',
  'note-margin',
  'hours-list',
  'film-strip',
  'invert-band',
  'rule-list',
  'measure-band',
  'chapter-index',
  'caption-still',
  'peek-overlap',
  'sign-off',
  'client-marks',
  'spotlight-stage',
  'claim-stack',
  'visual-chapters',
  'expanding-image',
  'project-index',
  'image-comparison',
];

const BANNED_VORTEX_SEQUENCE = ['modules', 'feel', 'builds', 'about', 'cta'];

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value == null || value === false) continue;
    if (key === 'class') node.className = value;
    else if (key === 'text') node.textContent = value;
    else node.setAttribute(key, String(value));
  }
  for (const child of children.flat()) {
    if (child == null) continue;
    node.append(typeof child === 'string' ? document.createTextNode(child) : child);
  }
  return node;
}

function renderHeroCinematic(section) {
  return el('section', { class: 'sec-hero-cin', id: section.id || 'top', 'data-family': 'hero-cinematic' }, [
    el('div', { class: 'hero-cin__void', 'aria-hidden': 'true' }, [
      el('p', { class: 'hero-cin__void-label', text: section.voidLabel || '3D lane' }),
    ]),
    el('div', { class: 'hero-cin__copy' }, [
      section.headline && el('h1', { class: 'hero-cin__headline', text: section.headline }),
      section.body && el('p', { class: 'hero-cin__body', text: section.body }),
      section.cta && el('a', { class: 'kit-pill', href: section.cta.href || '#content' }, [
        el('span', { text: section.cta.label }),
      ]),
    ]),
    section.foot && el('p', { class: 'hero-cin__foot', text: section.foot }),
  ]);
}

function renderHeroEditorial(section) {
  const inner = el('section', { class: 'sec-hero-ed', id: section.id || 'editorial-hero', 'data-family': 'hero-editorial' }, [
    el('h1', { class: 'hero-ed__headline', text: section.headline }),
    section.image && el('figure', { class: 'hero-ed__figure' }, [
      el('img', {
        src: section.image.src,
        alt: section.image.alt || '',
        width: section.image.width || 900,
        height: section.image.height || 1400,
      }),
    ]),
    el('div', { class: 'hero-ed__cols' }, (section.columns || []).map((col, i) =>
      el('article', { class: 'hero-ed__col' }, [
        el('p', { class: 'hero-ed__num', text: col.num || String(i + 1).padStart(2, '0') }),
        el('p', { class: 'hero-ed__text', text: col.body }),
      ])
    )),
  ]);

  if (!section.framed) return inner;

  return el('figure', { class: 'kit-frame' }, [
    el('figcaption', { class: 'kit-frame__cap', text: section.frameCaption || 'Light family. Own page only, not a mid-scroll invert.' }),
    inner,
  ]);
}

function renderStatStack(section) {
  return el('section', { class: 'sec-stat-stack', id: section.id || 'metrics', 'data-family': 'stat-stack' }, [
    section.aside && el('p', { class: 'stat-stack__aside', text: section.aside }),
    el('div', { class: 'stat-stack__panel' }, (section.items || []).map((item) =>
      el('article', { class: `stat-stack__item stat-stack__item--${item.variant || 'plain'}` }, [
        el('p', { class: 'stat-stack__value', text: item.value }),
        el('p', { class: 'stat-stack__label', text: item.label }),
        item.note && el('p', { class: 'stat-stack__note', text: item.note }),
        item.href && el('a', { class: 'stat-stack__go', href: item.href, 'aria-label': item.goLabel || item.label }, [
          el('span', { 'aria-hidden': 'true', text: '→' }),
        ]),
      ])
    )),
  ]);
}

function renderEditorialSplit(section) {
  return el('section', { class: 'sec-editorial', id: section.id || 'editorial', 'data-family': 'editorial-split' }, [
    el('div', { class: 'ed__text' }, [
      el('h2', { class: 'ed__headline', text: section.headline }),
      el('div', { class: 'ed__cols' }, (section.columns || []).map((col, i) =>
        el('article', { class: 'ed__col' }, [
          el('p', { class: 'ed__num', text: col.num || `[ ${String(i + 1).padStart(2, '0')} ]` }),
          el('p', { class: 'ed__body', text: col.body }),
        ])
      )),
    ]),
    section.image && el('figure', { class: 'ed__figure' }, [
      el('img', {
        src: section.image.src,
        alt: section.image.alt || '',
        width: section.image.width || 720,
        height: section.image.height || 1100,
      }),
    ]),
  ]);
}

function renderFeaturedWork(section) {
  const item = section.item || {};
  return el('section', { class: 'sec-featured', id: section.id || 'featured', 'data-family': 'featured-work' }, [
    section.headline && el('h2', { class: 'featured__headline', text: section.headline }),
    el('article', { class: 'featured-card' }, [
      item.image && el('figure', { class: 'featured-card__media' }, [
        el('img', {
          src: item.image.src,
          alt: item.image.alt || '',
          width: item.image.width || 640,
          height: item.image.height || 400,
        }),
      ]),
      el('div', { class: 'featured-card__meta' }, [
        item.kicker && el('p', { class: 'featured-card__kicker', text: item.kicker }),
        item.title && el('h3', { class: 'featured-card__title', text: item.title }),
        item.body && el('p', { class: 'featured-card__body', text: item.body }),
      ]),
    ]),
  ]);
}

function renderFlankStatement(section) {
  return el('section', { class: 'sec-flank', id: section.id || 'flank', 'data-family': 'flank-statement' }, [
    el('p', { class: 'flank__word flank__word--left', text: section.left }),
    el('div', { class: 'flank__void', 'aria-hidden': 'true' }, [
      section.voidLabel && el('p', { class: 'flank__void-label', text: section.voidLabel }),
    ]),
    el('p', { class: 'flank__word flank__word--right', text: section.right }),
  ]);
}

function renderMaterialBoard(section) {
  return el('section', { class: 'sec-board', id: section.id || 'board', 'data-family': 'material-board' }, [
    section.headline && el('h2', { class: 'board__headline', text: section.headline }),
    el('div', { class: 'board__grid' }, (section.items || []).map((item) =>
      el('article', { class: 'board__cell', 'data-span': item.span || 'unit' }, [
        item.image && el('figure', { class: 'board__media' }, [
          el('img', {
            src: item.image.src,
            alt: item.image.alt || '',
            width: item.image.width || 800,
            height: item.image.height || 1000,
            loading: 'lazy',
          }),
        ]),
        el('div', { class: 'board__meta' }, [
          item.title && el('h3', { text: item.title }),
          item.body && el('p', { text: item.body }),
        ]),
      ])
    )),
  ]);
}

function renderProcessColumns(section) {
  return el('section', { class: 'sec-process', id: section.id || 'process', 'data-family': 'process-columns' }, [
    section.headline && el('h2', { class: 'process__headline', text: section.headline }),
    el('div', { class: 'process__grid' }, (section.columns || []).map((col, i) =>
      el('article', { class: 'process__col' }, [
        el('p', { class: 'process__num', text: col.num || String(i + 1).padStart(2, '0') }),
        col.title && el('h3', { class: 'process__title', text: col.title }),
        el('p', { class: 'process__body', text: col.body }),
      ])
    )),
  ]);
}

function renderFaqRule(section) {
  const root = el('section', { class: 'sec-faq', id: section.id || 'faq', 'data-family': 'faq-rule' }, [
    section.headline && el('h2', { class: 'faq__headline', text: section.headline }),
    el('div', { class: 'faq__rule', 'aria-hidden': 'true' }),
    el('div', { class: 'faq__list', role: 'list' }, (section.items || []).map((item, i) => {
      const panelId = `${section.id || 'faq'}-a-${i}`;
      return el('div', { class: 'faq__item', role: 'listitem', 'data-faq-item': '', 'data-open': i === 0 ? 'true' : 'false' }, [
        el('button', {
          class: 'faq__q',
          type: 'button',
          'data-faq': '',
          'aria-expanded': i === 0 ? 'true' : 'false',
          'aria-controls': panelId,
          text: item.q,
        }),
        el('div', { class: 'faq__a', id: panelId }, [
          el('p', { text: item.a }),
        ]),
      ]);
    })),
  ]);

  root.querySelectorAll('[data-faq]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const item = btn.closest('[data-faq-item]');
      const open = item.getAttribute('data-open') === 'true';
      root.querySelectorAll('[data-faq-item]').forEach((node) => {
        node.setAttribute('data-open', 'false');
        node.querySelector('[data-faq]')?.setAttribute('aria-expanded', 'false');
      });
      if (!open) {
        item.setAttribute('data-open', 'true');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  return root;
}

function figure(image, className) {
  if (!image) return null;
  return el('figure', { class: className }, [
    el('img', {
      src: image.src,
      alt: image.alt || '',
      width: image.width || 1200,
      height: image.height || 1600,
      loading: 'lazy',
    }),
  ]);
}

function renderWorkRail(section) {
  return el('section', { class: 'sec-rail', id: section.id || 'rail', 'data-family': 'work-rail' }, [
    section.headline && el('h2', { class: 'rail__headline', text: section.headline }),
    el('div', { class: 'rail', tabindex: '0' }, (section.items || []).map((item) =>
      el('article', { class: 'rail__cell' }, [
        figure(item.image, 'rail__media'),
        el('div', { class: 'rail__meta' }, [
          item.title && el('h3', { text: item.title }),
          item.body && el('p', { text: item.body }),
        ]),
      ])
    )),
  ]);
}

function renderColonnade(section) {
  return el('section', { class: 'sec-colonnade', id: section.id || 'colonnade', 'data-family': 'colonnade' }, [
    section.headline && el('h2', { class: 'colonnade__headline', text: section.headline }),
    el('div', { class: 'colonnade__grid' }, (section.items || []).map((item) =>
      el('article', { class: 'colonnade__cell' }, [
        figure(item.image, 'colonnade__media'),
        item.title && el('h3', { text: item.title }),
        item.body && el('p', { text: item.body }),
      ])
    )),
  ]);
}

function renderAscentSteps(section) {
  return el('section', { class: 'sec-ascent', id: section.id || 'ascent', 'data-family': 'ascent-steps' }, [
    section.headline && el('h2', { class: 'ascent__headline', text: section.headline }),
    el('div', { class: 'ascent__list', role: 'list' }, (section.steps || []).map((step, i) =>
      el('div', { class: 'ascent__step', role: 'listitem' }, [
        el('p', { class: 'ascent__num', text: step.num || String(i + 1).padStart(2, '0') }),
        el('div', { class: 'ascent__copy' }, [
          step.title && el('h3', { text: step.title }),
          step.body && el('p', { text: step.body }),
        ]),
      ])
    )),
  ]);
}

function renderBleedLine(section) {
  return el('section', { class: 'sec-bleed', id: section.id || 'bleed', 'data-family': 'bleed-line' }, [
    section.image && el('img', {
      src: section.image.src,
      alt: section.image.alt || '',
      width: section.image.width || 1600,
      height: section.image.height || 1000,
    }),
    el('p', { class: 'bleed__line', text: section.line }),
  ]);
}

function renderStatementCta(section) {
  return el('section', { class: 'sec-statement', id: section.id || 'cta', 'data-family': 'statement-cta' }, [
    el('p', { class: 'statement__line', text: section.line }),
    section.cta && el('a', { class: 'kit-pill kit-pill--solid', href: section.cta.href || '#' }, [
      el('span', { text: section.cta.label }),
    ]),
  ]);
}

function renderQuotePull(section) {
  return el('section', { class: 'sec-quote', id: section.id || 'quote', 'data-family': 'quote-pull' }, [
    el('blockquote', { class: 'quote__text', text: section.quote }),
    section.by && el('p', { class: 'quote__by', text: section.by }),
  ]);
}

function renderContactSplit(section) {
  return el('section', { class: 'sec-contact', id: section.id || 'contact', 'data-family': 'contact-split' }, [
    el('div', { class: 'contact__lane' }, [
      section.kicker && el('p', { class: 'contact__kicker', text: section.kicker }),
      section.address && el('p', { class: 'contact__address', text: section.address }),
    ]),
    el('div', { class: 'contact__lane contact__lane--end' }, [
      section.note && el('p', { class: 'contact__note', text: section.note }),
      section.email && el('a', { class: 'contact__mail', href: `mailto:${section.email}`, text: section.email }),
    ]),
  ]);
}

function renderPairStills(section) {
  return el('section', { class: 'sec-pair', id: section.id || 'pair', 'data-family': 'pair-stills' }, [
    section.headline && el('h2', { class: 'pair__headline', text: section.headline }),
    el('div', { class: 'pair__grid' }, (section.items || []).slice(0, 2).map((item, i) =>
      el('article', { class: `pair__cell pair__cell--${i === 0 ? 'lead' : 'side'}` }, [
        figure(item.image, 'pair__media'),
        item.title && el('h3', { text: item.title }),
        item.body && el('p', { text: item.body }),
      ])
    )),
  ]);
}

function renderNoteMargin(section) {
  return el('section', { class: 'sec-note', id: section.id || 'note', 'data-family': 'note-margin' }, [
    el('div', { class: 'note__body' }, [
      section.headline && el('h2', { text: section.headline }),
      el('p', { text: section.body }),
    ]),
    el('aside', { class: 'note__margin' }, [
      el('p', { text: section.note }),
    ]),
  ]);
}

function renderHoursList(section) {
  const rows = section.rows || section.items || [];
  return el('section', { class: 'sec-hours', id: section.id || 'hours', 'data-family': 'hours-list' }, [
    section.headline && el('h2', { class: 'hours__headline', text: section.headline }),
    el('dl', { class: 'hours__list' }, rows.flatMap((row) => [
      el('div', { class: 'hours__row' }, [
        el('dt', { text: row.label }),
        el('dd', { text: row.value }),
      ]),
    ])),
  ]);
}

function renderFilmStrip(section) {
  return el('section', { class: 'sec-strip', id: section.id || 'rail', 'data-family': 'film-strip' }, [
    section.headline && el('h2', { class: 'strip__headline', text: section.headline }),
    el('div', { class: 'strip', tabindex: '0' }, (section.items || []).map((item, i) =>
      el('article', { class: 'strip__cell' }, [
        figure(item.image, 'strip__media'),
        el('p', { class: 'strip__num', text: String(i + 1).padStart(2, '0') }),
      ])
    )),
  ]);
}

function renderInvertBand(section) {
  return el('section', { class: 'sec-invert', id: section.id || 'band', 'data-family': 'invert-band' }, [
    el('p', { class: 'invert__band', text: section.band || section.line }),
  ]);
}

function renderRuleList(section) {
  return el('section', { class: 'sec-rules', id: section.id || 'rules', 'data-family': 'rule-list' }, [
    section.headline && el('h2', { class: 'rules__headline', text: section.headline }),
    el('div', { class: 'rules__list', role: 'list' }, (section.items || []).map((item) =>
      el('div', { class: 'rules__item', role: 'listitem' }, [
        item.title && el('h3', { text: item.title }),
        item.body && el('p', { text: item.body }),
      ])
    )),
  ]);
}

function renderMeasureBand(section) {
  return el('section', { class: 'sec-measure', id: section.id || 'measure', 'data-family': 'measure-band' }, [
    el('p', { class: 'measure__value', text: section.value }),
    el('p', { class: 'measure__label', text: section.label }),
  ]);
}

function renderChapterIndex(section) {
  return el('section', { class: 'sec-chapters', id: section.id || 'index', 'data-family': 'chapter-index' }, [
    section.headline && el('h2', { class: 'chapters__headline', text: section.headline }),
    el('div', { class: 'chapters__list', role: 'list' }, (section.chapters || []).map((chapter) =>
      el('div', { class: 'chapters__item', role: 'listitem' }, [
        el('a', { href: chapter.href || '#', class: 'chapters__link' }, [
          el('span', { class: 'chapters__num', text: chapter.num }),
          el('span', { class: 'chapters__title', text: chapter.title }),
        ]),
      ])
    )),
  ]);
}

function renderCaptionStill(section) {
  return el('section', { class: 'sec-caption', id: section.id || 'caption', 'data-family': 'caption-still' }, [
    figure(section.image, 'caption__media'),
    el('p', { class: 'caption__line', text: section.caption }),
  ]);
}

function renderPeekOverlap(section) {
  const front = section.front || section.items?.[0]?.image;
  const back = section.back || section.items?.[1]?.image;
  return el('section', { class: 'sec-peek', id: section.id || 'peek', 'data-family': 'peek-overlap' }, [
    section.headline && el('h2', { class: 'peek__headline', text: section.headline }),
    el('div', { class: 'peek__stage' }, [
      figure(back, 'peek__back'),
      figure(front, 'peek__front'),
    ]),
  ]);
}

function renderSignOff(section) {
  return el('section', { class: 'sec-signoff', id: section.id || 'signoff', 'data-family': 'sign-off' }, [
    el('p', { class: 'signoff__mark', text: section.mark }),
    el('p', { class: 'signoff__meta', text: section.meta }),
  ]);
}

function renderClientMarks(section) {
  const marks = section.marks || (section.items || []).map((item) => item.label).filter(Boolean);
  return el('section', { class: 'sec-marks', id: section.id || 'marks', 'data-family': 'client-marks' }, [
    section.headline && el('p', { class: 'marks__headline', text: section.headline }),
    el('div', { class: 'marks__list', role: 'list' }, marks.map((mark) =>
      el('div', { class: 'marks__item', role: 'listitem', text: typeof mark === 'string' ? mark : mark.label })
    )),
  ]);
}

function renderSpotlightStage(section) {
  const thumbs = section.thumbs || [];
  const root = el('section', { class: 'sec-spot', id: section.id || 'spot', 'data-family': 'spotlight-stage' }, [
    section.headline && el('h2', { class: 'spot__headline', text: section.headline }),
    figure(section.image, 'spot__stage'),
    thumbs.length && el('div', { class: 'spot__thumbs' }, thumbs.map((thumb, i) =>
      el('button', {
        class: 'spot__thumb',
        type: 'button',
        'data-spot': '',
        'data-src': thumb.image?.src || '',
        'data-alt': thumb.image?.alt || '',
        'aria-pressed': i === 0 ? 'true' : 'false',
        'aria-label': thumb.title || `Still ${i + 1}`,
      }, [
        figure(thumb.image, 'spot__thumb-media'),
      ])
    )),
  ]);

  const stage = root.querySelector('.spot__stage img');
  root.querySelectorAll('[data-spot]').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (!stage || !btn.dataset.src) return;
      stage.src = btn.dataset.src;
      if (btn.dataset.alt) stage.alt = btn.dataset.alt;
      root.querySelectorAll('[data-spot]').forEach((node) => node.setAttribute('aria-pressed', 'false'));
      btn.setAttribute('aria-pressed', 'true');
    });
  });

  return root;
}

function renderClaimStack(section) {
  return el('section', { class: 'sec-claims', id: section.id || 'claims', 'data-family': 'claim-stack' }, [
    section.headline && el('h2', { class: 'claims__headline', text: section.headline }),
    el('div', { class: 'claims__list', role: 'list' }, (section.claims || []).map((claim) =>
      el('div', { class: 'claims__item', role: 'listitem', text: typeof claim === 'string' ? claim : claim.text })
    )),
  ]);
}

const RENDERERS = {
  'hero-cinematic': renderHeroCinematic,
  'hero-editorial': renderHeroEditorial,
  'stat-stack': renderStatStack,
  'editorial-split': renderEditorialSplit,
  'featured-work': renderFeaturedWork,
  'flank-statement': renderFlankStatement,
  'material-board': renderMaterialBoard,
  'process-columns': renderProcessColumns,
  'work-rail': renderWorkRail,
  'colonnade': renderColonnade,
  'ascent-steps': renderAscentSteps,
  'bleed-line': renderBleedLine,
  'faq-rule': renderFaqRule,
  'statement-cta': renderStatementCta,
  'quote-pull': renderQuotePull,
  'contact-split': renderContactSplit,
  'pair-stills': renderPairStills,
  'note-margin': renderNoteMargin,
  'hours-list': renderHoursList,
  'film-strip': renderFilmStrip,
  'invert-band': renderInvertBand,
  'rule-list': renderRuleList,
  'measure-band': renderMeasureBand,
  'chapter-index': renderChapterIndex,
  'caption-still': renderCaptionStill,
  'peek-overlap': renderPeekOverlap,
  'sign-off': renderSignOff,
  'client-marks': renderClientMarks,
  'spotlight-stage': renderSpotlightStage,
  'claim-stack': renderClaimStack,
  'visual-chapters': renderChapters,
  'expanding-image': renderExpand,
  'project-index': renderProjectIndex,
  'image-comparison': renderComparison,
};

function looksLikeVortexClone(sections) {
  const ids = sections.map((s) => s.id).filter(Boolean);
  return BANNED_VORTEX_SEQUENCE.every((id) => ids.includes(id));
}

export function compose(root, sections, { warn = true } = {}) {
  if (!root) throw new Error('page-kit: missing mount root');
  disposeStory(root);
  root.replaceChildren();

  const used = new Set();
  if (warn && looksLikeVortexClone(sections)) {
    console.warn('page-kit: this sequence matches Vortex (modules / feel / builds / about / cta). Pick different families.');
  }

  for (const section of sections) {
    const type = section?.type || inferFamily(section);
    const render = RENDERERS[type];
    if (!render) {
      console.warn(`page-kit: unknown family "${type}"`);
      continue;
    }
    if (used.has(type) && warn) {
      console.warn(`page-kit: family "${type}" already used on this page. Check that repetition serves the content.`);
    }
    used.add(type);
    root.append(render(section));
  }

  return used;
}
