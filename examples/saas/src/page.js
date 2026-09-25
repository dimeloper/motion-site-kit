/**
 * Vortex page chrome. Loader, reveals, menu and anchors are shared in
 * ../../shared/page-chrome.js.
 */

import { initPageChrome } from '../../shared/page-chrome.js';
import { CONFIG } from '../config.js';

initPageChrome({ nav: CONFIG.nav, revealThreshold: 0.16 });
