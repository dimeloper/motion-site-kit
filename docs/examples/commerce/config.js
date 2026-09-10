/**
 * Halo studio. Page composes from docs/kit/.
 * Content, not types: planPage() picks families from this brief.
 * Motion: rings lift off a textured stone and seat on reverse.
 */

export const CONFIG = {
  brand: {
    name: 'Halo',
    primary: '#e4c56a',
    ink: '#eceae6',
    paper: '#0c0d10',
    displayFont: 'Syne, Avenir Next, sans-serif',
    bodyFont: 'Figtree, system-ui, sans-serif',
  },

  nav: [
    { label: 'Work', href: '#rail' },
    { label: 'Studio', href: '#ascent' },
    { label: 'Ask', href: '#faq' },
  ],

  hero: {
    headline: 'Ideas made tangible.',
    sub: 'Brand, motion, and immersive web. The tools change. The craft does not.',
    cta: { label: 'Pitch your idea', href: '#invite' },
    secondary: { label: 'See the work', href: '#rail' },
    animationDescription:
      'As you scroll, two rings of light lift off a stone pillar and hang in the dark. Scroll back and they seat again.',
    statusLeft: 'Stone at rest',
    statusCenter: 'Scroll to lift',
    statusRight: 'Rings seat',
  },

  page: {
    kind: 'studio',
    content: {
      featured: {
        headline: 'Altar',
        title: 'Stone, then light',
        body: 'The piece we would put on a table. Rings written as light.',
        image: {
          src: 'images/pillar.jpg',
          alt: 'Weathered limestone monolith, Halo studio object',
          width: 1200,
          height: 1600,
        },
      },
      stepsHeadline: 'How a brief starts',
      steps: [
        {
          num: '01',
          title: 'Send the object',
          body: 'The still, who it is for, and one sentence for what scroll should do.',
        },
        {
          num: '02',
          title: 'We pick a motion',
          body: 'Lift and seat, orbit, or peel. If scroll does not change the object, we cut it.',
        },
        {
          num: '03',
          title: 'You get a lane',
          body: 'A motion language and a page sequence. Not a reskin of the last site.',
        },
      ],
      stillsHeadline: 'Stills from the room',
      stills: [
        {
          title: 'Table',
          body: 'Prints and samples before a pitch.',
          image: {
            src: 'images/table.jpg',
            alt: 'Studio table with a stone sample and a rolled print',
            width: 1600,
            height: 1200,
          },
        },
        {
          title: 'Grain',
          body: 'The texture is the brief.',
          image: {
            src: 'images/grain.jpg',
            alt: 'Limestone grain, Halo studio still',
            width: 1200,
            height: 1600,
          },
        },
        {
          title: 'Cut',
          body: 'The same stone, flattened for the poster.',
          image: {
            src: 'images/pillar-cut.webp',
            alt: 'Stone pillar on a dark field, Halo poster still',
            width: 1200,
            height: 1600,
          },
        },
        {
          title: 'Altar',
          body: 'The piece on the table.',
          image: {
            src: 'images/pillar.jpg',
            alt: 'Weathered limestone monolith, Halo studio object',
            width: 1200,
            height: 1600,
          },
        },
      ],
      questionsHeadline: 'Before you write',
      questions: [
        {
          q: 'What do you take on?',
          a: 'Brand systems, motion sites, and WebGL heroes where the object has to hold. One surface at a time.',
        },
        {
          q: 'Do you start from a template?',
          a: 'The scroll engine is shared. The page is composed from the brief. We do not reskin the last site and change the nouns.',
        },
        {
          q: 'How do we begin?',
          a: 'Send the object, the audience, and one sentence for what scroll should do. We reply with a lane and a motion language.',
        },
      ],
      invite: {
        line: 'Pitch the object. We will tell you if it can hold.',
        cta: { label: 'Pitch your idea', href: 'mailto:hello@halo.studio' },
      },
    },
  },

  footer: {
    credit: 'Halo studio. Motion, identity, immersive web.',
  },

  motion: {
    engine: 'webgl',
    modelUrl: 'models/pillar.glb',
    scrollLengthVh: 3.2,
    scrub: 0.6,
    maxDpr: 2,
    lenisDuration: 1.1,
  },
};
