import './style.css';

const stage = document.querySelector('.stage');
const track = document.querySelector('.track');
const canvas = stage.querySelector('canvas');
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
let engine, pending = 0, stopped = false, finish = 0;
const poster = stage.querySelector('.artwork img');
const finishes = [
  ['poster.png', 'silver'], ['poster-champagne.png', 'champagne'], ['poster-graphite.png', 'graphite'],
];
for (const button of stage.querySelectorAll('[data-finish]')) {
  button.addEventListener('click', () => {
    finish = Number(button.dataset.finish);
    for (const choice of stage.querySelectorAll('[data-finish]')) {
      choice.setAttribute('aria-pressed', String(choice === button));
    }
    poster.src = `./${finishes[finish][0]}`;
    poster.alt = `A sculptural ${finishes[finish][1]} sheet with deep folds and reflected studio light.`;
    schedule();
  });
}
const events = new AbortController();
const deadline = setTimeout(() => fallback('load-timeout'), 10000);

function fallback(reason) {
  stopped = true;
  clearTimeout(deadline);
  cancelAnimationFrame(pending);
  events.abort();
  engine?.dispose();
  stage.dataset.state = 'static';
  stage.dataset.reason = reason;
  track.classList.remove('is-live');
}

function draw() {
  pending = 0;
  if (stopped || document.hidden) return;
  const rect = track.getBoundingClientRect();
  if (rect.bottom < 0 || rect.top > innerHeight) return;
  const travel = Math.max(1, track.offsetHeight - stage.offsetHeight);
  const top = parseFloat(getComputedStyle(stage).top) || 0;
  const progress = Math.max(0, Math.min(1, (top - rect.top) / travel));
  try { engine.draw(progress, finish); }
  catch (error) { console.warn('[fold]', error); fallback('render-failed'); }
}
function schedule() { if (engine && !pending && !stopped) pending = requestAnimationFrame(draw); }

async function start() {
  if (reduce.matches || navigator.connection?.saveData || ['2g', 'slow-2g'].includes(navigator.connection?.effectiveType)) {
    fallback('motion-preference'); return;
  }
  if (!navigator.gpu) { fallback('no-webgpu'); return; }
  reduce.addEventListener('change', event => { if (event.matches) fallback('reduced-motion'); }, { signal: events.signal });
  try {
    const { createStudy } = await import('./engine.js');
    if (stopped) return;
    engine = await createStudy(canvas, () => fallback('device-failed'));
    if (stopped) { engine.dispose(); return; }
    track.classList.add('is-live');
    engine.draw(0, finish);
    stage.dataset.state = 'ready';
    clearTimeout(deadline);
    window.addEventListener('scroll', schedule, { passive: true, signal: events.signal });
    window.addEventListener('resize', schedule, { passive: true, signal: events.signal });
    document.addEventListener('visibilitychange', schedule, { signal: events.signal });
    schedule();
  } catch (error) { console.warn('[fold]', error); fallback('initialization-failed'); }
}
window.addEventListener('pagehide', () => fallback('page-hidden'), { once: true });
void start();

// The comparison remains available even when the live renderer falls back.
const comparison = document.querySelector('.finish-range input');
comparison.addEventListener('input', () => {
  document.querySelector('.finish-compare').style.setProperty('--finish-split', `${comparison.value}%`);
  comparison.setAttribute('aria-valuetext', `${comparison.value}% champagne`);
});
