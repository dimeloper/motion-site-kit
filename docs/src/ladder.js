/**
 * Pure helpers for reading a frame ladder. No DOM, GSAP or network access, so
 * the rules that decide what a visitor downloads can be unit tested directly.
 */

/**
 * Upper bound on frames the runtime will accept from a manifest.
 *
 * This is a sanity bound against a corrupt or hostile manifest, not the
 * performance budget. The budget (frameCountMax in motion.config.json) is
 * enforced at build time by check_budget.py, where a breach fails CI with a
 * cut-list. Tying the runtime to that number would turn a raised budget into
 * a silent poster fallback in production.
 */
export const MAX_FRAMES = 1000;

/** Throw unless the manifest is one the engine can load without guessing. */
export function validateManifest(manifest) {
  const ok = manifest && typeof manifest === 'object' &&
    Number.isInteger(manifest.count) && manifest.count >= 1 && manifest.count <= MAX_FRAMES &&
    Array.isArray(manifest.widths) && manifest.widths.length > 0 &&
    manifest.widths.every((w, i, all) => Number.isInteger(w) && w > 0 && (i === 0 || w > all[i - 1])) &&
    Array.isArray(manifest.formats) && manifest.formats.length > 0 &&
    manifest.formats.every((f) => f === 'avif' || f === 'webp') &&
    Number.isInteger(manifest.padding) && manifest.padding >= 1 && manifest.padding <= 12;
  if (!ok) throw new Error('Invalid frame manifest');
  return manifest;
}

/**
 * Choose the narrowest rung that covers the viewport width at the capped DPR.
 *
 * Width, not area: a 16:9 frame drawn with cover semantics into a portrait
 * phone is upscaled whichever rung is chosen, so selecting by covered height
 * would send phones the 1600 rung for a crop they see a quarter of. A 390px
 * phone at 2x asks for 780px and receives 960; 1x and 1.5x small screens
 * receive 640. The phone budget in motion.config.json covers both rungs.
 */
export function pickWidth(widths, viewportWidth, dpr = 1, maxDpr = 2) {
  const ratio = Math.min(Math.max(Number.isFinite(dpr) ? dpr : 1, 1), maxDpr);
  const target = viewportWidth * ratio;
  return widths.find((w) => w >= target) ?? widths.at(-1);
}

export function frameUrl(manifest, base, width, format, index) {
  const padded = String(index).padStart(manifest.padding, '0');
  return `${base}/${width}/${format}/${padded}.${format}`;
}
