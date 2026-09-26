/**
 * Harbor Oven: a sculptural loaf orbits as the visitor scrolls, with flour
 * motes drifting on their own clock. Runtime, fallbacks and pinning are shared
 * with the other WebGL examples in ../../shared/hero.js.
 */

import { startWebGLHero } from '../../shared/hero.js';
import { CONFIG } from '../config.js';
import { createHarborScene } from './scene.js?v=18';

export const initMotion = startWebGLHero({ config: CONFIG, createScene: createHarborScene, label: 'harbor' });
