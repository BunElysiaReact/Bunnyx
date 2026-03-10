// bunnyx/src/server/bridge.ts

import { Elysia } from 'elysia';
import { join, extname } from 'path';
import { existsSync } from 'fs';
import type { ResolvedBunnyConfig } from '../types/index.ts';
import { logger } from '../utils/logger.ts';

import { serveHTML } from 'bertui/dev';
import { loadConfig as loadBertuiConfig } from 'bertui/config';

export async function createBridge(
  config:  ResolvedBunnyConfig,
  userApp: Elysia<any, any, any, any, any, any> | null,
  mode:    'dev' | 'production' = 'dev'
): Promise<Elysia<any, any, any, any, any, any>> {

  const root        = config.root;
  const port        = config.dev.port;
  const compiledDir = join(root, '.bertui', 'compiled');
  const stylesDir   = join(root, '.bertui', 'styles');
  const bunnyxDir   = join(root, 'bunnyx-api');
  const publicDir   = join(root, 'public');
  const srcDir      = join(root, 'src');

  const bertuiConfig = await loadBertuiConfig(root);
  const hasRouter    = existsSync(join(compiledDir, 'router.js'));

  const app = new Elysia();

  // ── 1. User's Elysia app ──────────────────────────────────────────────────
  if (userApp) app.use(userApp);

  // ── 2. HMR WebSocket ──────────────────────────────────────────────────────
  if (mode === 'dev') {
    app.ws('/__hmr', {
      open(ws)    { ws.subscribe('__hmr'); logger.dim('HMR client connected'); },
      close(ws)   { ws.unsubscribe('__hmr'); },
      message()   {},
    });
  }

  // ── 3. @bunnyx/api client ─────────────────────────────────────────────────
  app.get('/bunnyx-api/*', async ({ params, set }) => {
    const file = Bun.file(join(bunnyxDir, (params as any)['*']));
    if (!(await file.exists())) { set.status = 404; return 'Not found'; }
    set.headers['Content-Type']  = 'application/javascript; charset=utf-8';
    set.headers['Cache-Control'] = 'no-store';
    return file;
  });

  // ── 4. BertUI compiled JS ─────────────────────────────────────────────────
  app.get('/compiled/*', async ({ params, set }) => {
    const file = Bun.file(join(compiledDir, (params as any)['*']));
    if (!(await file.exists())) { set.status = 404; return 'Not found'; }
    set.headers['Content-Type']  = 'application/javascript; charset=utf-8';
    set.headers['Cache-Control'] = 'no-store';
    return file;
  });

  // ── 5. BertUI styles ──────────────────────────────────────────────────────
  app.get('/styles/*', async ({ params, set }) => {
    const file = Bun.file(join(stylesDir, (params as any)['*']));
    if (!(await file.exists())) { set.status = 404; return 'Not found'; }
    set.headers['Content-Type']  = 'text/css';
    set.headers['Cache-Control'] = 'no-store';
    return file;
  });

  // ── 6. Error overlay ──────────────────────────────────────────────────────
  app.get('/error-overlay.js', async ({ set }) => {
    const file = Bun.file(join(root, 'node_modules/bertui/error-overlay.js'));
    if (!(await file.exists())) { set.status = 404; return ''; }
    set.headers['Content-Type']  = 'application/javascript; charset=utf-8';
    set.headers['Cache-Control'] = 'no-store';
    return file;
  });

  // ── 7. Images ─────────────────────────────────────────────────────────────
  app.get('/images/*', async ({ params, set }) => {
    const filePath = join(srcDir, 'images', (params as any)['*']);
    const file = Bun.file(filePath);
    if (!(await file.exists())) { set.status = 404; return 'Not found'; }
    set.headers['Content-Type'] = imageContentType(extname(filePath).toLowerCase());
    return file;
  });

  // ── 8. node_modules ───────────────────────────────────────────────────────
  app.get('/node_modules/*', async ({ params, set }) => {
    const filePath = join(root, 'node_modules', (params as any)['*']);
    const file = Bun.file(filePath);
    if (!(await file.exists())) { set.status = 404; return 'Not found'; }
    const ext = extname(filePath).toLowerCase();
    set.headers['Content-Type'] = ext === '.css'
      ? 'text/css'
      : ['.js', '.mjs'].includes(ext) ? 'application/javascript; charset=utf-8' : 'text/plain';
    return file;
  });

  // ── 9. bertui-animate.css ────────────────────────────────────────────────
  app.get('/bertui-animate.css', async ({ set }) => {
    const file = Bun.file(join(root, 'node_modules/bertui-animate/dist/bertui-animate.min.css'));
    if (!(await file.exists())) { set.status = 404; return ''; }
    set.headers['Content-Type'] = 'text/css';
    return file;
  });

  // ── 10. Catch-all ─────────────────────────────────────────────────────────
  // Handles: SPA routes (/about, /blog/x), public static files (/favicon.svg), HTML
  app.get('*', async ({ request, set }) => {
    const url  = new URL(request.url);
    const slug = url.pathname.replace(/^\//, '');
    const ext  = extname(slug).toLowerCase();

    // Static file from /public ?
    if (ext) {
      const file = Bun.file(join(publicDir, slug));
      if (await file.exists()) {
        set.headers['Content-Type'] = staticContentType(ext);
        return file;
      }
      // Unknown static file — 404 rather than serving HTML
      set.status = 404;
      return 'Not found';
    }

    // SPA route — always serve HTML shell
    const html = await serveHTML(root, hasRouter, bertuiConfig, port);
    set.headers['Content-Type'] = 'text/html; charset=utf-8';
    return html;
  });

  return app;
}

function imageContentType(ext: string): string {
  return ({
    '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
    '.gif': 'image/gif',  '.svg': 'image/svg+xml', '.webp': 'image/webp',
    '.avif': 'image/avif', '.ico': 'image/x-icon',
  } as Record<string, string>)[ext] ?? 'application/octet-stream';
}

function staticContentType(ext: string): string {
  return ({
    '.svg': 'image/svg+xml', '.png': 'image/png',  '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',   '.ico': 'image/x-icon', '.txt': 'text/plain',
    '.xml': 'application/xml', '.json': 'application/json',
    '.gif': 'image/gif',     '.webp': 'image/webp',
  } as Record<string, string>)[ext] ?? 'application/octet-stream';
}