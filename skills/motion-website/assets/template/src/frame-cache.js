/** Keep compressed frames in memory, with a bounded window of decoded images.
 * A single decoder reserves its slot before decoding, so peak live bitmap
 * memory also fits the budget. The latest target always takes priority over
 * speculative neighbours when the visitor changes scroll direction.
 */
export async function createFrameCache(blobs, {
  maxBytes = 128 * 1024 * 1024,
  decode = createImageBitmap,
  onFrame = () => {},
  onError = () => {},
} = {}) {
  if (!Array.isArray(blobs) || blobs.length === 0) throw new Error('Frame cache needs at least one image');
  if (!Number.isSafeInteger(maxBytes) || maxBytes <= 0) throw new Error('Invalid decoded frame budget');
  const first = await decode(blobs[0]);
  if (!Number.isInteger(first.width) || !Number.isInteger(first.height) || first.width <= 0 || first.height <= 0) {
    first.close();
    throw new Error('Invalid decoded frame dimensions');
  }
  const frameBytes = first.width * first.height * 4;
  const capacity = Math.min(blobs.length, Math.floor(maxBytes / frameBytes));
  if (!Number.isFinite(maxBytes) || capacity < Math.min(2, blobs.length)) {
    first.close();
    throw new Error('Decoded frame budget cannot hold two frames');
  }
  const cache = new Map([[0, first]]);
  let target = 0;
  let running = false;
  let disposed = false;

  function wanted() {
    const indices = [target];
    for (let distance = 1; indices.length < capacity; distance++) {
      if (target + distance < blobs.length) indices.push(target + distance);
      if (indices.length < capacity && target - distance >= 0) indices.push(target - distance);
    }
    return indices;
  }

  function dispose() {
    disposed = true;
    cache.forEach(bitmap => bitmap.close());
    cache.clear();
    blobs.length = 0;
  }

  async function pump() {
    if (running || disposed) return;
    running = true;
    try {
      while (!disposed) {
        const next = wanted().find(index => !cache.has(index));
        if (next === undefined) break;
        // Reserve room for the in-flight decode, not just the settled cache.
        if (cache.size >= capacity) {
          const farthest = [...cache.keys()].sort((a, b) => Math.abs(b - target) - Math.abs(a - target))[0];
          cache.get(farthest).close();
          cache.delete(farthest);
        }
        const bitmap = await decode(blobs[next]);
        if (disposed) { bitmap.close(); break; }
        if (bitmap.width * bitmap.height * 4 !== frameBytes) {
          bitmap.close();
          throw new Error('Frame dimensions changed within the sequence');
        }
        if (wanted().includes(next)) {
          cache.set(next, bitmap);
          onFrame(next);
        } else bitmap.close();
      }
    } catch (error) {
      dispose();
      onError(error);
    } finally { running = false; }
  }

  return {
    get: index => cache.get(index),
    request(index) {
      if (disposed) return;
      if (!Number.isFinite(index)) throw new Error('Frame index must be finite');
      target = Math.max(0, Math.min(blobs.length - 1, Math.round(index)));
      void pump();
    },
    dispose,
    get stats() { return { capacity, decodedBytes: cache.size * frameBytes, pending: running }; },
  };
}
