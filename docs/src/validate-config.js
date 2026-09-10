/** Validate author-supplied engine settings before fetching or allocating. */
export function validateMotionConfig(motion) {
  if (!motion || typeof motion !== 'object') throw new Error('motion config is required');
  const positive = ['scrollLengthVh', 'lenisDuration', 'maxDpr'];
  for (const key of positive) {
    if (!Number.isFinite(motion[key]) || motion[key] <= 0) {
      throw new Error(`motion.${key} must be a positive finite number`);
    }
  }
  if (!Number.isInteger(motion.concurrency) || motion.concurrency < 1 || motion.concurrency > 32) {
    throw new Error('motion.concurrency must be an integer from 1 to 32');
  }
  if (typeof motion.framesBase !== 'string' || !motion.framesBase.trim()) {
    throw new Error('motion.framesBase must be a nonempty path or URL');
  }
  if (typeof motion.scrub !== 'boolean' && (!Number.isFinite(motion.scrub) || motion.scrub < 0)) {
    throw new Error('motion.scrub must be a boolean or nonnegative finite number');
  }
  for (const key of ['loadTimeoutMs', 'maxDecodedBytes']) {
    if (motion[key] !== undefined && (!Number.isSafeInteger(motion[key]) || motion[key] <= 0)) {
      throw new Error(`motion.${key} must be a positive safe integer`);
    }
  }
}
