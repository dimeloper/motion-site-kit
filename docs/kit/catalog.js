/**
 * Specimen copy for the page kit. Not a product.
 * Images are Harbor / Vortex stills used as layout stand-ins.
 */

const loaf = {
  src: '../examples/local/images/loaf.webp',
  alt: 'Harbor loaf, used here as a layout stand-in',
  width: 1600,
  height: 1600,
};

const board = {
  src: '../examples/local/images/board.webp',
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
    { type: 'visual-chapters', id: 'chapters', headline: 'From dough to table', chapters: [
      { title: 'The loaf', body: 'A close view of the flour-dusted crust.', image: loaf },
      { title: 'The table', body: 'The same bread, sliced and ready to share.', image: board },
    ] },
    { type: 'expanding-image', id: 'expansion', headline: 'Room for the image', image: board, caption: 'Harbor Oven / bread and jam' },
    { type: 'project-index', id: 'projects', headline: 'Selected studies', projects: [
      { title: 'Harbor Oven', discipline: 'Hospitality / WebGL', body: 'A bakery built around a flour-dusted loaf.', image: loaf, href: '../examples/local/' },
      { title: 'Vortex', discipline: 'Product / WebGL', body: 'A titanium band that opens as you scroll.', image: lock, href: '../examples/saas/' },
    ] },
    { type: 'image-comparison', id: 'comparison', headline: 'One form, two finishes',
      before: { label: 'Silver', image: { src: '../examples/vgpu/demo/poster.png', alt: 'Silver Fold sculpture', width: 1200, height: 900 } },
      after: { label: 'Champagne', image: { src: '../examples/vgpu/demo/poster-champagne.png', alt: 'Champagne Fold sculpture', width: 1200, height: 900 } },
    },
    {
      type: 'hero-cinematic',
      id: 'hero-cinematic',
      headline: 'Crafted to hold a void',
      body: 'A headline and introduction sit beside space reserved for your model, video or still.',
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
          body: 'A headline, two short passages and a tall still introduce the subject.',
        },
        {
          num: '[ 02 ]',
          body: 'Use the second passage for context, a source note or a practical detail.',
        },
      ],
      image: board,
    },
    {
      type: 'stat-stack',
      id: 'metrics',
      aside: 'A lead metric followed by supporting figures and a next step.',
      items: [
        { variant: 'lead', value: '34', label: 'layout families', note: 'the planner picks a short sequence', href: '#featured', goLabel: 'Next family' },
        { variant: 'plain', value: '1×', label: 'complete page preview' },
        { variant: 'action', value: '0', label: 'required extra packages', href: '#board', goLabel: 'Material board' },
      ],
    },
    {
      type: 'featured-work',
      id: 'featured',
      headline: 'One piece, in focus',
      item: {
        kicker: 'Featured work',
        title: 'Harbor, loaf orbit',
        body: 'An interactive bakery study built around a textured loaf.',
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
      headline: 'A material collection',
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
          body: 'Choose the content your visitor needs and set its reading order.',
        },
        {
          num: '02',
          title: 'Then the object',
          body: 'Use an authored or licensed asset. Inspect its silhouette, texture and lighting before adding motion.',
        },
      ],
    },
    {
      type: 'work-rail',
      id: 'rail',
      headline: 'Browse the collection',
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
      headline: 'From brief to page',
      steps: [
        { num: '01', title: 'Name the object', body: 'Choose the object or image that carries the story.' },
        { num: '02', title: 'Pick a motion', body: 'Orbit, peel, or lift. One language per page.' },
        { num: '03', title: 'Compose the page', body: 'Arrange the sections, then review the full page at desktop and phone widths.' },
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
      quote: 'Bread in the morning. Soup by noon.',
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
      headline: 'Two views of the table',
      items: [
        { title: 'Loaf', body: 'The wider cell.', image: loaf },
        { title: 'Board', body: 'The shorter cell.', image: board },
      ],
    },
    {
      type: 'note-margin',
      id: 'note',
      headline: 'A note in the margin',
      body: 'A main passage explains the subject. A shorter margin note adds context.',
      note: 'Keep the note short enough to scan beside the main passage.',
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
      band: 'A short pause between chapters.',
    },
    {
      type: 'rule-list',
      id: 'rules',
      headline: 'Before you publish',
      items: [
        { title: 'Name the object', body: 'Choose an image that explains the subject.' },
        { title: 'One motion', body: 'Choose a movement that reveals a useful detail.' },
        { title: 'Short sequence', body: 'Include the sections needed to complete the story.' },
      ],
    },
    {
      type: 'measure-band',
      id: 'measure',
      value: '1×',
      label: 'complete page, reviewed at two widths.',
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
      headline: 'From the kit',
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
        'Start with the object.',
        'Show what changes.',
        'Give the reader a next step.',
      ],
    },
    {
      type: 'faq-rule',
      id: 'faq',
      headline: 'Frequently',
      items: [
        {
          q: 'Where should I start?',
          a: 'Choose a complete page recipe above. Replace its content, then review the full sequence.',
        },
        {
          q: 'Do I have to use every family?',
          a: 'Use the families that serve your content. There is no required section count.',
        },
        {
          q: 'Where does Halo live?',
          a: 'Open the Halo example to see the shared project index, visual chapters and expanding image in a complete portfolio.',
        },
      ],
    },
    {
      type: 'hero-editorial',
      id: 'hero-editorial',
      framed: true,
      frameCaption: 'Editorial hero with a tall image and supporting notes.',
      headline: 'A living interface',
      columns: [
        { num: '[ 01 ]', body: 'Introduce the subject with a short passage beside the image.' },
        { num: '[ 02 ]', body: 'Set the section colors to fit the surrounding page and verify contrast.' },
      ],
      image: board,
    },
    {
      type: 'statement-cta',
      id: 'cta',
      line: 'See these sections in a working portfolio.',
      cta: { label: 'Open Halo', href: '../examples/commerce/' },
    },
  ],
};
