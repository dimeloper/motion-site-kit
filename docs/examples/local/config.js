/**
 * Harbor Oven — denser page chrome + live WebGL sculptural hero.
 * Copy, colors, and UI live here. Motion engine is Harbor-only (src/motion.js).
 */

export const CONFIG = {
  brand: {
    name: 'Harbor Oven',
    primary: '#A04126',
    ink: '#121612',
    paper: '#ECEBE7',
    displayFont: '"Cormorant Garamond", Georgia, serif',
    bodyFont: 'Outfit, system-ui, -apple-system, sans-serif',
  },

  nav: [
    { label: 'Bake', href: '#services' },
    { label: 'Oven', href: '#studio' },
    { label: 'Board', href: '#board' },
    { label: 'Hold a loaf', href: '#cta', action: 'cta' },
  ],

  hero: {
    eyebrow: 'Independent bakery',
    line1: 'Bread in the morning.',
    line2: 'Soup by noon.',
    headline: 'Bread in the morning. Soup by noon.',
    sub: 'Sourdough, a short lunch, and a board on the door that changes with the market.',
    proof: 'Open since 2019 · North Shore',
    opened: 'Open since 2019',
    cta: { label: 'Hold a loaf', href: '#cta' },
    secondary: { label: 'See the board', href: '#board' },
    watermark: 'HARBOR',
    statusLeft: 'Working Tue–Sat',
    statusCenter: 'Walk-in only',
    statusRight: 'Scroll the form',
    animationDescription:
      'As you scroll, the camera orbits a sculpted country loaf while light moves across the crust.',
  },

  cards: [
    {
      caption: 'From the oven',
      title: 'Country loaf',
      note: 'On the counter from 8.',
      image: 'images/loaf.webp',
      alt: 'Flour-dusted country loaf',
    },
    {
      caption: 'This week',
      title: 'Plum market tart',
      note: 'Until the tray is gone.',
      image: 'images/board.webp',
      alt: 'Sliced loaf and jam on a board',
    },
    {
      caption: 'From 11',
      title: 'Soup and two sandwiches',
      note: 'The board on the door is the menu.',
      image: 'images/loaf.webp',
      alt: 'Bakery loaf at Harbor Oven',
    },
  ],

  trusted: {
    label: 'Standing orders',
    names: ['North Peak Cafe', 'Vellum Books', 'Orbit Roasters', 'Mesa Kitchen'],
  },

  services: {
    title: 'What we bake best',
    items: [
      {
        num: '01',
        title: 'Country loaf',
        body: 'A long ferment. Flour-dusted crust, open crumb, ready from eight.',
        href: '#board',
      },
      {
        num: '02',
        title: 'Sesame baguette',
        body: 'Seeded, scored, and gone when the rack is empty.',
        href: '#board',
      },
      {
        num: '03',
        title: 'Market tart',
        body: 'Whatever the North Shore stalls are carrying that week.',
        href: '#board',
      },
      {
        num: '04',
        title: 'Soup and two sandwiches',
        body: 'Lunch from eleven. The board on the door is the menu.',
        href: '#board',
      },
    ],
  },

  stats: {
    kicker: 'By the numbers',
    items: [
      { value: '2019', label: 'Open since' },
      { value: '4', label: 'Standing cafes' },
      { value: '1', label: 'Board on the door' },
      { value: '0', label: 'Reservations' },
    ],
  },

  studio: {
    kicker: 'The oven',
    statement:
      'We bake for neighbours who want bread in the morning and something warm by noon — no reservations, no theatre, just the board on the door.',
    accent: 'neighbours',
    note: 'A small team on the North Shore. Walk-in only.',
    aboutLabel: 'Meet the oven',
    aboutHref: '#about',
    pills: [
      { label: 'We', tone: 'soft' },
      { label: 'Bake', tone: 'accent' },
      { label: 'Hold', tone: 'ink' },
      { label: 'Better', tone: 'ghost' },
    ],
  },

  about: {
    kicker: 'The oven',
    title: 'We bake through the morning. Lunch goes on at 11. When a tray is gone, it is gone.',
    body: 'Walk in for a loaf. Stay if there is still soup. The board on the door is the menu — we do not take reservations, and we will hold a Saturday loaf if you send a note before 9.',
  },

  selected: {
    kicker: 'From the counter',
    title: 'Bread, at its best.',
    items: [
      { title: 'Country loaf', note: 'Flour, water, salt. And time.', image: 'images/loaf.webp', alt: 'A flour-dusted country loaf' },
      { title: 'Bread and jam', note: 'A slow start to the morning.', image: 'images/board.webp', alt: 'Sliced country loaf with jam on a wooden board' },
    ],
  },

  board: {
    kicker: 'This week',
    title: 'On the door',
    hoursLabel: 'Hours',
    hours: [
      { day: 'Tuesday – Friday', time: '8:00 – 15:00' },
      { day: 'Saturday', time: '8:00 – 15:00' },
      { day: 'Sunday – Monday', time: 'Closed for the starter' },
    ],
    menuLabel: 'On the counter',
    items: [
      { name: 'Country loaf', note: 'From 8' },
      { name: 'Sesame baguette', note: 'Until it is gone' },
      { name: 'Market tart', note: 'This week: plum' },
      { name: 'Soup and two sandwiches', note: 'From 11' },
    ],
  },

  cta: {
    kicker: 'Saturday hold',
    title: 'Hold a loaf for Saturday',
    body: 'Send a note before 9. No reservations for lunch — come when the door is open.',
    label: "Get this week's hours",
    href: '#board',
    secondaryLabel: 'See the board',
    secondaryHref: '#board',
    stepsTitle: 'How a hold works',
    steps: [
      {
        num: '01',
        title: 'Note before 9',
        body: 'Name, loaf count, and Saturday pickup. We reply when it is on the rack.',
      },
      {
        num: '02',
        title: 'Collect by noon',
        body: 'Held loaves leave the counter at 12 if you do not come.',
      },
      {
        num: '03',
        title: 'Lunch stays walk-in',
        body: 'Soup and sandwiches are still first-come. The hold is for bread only.',
      },
    ],
    aside: {
      label: 'This Saturday',
      lines: [
        { k: 'Hold window', v: 'Note by Fri 9:00' },
        { k: 'Pickup', v: 'Sat 8:00 – 12:00' },
        { k: 'What we hold', v: 'Country loaf · baguette' },
      ],
    },
  },

  footer: {
    place: 'North Shore',
    credit:
      'Hero loaf: Higgsfield Meshy GLB from a clean studio still. Supporting photos from Unsplash.',
  },

  motion: {
    engine: 'webgl',
    modelUrl: 'models/loaf.glb',
    scrollLengthVh: 3.4,
    scrub: 0.6,
    lenisDuration: 1.15,
    maxDpr: 2,
  },
};
