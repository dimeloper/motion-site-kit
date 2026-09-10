import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
const modules = fileURLToPath(new URL('./node_modules', import.meta.url));

/** Local test server; replaces pinned CDN modules with the matching npm files. */
export async function startLocalServer(docs) {
  const mime = { '.js': 'text/javascript', '.mjs': 'text/javascript', '.html': 'text/html',
    '.css': 'text/css', '.png': 'image/png', '.json': 'application/json', '.avif': 'image/avif', '.webp': 'image/webp' };
  const server = createServer(async (req, res) => {
    try {
      const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
      const vendor = pathname.startsWith('/vendor/');
      const base = vendor ? modules : docs;
      const path = resolve(base, '.' + (vendor ? pathname.slice(7) : pathname === '/' ? '/index.html' : pathname));
      if (!path.startsWith(base + sep)) { res.writeHead(403).end(); return; }
      let content = await readFile(path);
      if (extname(path) === '.html') {
        content = content.toString()
          .replaceAll('https://esm.sh/gsap@3.15.0/ScrollTrigger', '/vendor/gsap/ScrollTrigger.js')
          .replaceAll('https://esm.sh/gsap@3.15.0', '/vendor/gsap/index.js')
          .replaceAll('https://esm.sh/lenis@1.3.26', '/vendor/lenis/dist/lenis.mjs')
          .replaceAll('https://esm.sh/three@0.170.0/examples/jsm/', '/vendor/three/examples/jsm/')
          .replaceAll('https://esm.sh/three@0.170.0', '/vendor/three/build/three.module.js');
      }
      res.writeHead(200, { 'Content-Type': mime[extname(path)] ?? 'application/octet-stream' });
      res.end(content);
    } catch { res.writeHead(404).end(); }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const url = `http://127.0.0.1:${server.address().port}`;
  return { server, url };
}
