/**
 * Vortex — a fitness ring you wear. Hero is one torus: land, puff, seat.
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
    { label: 'Day', href: '#modules' },
    { label: 'Wear', href: '#feel' },
    { label: 'Finishes', href: '#builds' },
    { label: 'Preorder', href: '#cta', action: 'cta' },
  ],

  hero: {
    eyebrow: 'Fitness ring',
    line1: 'Wear the ring.',
    line2: 'Every day.',
    headline: 'Wear the ring. Every day.',
    lead: 'Move, strain, and sleep. On one band.',
    sub: 'Vortex is a fitness ring you wear through the day. Heart, load, and recovery sit on your finger — not on another screen.',
    proof: '18-hour wear · Daily close',
    opened: 'Ship window Q3',
    cta: { label: 'Preorder', href: '#cta' },
    secondary: { label: 'On the band', href: '#modules' },
    watermark: 'VORTEX',
    statusLeft: 'Ring open',
    statusCenter: 'Scroll to close',
    statusRight: 'On your finger',
    animationDescription:
      'Cyan motes travel around a fitness ring and seat on the same band. Scroll opens a halo on that tube, then seats it. Scrolling back opens it again.',
  },

  tags: [
    'Heart rate',
    'Daily close',
    'Sleep',
    'Strain',
    'Recovery',
  ],

  trusted: {
    label: 'Worn with',
    names: ['Northline', 'Arc Race', 'Pulse', 'Kite', 'Ledgerly', 'Vaulted'],
  },

  modules: {
    kicker: 'On the band',
    title: 'Heart, load, and sleep.',
    items: [
      {
        num: '01',
        title: 'Move',
        body: 'Walks, rides, and sessions write to the band until you take it off.',
        href: '#builds',
      },
      {
        num: '02',
        title: 'Strain',
        body: 'Heart rate and training load, captured while you move.',
        href: '#builds',
      },
      {
        num: '03',
        title: 'Recover',
        body: 'Sleep and HRV tell you when to push and when to stop.',
        href: '#builds',
      },
      {
        num: '04',
        title: 'Tomorrow',
        body: 'Each morning starts a new day on the same ring.',
        href: '#builds',
      },
    ],
  },

  stats: {
    items: [
      { value: '18 h', label: 'Wear time' },
      { value: '7-day', label: 'Close streak' },
      { value: '4.9', label: 'Worn rating' },
    ],
  },

  feel: {
    kicker: 'On-body',
    titleBefore: 'Built for the hour',
    titleAccent: 'you take it off',
    body: 'Light enough to sleep in. You forget it is on until you take it off.',
    pills: ['Titanium band', 'SpO₂', 'Skin temp'],
  },

  builds: {
    kicker: 'Finishes',
    title: 'Three finishes. One ring.',
    items: [
      {
        num: '01',
        title: 'Vortex Core',
        body: 'Brushed titanium. Gym, desk, and the commute between.',
        tone: 'paper',
        links: ['Spec sheet', 'Preorder'],
      },
      {
        num: '02',
        title: 'Vortex Night',
        body: 'Blackout band. Lights-out sleep and skin temp.',
        tone: 'photo',
        image: 'images/lock-night.jpg',
        cta: 'Discover',
      },
      {
        num: '03',
        title: 'Vortex Pulse',
        body: 'Cyan inlay. The band you can see from across the room.',
        tone: 'ink',
        cta: 'Discover',
      },
    ],
  },

  about: {
    kicker: 'Why a ring',
    title: 'A watch wants your wrist. This does not.',
    body: 'Vortex stays on your finger so heart rate, strain, and sleep keep running while you train, type, and sleep. No extra strap. No second screen.',
  },

  cta: {
    kicker: 'Preorder',
    title: 'Reserve a size.',
    body: 'We email when your band ships. No charge until you confirm.',
    href: 'https://example.com/vortex-preorder',
    label: 'Preorder Vortex',
    secondaryLabel: 'On the band',
    secondaryHref: '#modules',
  },

  footer: {
    place: 'Worn in North Loop',
    credit:
      'Hero: procedural fitness torus in Three.js. Particles spiral one way and seat on the same ring. No product GLB.',
    links: [
      { label: 'Day', href: '#modules' },
      { label: 'Wear', href: '#feel' },
      { label: 'Finishes', href: '#builds' },
      { label: 'Preorder', href: '#cta' },
    ],
    social: [
      { label: 'Instagram', href: '#' },
      { label: 'X', href: '#' },
      { label: 'YouTube', href: '#' },
      { label: 'LinkedIn', href: '#' },
    ],
  },

  motion: {
    engine: 'webgl-assemble',
    scrollLengthVh: 3.6,
    scrub: 0.55,
    maxDpr: 2,
    lenisDuration: 1.1,
  },
};
