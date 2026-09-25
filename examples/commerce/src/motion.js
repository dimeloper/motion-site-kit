/**
 * Halo: two rings of light lift off a textured stone as the visitor scrolls.
 * The stone stays put. Runtime, fallbacks and pinning are shared with the
 * other WebGL examples in ../../shared/hero.js.
 */

import { startWebGLHero } from '../../shared/hero.js';
import { CONFIG } from '../config.js?v=12';
import { createHaloScene } from './scene.js?v=12';

export const initMotion = startWebGLHero({ config: CONFIG, createScene: createHaloScene, label: 'halo' });
