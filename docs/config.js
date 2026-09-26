/**
 * Frame runtime settings for the docs landing page.
 *
 * The page's copy and chrome are written directly in index.html, so only the
 * engine block is read. The engine itself is a copy of the template's, kept in
 * sync by scripts/sync_engine.py.
 */

export const CONFIG = {
  motion: {
    framesBase: 'frames',
    scrollLengthVh: 3.5,
    scrub: 0.5,
    lenisDuration: 1.1,
    concurrency: 8,

    // Bound loader ownership when a server never finishes a request.
    loadTimeoutMs: 30000,

    // RGBA bitmap ceiling, including the frame being decoded.
    // 128 MiB holds about 23 frames at 1600×900; compressed frames stay cached.
    maxDecodedBytes: 128 * 1024 * 1024,
    maxDpr: 2,
  },
};
