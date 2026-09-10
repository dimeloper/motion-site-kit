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
  canvas.addEventListener('webglcontextlost', event => {
    event.preventDefault();
    stop('context-lost');
  }, { signal: controller.signal });
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
      const observer = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; update(); });
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
