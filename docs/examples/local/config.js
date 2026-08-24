/**
 * Local-business demo, GitHub Pages copy. Own frame ladder under ./frames.
 * Only this file differs from the other two reskins — plus its sequence.
 */

export const CONFIG = {
  brand: {
    name: 'Harbor Oven',
    primary: '#2F6B4F',
    ink: '#1C1916',
    paper: '#FBF6EE',
    displayFont: 'Literata, Georgia, serif',
    bodyFont: 'Figtree, system-ui, -apple-system, sans-serif',
  },

  hero: {
    eyebrow: 'Bakery and lunch, North Shore',
    headline: 'Bread in the morning. Soup by noon.',
    sub: 'A neighbourhood oven. Sourdough, seasonal tarts, and a short lunch menu that changes with the market.',
    cta: { label: 'See this week', href: '#what' },
    animationDescription:
      'A fruit tart on a wooden board lifts apart as you scroll: pastry, cream, and two rings of fruit rise, then settle back onto the peel.',
  },

  sections: [
    {
      id: 'what',
      kicker: 'The counter',
      title: 'Walk in for a loaf. Stay for lunch.',
      body: 'We bake through the morning and put a soup, a salad, and two sandwiches on at 11. When a tray is gone, it is gone. The board on the door is the menu.',
    },
    {
      id: 'proof',
      kicker: '',
      title: 'Open Tuesday to Saturday, 8 to 3',
      body: 'Closed Sunday and Monday for the starter. Wholesale loaves for two cafes on the same street. Ask at the counter if you want a standing Saturday order.',
    },
  ],

  cta: {
    title: 'This week\'s tart is on the door',
    body: 'No reservations. If you want a loaf held, send a message before 9.',
    label: 'Get this week\'s hours',
    href: 'https://example.com/harbor-oven',
  },

  motion: {
    framesBase: 'frames',
    scrollLengthVh: 3.5,
    scrub: 0.5,
    lenisDuration: 1.1,
    concurrency: 8,
    maxDpr: 2,
  },
};
