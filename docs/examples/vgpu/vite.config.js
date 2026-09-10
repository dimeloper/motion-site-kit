import { defineConfig } from 'vite';
import { wgslVitePlugin } from '@vgpu/wgsl/loader-vite';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  root: fileURLToPath(new URL('./source', import.meta.url)),
  base: './',
  plugins: [wgslVitePlugin()],
  build: { outDir: '../demo', emptyOutDir: true },
});
