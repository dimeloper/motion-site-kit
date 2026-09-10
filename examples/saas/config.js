/**
 * Vortex — a fitness ring you wear. Hero is a CAD band: halo peels, then seats.
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
    { label: 'Explore', href: '#cta', action: 'cta' },
  ],

  hero: {
    eyebrow: 'Wearable concept',
    line1: 'Wear the ring.',
    line2: 'Every day.',
    headline: 'Wear the ring. Every day.',
    lead: 'Move, strain, and sleep. On one band.',
    sub: 'Vortex is a fitness ring you wear through the day. This concept explores movement, sleep and recovery in a small wearable.',
    proof: 'Titanium / concept study',
    opened: 'Independent design study',
    cta: { label: 'Explore', href: '#cta' },
    secondary: { label: 'On the band', href: '#modules' },
    watermark: 'VORTEX',
    statusLeft: 'Ring open',
    statusCenter: 'Scroll to close',
    statusRight: 'On your finger',
    animationDescription:
      'A black titanium fitness ring sits in the hero. Cyan motes peel off the band as you scroll, then reseat. Scrolling back opens the halo again.',
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
        body: 'A place for overnight trends and recovery information in the wearable concept.',
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
      { value: 'Ti', label: 'Titanium study' },
      { value: '01', label: 'Band design' },
      { value: '3D', label: 'Working model' },
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
        links: ['Titanium', 'Everyday wear'],
      },
      {
        num: '02',
        title: 'Vortex Night',
        body: 'Blackout band. Lights-out sleep and skin temp.',
        tone: 'photo',
        image: 'images/lock-night.jpg',
        cta: 'Material study',
      },
      {
        num: '03',
        title: 'Vortex Pulse',
        body: 'Cyan inlay. The band you can see from across the room.',
        tone: 'ink',
        cta: 'Material study',
      },
    ],
  },

  about: {
    kicker: 'Why a ring',
    title: 'A wearable for your finger.',
    body: 'Vortex explores how a compact ring could fit around training, desk work and sleep. The website is a design study; the ring is not a product for sale.',
  },

  cta: {
    kicker: 'Choose a finish',
    title: 'Find your finish.',
    body: 'Brushed titanium, midnight black, or a line of cyan. Explore the material studies.',
    href: '#builds',
    label: 'Explore the finishes',
    secondaryLabel: 'On the band',
    secondaryHref: '#modules',
  },

  footer: {
    place: 'Worn in North Loop',
    credit:
      'Hero: CAD titanium band (image-to-3D cracks a ring). Cyan motes peel and reseat.',
    links: [
      { label: 'Day', href: '#modules' },
      { label: 'Wear', href: '#feel' },
      { label: 'Finishes', href: '#builds' },
      { label: 'Explore', href: '#cta' },
    ],
    social: [
      { label: 'Motion site kit', href: '../../index.html' },
      { label: 'Source', href: 'https://github.com/dimeloper/motion-site-kit' },
    ],
  },

  motion: {
    engine: 'webgl',
    scrollLengthVh: 3.4,
    scrub: 0.6,
    maxDpr: 2,
    lenisDuration: 1.1,
  },
};
