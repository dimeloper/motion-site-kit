/**
 * Halo page chrome. Loader, menu and anchors are shared in
 * ../../shared/page-chrome.js. Halo's sections come from the page kit, which
 * owns its own reveals, so the shared .reveal observer is off.
 */

import { initPageChrome } from '../../shared/page-chrome.js';
import { CONFIG } from '../config.js?v=12';

initPageChrome({ nav: CONFIG.nav, revealThreshold: null });
