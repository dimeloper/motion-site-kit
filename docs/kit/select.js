/**
 * Pick a layout family from content shape.
 * A demo describes stills, steps, questions. This file chooses the family.
 */

function count(list) {
  return Array.isArray(list) ? list.length : 0;
}

function hasImage(node) {
  return Boolean(node?.image?.src || node?.item?.image?.src);
}

export function inferKind(content = {}) {
  if (content.kind) return content.kind;
  if (count(content.metrics) && !hasImage(content.featured) && count(content.stills) < 2) return 'saas';
  if (hasImage(content.featured) || count(content.stills) >= 2) return 'studio';
  return 'product';
}

export function inferFamily(section = {}) {
  if (section.type) return section.type;
  if (section.projects?.length) return 'project-index';
  if (section.before?.image && section.after?.image) return 'image-comparison';
  if (section.chapters?.some(chapter => chapter.image)) return 'visual-chapters';
  if (section.expand && section.image) return 'expanding-image';

  const items = section.items || [];
  const imaged = items.filter((item) => item?.image);
  const steps = section.steps || [];
  const columns = section.columns || [];

  if (items.length && items.every((item) => item.q && item.a)) return 'faq-rule';
  if (section.quote || section.by) return 'quote-pull';
  if (section.email || section.address) return 'contact-split';
  if (section.claims?.length) return 'claim-stack';
  if (section.rows?.length) return 'hours-list';
  if (section.marks?.length) return 'client-marks';
  if (items.length && items.every((item) => item.label && !item.image && !item.q && !item.body)) {
    return items[0]?.value ? 'hours-list' : 'client-marks';
  }
  if (section.chapters?.length) return 'chapter-index';
  if (section.thumbs?.length && section.image) return 'spotlight-stage';
  if (section.front && section.back) return 'peek-overlap';
  if (section.note && section.body) return 'note-margin';
  if (section.caption && section.image && !section.line) return 'caption-still';
  if (section.value && section.label && !items.length) return 'measure-band';
  if (section.mark && section.meta) return 'sign-off';
  if (section.left && section.right && !section.image) return 'flank-statement';
  if (section.line && section.image) return 'bleed-line';
  if (section.line && section.cta && !section.image) return 'statement-cta';
  if (section.band) return 'invert-band';
  if (section.item?.image) return 'featured-work';
  if (steps.length >= 3) return 'ascent-steps';
  if (columns.length === 2 && section.image) return 'editorial-split';
  if (columns.length === 2 && !section.image) return 'process-columns';
  if (items.length && items.every((item) => item.title && item.body && !item.image && !item.q)) return 'rule-list';
  if (imaged.length >= 4 && section.strip) return 'film-strip';
  if (imaged.length >= 4) return 'work-rail';
  if (imaged.length === 3 && imaged.some((item) => item.span === 'tall')) return 'material-board';
  if (imaged.length === 3) return 'colonnade';
  if (imaged.length === 2 && section.overlap) return 'peek-overlap';
  if (imaged.length === 2) return 'pair-stills';
  if (section.aside && items.some((item) => item.value)) return 'stat-stack';
  if (section.headline && section.body && section.voidLabel) return 'hero-cinematic';
  return null;
}

function take(out, used, type, section) {
  if (!type || used.has(type) || !section) return;
  used.add(type);
  out.push({ ...section, type });
}

/**
 * Turn a content brief into a short sequence of families.
 * Studio: object first, then motion, then stills, then ask, then invite.
 */
export function planPage(page = {}) {
  if (Array.isArray(page.sections) && page.sections.length && !page.content) {
    return page.sections.map((section) => ({
      ...section,
      type: section.type || inferFamily(section),
    }));
  }

  const content = page.content || {};
  const kind = page.kind || inferKind(content);
  const out = [];
  const used = new Set();

  if (content.projects?.length) take(out, used, 'project-index', { id: 'projects', headline: content.projectsHeadline || 'Selected studies', projects: content.projects });
  if (content.chapters?.length) take(out, used, 'visual-chapters', { id: 'chapters', headline: content.chaptersHeadline, chapters: content.chapters });
  if (content.comparison) take(out, used, 'image-comparison', { id: 'comparison', ...content.comparison });
  if (content.expansion) take(out, used, 'expanding-image', { id: 'expansion', ...content.expansion });

  const featured = content.featured;
  if (featured && (featured.image || featured.item?.image)) {
    const item = featured.item || featured;
    take(out, used, 'featured-work', {
      id: 'featured',
      headline: featured.headline || item.title,
      item: { title: item.title, body: item.body, image: item.image },
    });
  }

  const steps = content.steps || [];
  if (steps.length >= 3) {
    take(out, used, 'ascent-steps', {
      id: 'ascent',
      headline: content.stepsHeadline || 'How it starts',
      steps,
    });
  } else if (steps.length === 2) {
    take(out, used, 'process-columns', {
      id: 'process',
      headline: content.stepsHeadline || 'How it starts',
      columns: steps,
    });
  }

  const stills = (content.stills || []).filter((item) => item?.image);
  if (stills.length >= 4) {
    take(out, used, content.strip ? 'film-strip' : 'work-rail', {
      id: 'rail',
      headline: content.stillsHeadline || 'Stills',
      items: stills,
    });
  } else if (stills.length === 3 && stills.some((item) => item.span === 'tall')) {
    take(out, used, 'material-board', {
      id: 'board',
      headline: content.stillsHeadline || 'Stills',
      items: stills,
    });
  } else if (stills.length === 3) {
    take(out, used, kind === 'studio' ? 'colonnade' : 'material-board', {
      id: 'board',
      headline: content.stillsHeadline || 'Stills',
      items: stills,
    });
  } else if (stills.length === 2) {
    take(out, used, 'pair-stills', {
      id: 'pair',
      headline: content.stillsHeadline,
      items: stills,
    });
  } else if (stills.length === 1 && content.bleedLine) {
    take(out, used, 'bleed-line', {
      id: 'bleed',
      line: content.bleedLine,
      image: stills[0].image,
    });
  }

  if (content.quote?.text) {
    take(out, used, 'quote-pull', {
      id: 'quote',
      quote: content.quote.text,
      by: content.quote.by,
    });
  }

  if (count(content.metrics) && kind !== 'studio') {
    take(out, used, 'stat-stack', {
      id: 'metrics',
      aside: content.metricsAside,
      items: content.metrics,
    });
  }

  if (count(content.questions)) {
    take(out, used, 'faq-rule', {
      id: 'faq',
      headline: content.questionsHeadline || 'Ask',
      items: content.questions,
    });
  }

  if (content.invite?.line) {
    take(out, used, 'statement-cta', {
      id: 'invite',
      line: content.invite.line,
      cta: content.invite.cta,
    });
  }

  // Art direction can set a reading order without naming renderer families.
  // Unlisted content remains present, following the explicit sequence.
  if (page.order?.length) {
    const rank = id => { const index = page.order.indexOf(id); return index < 0 ? page.order.length : index; };
    out.sort((a, b) => rank(a.id) - rank(b.id));
  }
  return out;
}
