/**
 * Tint Safari's status bar and bottom toolbar from the section under them.
 *
 * Safari 26 on iOS ignores <meta name="theme-color">. It paints the area behind
 * its bars from the body's background-color, unless a position: fixed element
 * with a background sits within a few pixels of that edge and spans most of the
 * viewport's width. A dark hero on a light page therefore gets light bars.
 *
 * Mark any full-bleed section with data-edge-tint="<colour>". While it covers
 * the top or bottom edge of the viewport, a thin fixed strip in that colour sits
 * at the edge and Safari samples it; otherwise the strip is display: none (not
 * opacity: 0, which Safari still samples) and the bar falls back to the body.
 * The strips only render on iOS WebKit; see .edge-tint in styles.css.
 */
export function syncEdgeTint() {
  const sections = [...document.querySelectorAll('[data-edge-tint]')];
  if (!sections.length) return;

  const strip = (edge) => {
    const el = document.createElement('div');
    el.className = `edge-tint edge-tint--${edge}`;
    el.setAttribute('aria-hidden', 'true');
    el.hidden = true;
    document.body.append(el);
    return el;
  };
  const edges = [[strip('top'), () => 0], [strip('bottom'), () => innerHeight - 1]];

  const covering = (y) => sections.find((section) => {
    const rect = section.getBoundingClientRect();
    return rect.top <= y && rect.bottom > y;
  });

  let frame = 0;
  const update = () => {
    frame = 0;
    for (const [el, y] of edges) {
      const section = covering(y());
      el.hidden = !section;
      if (section) el.style.backgroundColor = section.dataset.edgeTint;
    }
  };
  const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule);
  update();
}
