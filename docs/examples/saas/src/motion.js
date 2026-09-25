/**
 * Vortex: a CAD titanium band whose particle halo peels off and reseats as the
 * visitor scrolls. Runtime, fallbacks and pinning are shared with the other
 * WebGL examples in ../../shared/hero.js.
 */

import { startWebGLHero } from '../../shared/hero.js';
import { CONFIG } from '../config.js';
import { createVortexScene } from './scene.js?v=39';

export const initMotion = startWebGLHero({ config: CONFIG, createScene: createVortexScene, label: 'vortex' });
