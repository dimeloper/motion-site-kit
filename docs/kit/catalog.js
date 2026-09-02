/**
 * Specimen copy for the page kit. Not a product.
 * Images are Harbor / Vortex stills used as layout stand-ins.
 */

const loaf = {
  src: '../examples/local/images/loaf.jpg',
  alt: 'Harbor loaf, used here as a layout stand-in',
  width: 1600,
  height: 1600,
};

const board = {
  src: '../examples/local/images/board.jpg',
  alt: 'Harbor board still, used here as a layout stand-in',
  width: 1600,
  height: 2000,
};

const lock = {
  src: '../examples/saas/images/lock.jpg',
  alt: 'Vortex ring still, used here as a layout stand-in',
  width: 800,
  height: 800,
};

export const CATALOG = {
  sections: [
    {
      type: 'hero-cinematic',
      id: 'hero-cinematic',
      headline: 'Crafted to hold a void',
      body: 'Type stays in the reading lane. The object owns the right. Harbor and Vortex already use a split hero. This one leaves the object lane empty on purpose.',
      cta: { label: 'See the families', href: '#editorial' },
      foot: 'Cinematic hero. One object. No four-up stats.',
      voidLabel: 'Object lane',
    },
    {
      type: 'editorial-split',
      id: 'editorial',
      headline: 'A living interface',
      columns: [
        {
          num: '[ 01 ]',
          body: 'This family is a headline plus two short columns and a tall still. It is not a numbered module list.',
        },
        {
          num: '[ 02 ]',
          body: 'Use it when the next vertical needs to explain a mechanism without three identical cards.',
        },
      ],
      image: board,
    },
    {
      type: 'stat-stack',
      id: 'metrics',
      aside: 'One glass column. The first metric is larger. The others are not clones of it.',
      items: [
        { variant: 'lead', value: '30', label: 'layout families', note: 'the planner picks a short sequence', href: '#featured', goLabel: 'Next family' },
        { variant: 'plain', value: '1×', label: 'each family, once per page' },
        { variant: 'action', value: '0', label: 'Vortex section clones', href: '#board', goLabel: 'Material board' },
      ],
    },
    {
      type: 'featured-work',
      id: 'featured',
      headline: 'One piece, in focus',
      item: {
        kicker: 'Featured work',
        title: 'Harbor, loaf orbit',
        body: 'Art direction, WebGL. A single card, not a finish grid.',
        image: loaf,
      },
    },
    {
      type: 'flank-statement',
      id: 'flank',
      left: 'Envision',
      right: 'Materialize',
      voidLabel: 'Object sits here',
    },
    {
      type: 'material-board',
      id: 'board',
      headline: 'Materials, not finishes',
      items: [
        { span: 'tall', title: 'Crust', body: 'Tall cell. Owns the left column.', image: loaf },
        { span: 'unit', title: 'Board', body: 'Shorter cell, different ratio.', image: board },
        { span: 'unit', title: 'Band', body: 'Third cell. Not the same card twice.', image: lock },
      ],
    },
    {
      type: 'process-columns',
      id: 'process',
      headline: 'How a new vertical is built',
      columns: [
        {
          num: '01',
          title: 'Pick families',
          body: 'Four or more, all different. If the page reads as modules, feel, then three finish cards, start over.',
        },
        {
          num: '02',
          title: 'Then the object',
          body: 'Meshy PBR or a licensed textured GLB. Untextured CAD primitives failed twice. Do not light clay and ship it.',
        },
      ],
    },
    {
      type: 'work-rail',
      id: 'rail',
      headline: 'A strip, not a grid',
      items: [
        { title: 'Loaf', body: 'Scroll sideways. Snap each still.', image: loaf },
        { title: 'Board', body: 'Different ratio on purpose.', image: board },
        { title: 'Band', body: 'A third frame. Keep going.', image: lock },
      ],
    },
    {
      type: 'colonnade',
      id: 'colonnade',
      headline: 'Three shafts, three heights',
      items: [
        { title: 'Left owns height', body: 'Tallest cell.', image: board },
        { title: 'Middle sits short', body: 'Different crop.', image: lock },
        { title: 'Right lands between', body: 'Not a card row.', image: loaf },
      ],
    },
    {
      type: 'ascent-steps',
      id: 'ascent',
      headline: 'A spine, not two columns',
      steps: [
        { num: '01', title: 'Name the object', body: 'If you cannot point at it, you do not have a brief.' },
        { num: '02', title: 'Pick a motion', body: 'Orbit, peel, or lift. One language per page.' },
        { num: '03', title: 'Compose the page', body: 'Four different families. Stop before you use all thirty.' },
      ],
    },
    {
      type: 'bleed-line',
      id: 'bleed',
      line: 'The object fills the frame',
      image: {
        src: board.src,
        alt: board.alt,
        width: 1600,
        height: 1000,
      },
    },
    {
      type: 'quote-pull',
      id: 'quote',
      quote: 'If you cannot point at the object, you do not have a brief.',
      by: 'Page kit, on picking a family',
    },
    {
      type: 'contact-split',
      id: 'contact',
      kicker: 'Studio',
      address: 'By appointment. No walk-in shelf.',
      note: 'Write the object first.',
      email: 'hello@halo.studio',
    },
    {
      type: 'pair-stills',
      id: 'pair',
      headline: 'Two frames, not a row of three',
      items: [
        { title: 'Loaf', body: 'The wider cell.', image: loaf },
        { title: 'Board', body: 'The shorter cell.', image: board },
      ],
    },
    {
      type: 'note-margin',
      id: 'note',
      headline: 'A note in the margin',
      body: 'Body copy keeps the reading lane. The aside is a short correction, not a second column of the same weight.',
      note: 'Do not turn this into two equal process columns.',
    },
    {
      type: 'hours-list',
      id: 'hours',
      headline: 'When the room is open',
      rows: [
        { label: 'Briefs', value: 'Tue–Thu' },
        { label: 'Builds', value: 'By lane' },
        { label: 'Reviews', value: 'On the object' },
      ],
    },
    {
      type: 'film-strip',
      id: 'strip',
      headline: 'A contact sheet',
      items: [
        { image: loaf },
        { image: board },
        { image: lock },
        { image: loaf },
      ],
    },
    {
      type: 'invert-band',
      id: 'band',
      band: 'Same paper. A band is not a light page.',
    },
    {
      type: 'rule-list',
      id: 'rules',
      headline: 'Rules, not a spine',
      items: [
        { title: 'Name the object', body: 'If you cannot point at it, pick a still, not a family.' },
        { title: 'One motion', body: 'Orbit, peel, or lift. Mixing languages is a reskin.' },
        { title: 'Short sequence', body: 'Four families. The catalog is not a page.' },
      ],
    },
    {
      type: 'measure-band',
      id: 'measure',
      value: '1×',
      label: 'each family, once. Repeating a layout is the clone.',
    },
    {
      type: 'chapter-index',
      id: 'index',
      headline: 'On this page',
      chapters: [
        { num: 'I', title: 'Object lane', href: '#hero-cinematic' },
        { num: 'II', title: 'Materials', href: '#board' },
        { num: 'III', title: 'Ask', href: '#faq' },
      ],
    },
    {
      type: 'caption-still',
      id: 'caption',
      image: board,
      caption: 'Harbor board still, used as a layout stand-in. One frame, one line.',
    },
    {
      type: 'peek-overlap',
      id: 'peek',
      headline: 'One still peeks the other',
      front: loaf,
      back: board,
    },
    {
      type: 'sign-off',
      id: 'signoff',
      mark: 'Halo',
      meta: 'Studio colophon. Not a second statement CTA.',
    },
    {
      type: 'client-marks',
      id: 'marks',
      headline: 'Names, not a logo wall',
      marks: ['Harbor', 'Vortex', 'Halo'],
    },
    {
      type: 'spotlight-stage',
      id: 'spot',
      headline: 'One stage',
      image: loaf,
      thumbs: [
        { title: 'Loaf', image: loaf },
        { title: 'Board', image: board },
        { title: 'Band', image: lock },
      ],
    },
    {
      type: 'claim-stack',
      id: 'claims',
      headline: 'What the page claims',
      claims: [
        'The object holds.',
        'Scroll changes it.',
        'The page is not Vortex.',
      ],
    },
    {
      type: 'faq-rule',
      id: 'faq',
      headline: 'Frequently',
      items: [
        {
          q: 'Can the next demo reuse Vortex HTML?',
          a: 'No. Reuse loader, Lenis, menu, and fallback invariants. Section markup comes from this kit, or it is written new.',
        },
        {
          q: 'Do I have to use every family?',
          a: 'No. planPage() picks a short sequence from the brief. Using all thirty on one site is the same mistake as three identical cards.',
        },
        {
          q: 'Where does Halo live?',
          a: 'docs/examples/commerce/. Studio brief: featured still, three steps, four stills, questions, invite. The planner maps that to featured-work, ascent-steps, work-rail, faq-rule, statement-cta. Rings lift off the stone.',
        },
      ],
    },
    {
      type: 'hero-editorial',
      id: 'hero-editorial',
      framed: true,
      frameCaption: 'Light family. Use on its own light page. Do not drop it between dark sections.',
      headline: 'A living interface',
      columns: [
        { num: '[ 01 ]', body: 'Sparse type, tall still, two notes. For a light vertical only.' },
        { num: '[ 02 ]', body: 'If the page is dark, keep this family in a drawer.' },
      ],
      image: board,
    },
    {
      type: 'statement-cta',
      id: 'cta',
      line: 'Pick a concept. Then we compose a page that is not Vortex.',
      cta: { label: 'Open Halo', href: '../examples/commerce/' },
    },
  ],
};
