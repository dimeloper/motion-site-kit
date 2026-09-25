/** Own one hero's callbacks and resources, including late scene completion. */
export function createLifecycle(root, canvas, fallback, timeoutMs = 30000) {
  const controller = new AbortController();
  const cleanups = [];
  let active = true;
  const timer = setTimeout(() => stop('load-timeout'), timeoutMs);
  function stop(reason) {
    if (!active) return;
    active = false;
    clearTimeout(timer);
    for (const cleanup of cleanups.reverse()) {
      try { cleanup(); } catch (error) { console.warn('[motion] cleanup failed', error); }
    }
    controller.abort();
    canvas.classList.remove('is-ready');
    fallback(root, reason);
  }
  function own(cleanup) {
    if (active) cleanups.push(cleanup);
    else cleanup();
  }
  // No preventDefault: that asks the browser to restore the context, and the
  // examples never rebuild a scene in place. They fall back to the poster.
  canvas.addEventListener('webglcontextlost', () => stop('context-lost'), { signal: controller.signal });
  window.addEventListener('pagehide', () => stop('page-hidden'), { signal: controller.signal });
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  motion.addEventListener('change', event => { if (event.matches) stop('reduced-motion'); }, { signal: controller.signal });
  return {
    get active() { return active; },
    signal: controller.signal,
    stop,
    own,
    attach(scene) {
      own(() => scene.dispose());
      if (!active) return false;
      let visible = true;
      const update = () => scene.setActive(visible && !document.hidden);
      const observer = new IntersectionObserver(entries => {
        // A busy main thread can batch several crossings for the same target.
        // The last entry describes its current visibility, not the first one.
        for (const entry of entries) {
          if (entry.target === root) visible = entry.isIntersecting;
        }
        update();
      });
      observer.observe(root);
      own(() => observer.disconnect());
      document.addEventListener('visibilitychange', update, { signal: controller.signal });
      update();
      return true;
    },
    ready() { clearTimeout(timer); },
  };
}

/** Dispose shared GPU resources once, including GLB material textures. */
export function disposeTree(scene) {
  const resources = new Set();
  if (scene.environment?.isTexture) resources.add(scene.environment);
  if (scene.background?.isTexture) resources.add(scene.background);
  scene.traverse(object => {
    if (object.geometry) resources.add(object.geometry);
    for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
      if (!material) continue;
      resources.add(material);
      for (const value of Object.values(material)) if (value?.isTexture) resources.add(value);
      for (const uniform of Object.values(material.uniforms ?? {})) {
        if (uniform.value?.isTexture) resources.add(uniform.value);
      }
    }
  });
  const images = new Set();
  resources.forEach(resource => {
    if (resource.isTexture && typeof resource.image?.close === 'function') images.add(resource.image);
    resource.dispose();
  });
  images.forEach(image => image.close());
}

/**
 * Free everything a scene's renderer allocated, in the order three.js needs.
 *
 * renderer.dispose() does not free render targets or textures it uploaded.
 * The PMREM result is a render target, so disposing only its texture leaves a
 * framebuffer behind; the rect-area light lookup textures are shared globals
 * that every new renderer uploads again. On a bfcache restore the next scene
 * reuses the same canvas and context, so anything missed here accumulates.
 */
export function releaseRenderer({ renderer, scene, pmrem, envScene, envTarget, lookupTextures = [] }) {
  disposeTree(scene);
  if (envScene) disposeTree(envScene);
  envTarget?.dispose();
  pmrem?.dispose();
  for (const texture of lookupTextures) texture?.dispose();
  renderer.dispose();
}

export async function loadGlb(loader, url, signal) {
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`Model request failed: ${response.status}`);
  const data = await response.arrayBuffer();
  signal?.throwIfAborted();
  const gltf = await loader.parseAsync(data, new URL('.', new URL(url, location.href)).href);
  if (signal?.aborted) {
    disposeTree(gltf.scene);
    signal.throwIfAborted();
  }
  return gltf;
}

/**
 * Decide when a scene submits GPU work.
 *
 * On demand (the default), a draw happens only when something changed: scroll
 * progress, a resize, a tween, or the hero becoming visible again. A scene
 * whose shader animates on its own clock passes `continuous: true` and draws
 * every frame while visible. Either way nothing is drawn while the hero is
 * offscreen or the tab is hidden, which is most of a phone's battery budget.
 */
export function createFrameDriver(draw, { continuous = false } = {}) {
  let active = true;
  let disposed = false;
  let rafId = 0;
  const tick = () => {
    rafId = 0;
    if (!active || disposed) return;
    draw();
    if (continuous) rafId = requestAnimationFrame(tick);
  };
  const schedule = () => {
    if (!rafId && active && !disposed) rafId = requestAnimationFrame(tick);
  };
  schedule();
  return {
    /** Draw now. A continuous driver picks the change up on its next frame instead. */
    draw() {
      if (!active || disposed) return;
      if (continuous) schedule();
      else draw();
    },
    /** Draw once on the next animation frame, coalescing repeated calls. */
    invalidate: schedule,
    setActive(value) {
      if (disposed || value === active) return;
      active = value;
      if (active) schedule();
      else {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
    },
    dispose() {
      disposed = true;
      active = false;
      cancelAnimationFrame(rafId);
      rafId = 0;
    },
  };
}
