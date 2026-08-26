/**
 * Vortex — DualSense-class console page.
 * Motion language: parts explode, then seat on scroll (not orbit).
 */

export const CONFIG = {
  brand: {
    name: 'Vortex',
    primary: '#3D8BFF',
    ink: '#07080C',
    paper: '#E8EAF0',
    displayFont: '"Syne", system-ui, sans-serif',
    bodyFont: '"IBM Plex Sans", system-ui, -apple-system, sans-serif',
  },

  nav: [
    { label: 'Spec', href: '#spec' },
    { label: 'Feel', href: '#feel' },
    { label: 'Build', href: '#build' },
    { label: 'Preorder', href: '#cta', action: 'cta' },
  ],

  hero: {
    eyebrow: 'Wireless console control',
    line1: 'Parts in the air.',
    line2: 'Then one piece.',
    headline: 'Parts in the air. Then one piece.',
    sub: 'A DualSense-class controller that seats itself on scroll — grips, sticks, and triggers lock in under your thumb.',
    proof: 'Adaptive triggers · Haptic bus',
    opened: 'Ship window Q3',
    cta: { label: 'Preorder', href: '#cta' },
    secondary: { label: 'See the build', href: '#build' },
    watermark: 'VORTEX',
    statusLeft: 'Exploded view',
    statusCenter: 'Scroll to assemble',
    statusRight: 'Pin engaged',
    animationDescription:
      'As you scroll, scattered controller parts fly inward and lock into a finished DualSense-class form.',
  },

  cards: [
    {
      caption: 'Module',
      title: 'Left grip',
      note: 'Seats at 38% scroll.',
      image: 'images/controller.jpg',
      alt: 'Vortex controller grip module',
    },
    {
      caption: 'Module',
      title: 'Haptic core',
      note: 'Bus lights after lock.',
      image: 'images/controller.jpg',
      alt: 'Vortex haptic core',
    },
    {
      caption: 'Module',
      title: 'Trigger pair',
      note: 'Adaptive travel last.',
      image: 'images/controller.jpg',
      alt: 'Vortex adaptive triggers',
    },
  ],

  trusted: {
    label: 'In the lab with',
    names: ['Northline Studio', 'Arc Race', 'Pulse Arcade', 'Kite Games'],
  },

  services: {
    title: 'What locks in',
    items: [
      {
        num: '01',
        title: 'Shell halves',
        body: 'Graphite shells approach from opposite sides and meet on the midplane.',
        href: '#build',
      },
      {
        num: '02',
        title: 'Analog sticks',
        body: 'Caps drop onto their wells with a short overshoot, then settle.',
        href: '#build',
      },
      {
        num: '03',
        title: 'Face cluster',
        body: 'Four face buttons and the touch strip seat as one assembly.',
        href: '#build',
      },
      {
        num: '04',
        title: 'Triggers',
        body: 'L2 / R2 slide home last — adaptive travel engages after lock.',
        href: '#build',
      },
    ],
  },

  stats: {
    kicker: 'By the numbers',
    items: [
      { value: '12', label: 'Discrete parts in the explode' },
      { value: '3.4', label: 'Viewport heights of scroll pin' },
      { value: '8 ms', label: 'Haptic sample bus' },
      { value: '48 h', label: 'Battery at mid brightness' },
    ],
  },

  studio: {
    kicker: 'The feel',
    statement:
      'We design for the moment the last part seats — resistance in the triggers, a quiet click in the sticks, light on the bus.',
    aboutHref: '#feel',
    aboutLabel: 'Read the feel brief',
    pills: [
      { label: 'Adaptive triggers', tone: 'soft' },
      { label: 'Dual haptics', tone: 'accent' },
      { label: '', tone: 'ink' },
      { label: 'Hall sticks', tone: 'ghost' },
    ],
  },

  about: {
    kicker: 'Build',
    title: 'Assembled in view',
    body: 'No orbit for the sake of orbit. Scroll pulls twelve modules from a scatter field into one controller. Reverse the scroll and they leave again.',
  },

  board: {
    kicker: 'Spec sheet',
    title: 'On the door',
    hoursLabel: 'Connectivity',
    menuLabel: 'Modules',
    hours: [
      { day: 'Bluetooth', time: '5.2 LE Audio' },
      { day: 'Wired', time: 'USB-C · 1000 Hz' },
      { day: 'Dongle', time: 'Optional 2.4 GHz' },
    ],
    items: [
      { name: 'Shell', note: 'Matte graphite ABS' },
      { name: 'Sticks', note: 'Hall effect' },
      { name: 'Triggers', note: 'Adaptive dual-stage' },
      { name: 'Haptics', note: 'L / R voice-coil' },
    ],
  },

  selected: {
    kicker: 'Selected trays',
    title: 'Builds we ship',
    items: [
      {
        title: 'Vortex Core',
        note: 'Graphite · cyan bus',
        image: 'images/controller.jpg',
        alt: 'Vortex Core controller',
      },
      {
        title: 'Vortex Night',
        note: 'Blackout · dim bus',
        image: 'images/controller.jpg',
        alt: 'Vortex Night controller',
      },
    ],
  },

  cta: {
    kicker: 'Preorder',
    title: 'Hold a serial for launch week',
    body: 'Reserve a unit. We email when the build window opens — no charge until you confirm.',
    href: 'https://example.com/vortex-preorder',
    label: 'Preorder Vortex',
    secondaryLabel: 'See the build',
    secondaryHref: '#build',
    steps: [
      { num: '01', title: 'Hold window', body: 'Note by Friday' },
      { num: '02', title: 'Confirm', body: 'Email when builds open' },
      { num: '03', title: 'Ship', body: 'Launch week serial' },
    ],
  },

  footer: {
    place: 'Hardware lab · North Loop',
    credit: 'Hero: procedural explode/assemble in Three.js. Poster still from Higgsfield Marketing Studio.',
  },

  motion: {
    engine: 'webgl-explode',
    scrollLengthVh: 3.6,
    scrub: 0.55,
    maxDpr: 2,
    lenisDuration: 1.1,
  },
};
