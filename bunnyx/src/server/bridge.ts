// bunnyx/src/server/bridge.ts
// THE CORE: One Elysia server that runs both BertUI and the user's Elysia app.
//
// Routing priority (top = highest):
//   1. User's Elysia app   → /api/*, any route they define
//   2. HMR WebSocket       → /__hmr
//   3. BertUI assets       → /compiled/*, /styles/*, /images/*, /public/*, /node_modules/*
//   4. BertUI pages        → * (catch-all, lowest priority)

import { Elysia } from 'elysia';
import { join, extname } from 'path';
import { existsSync } from 'fs';
import type { ResolvedBunnyConfig } from '../types/index.ts';
import { logger } from '../utils/logger.ts';

import { serveHTML, setupFileWatcher } from 'bertui/dev';
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
  const publicDir   = join(root, 'public');
  const srcDir      = join(root, 'src');

  const bertuiConfig = await loadBertuiConfig(root);
  const clients      = new Set<any>();

  let watcherCleanup: (() => void) | null = null;
  if (mode === 'dev') {
    watcherCleanup = setupFileWatcher(root, compiledDir, clients, async () => {});
  }

  const app = new Elysia();

  // ── 1. User's Elysia app ──────────────────────────────────────────────────
  if (userApp) app.use(userApp);

  // ── 2. HMR WebSocket ──────────────────────────────────────────────────────
  if (mode === 'dev') {
    app.ws('/__hmr', {
      open(ws)  { clients.add(ws); logger.dim(`HMR client connected (${clients.size} total)`); },
      close(ws) { clients.delete(ws); },
      message() {},
    });
  }

  // ── 3. BertUI compiled JS ─────────────────────────────────────────────────
  app.get('/compiled/*', async ({ params, set }) => {
    const file = Bun.file(join(compiledDir, (params as any)['*']));
    if (!(await file.exists())) { set.status = 404; return 'Not found'; }
    set.headers['Content-Type']  = 'application/javascript; charset=utf-8';
    set.headers['Cache-Control'] = 'no-store';
    return file;
  });

  // ── 4. BertUI styles ──────────────────────────────────────────────────────
  app.get('/styles/*', async ({ params, set }) => {
    const file = Bun.file(join(stylesDir, (params as any)['*']));
    if (!(await file.exists())) { set.status = 404; return 'Not found'; }
    set.headers['Content-Type']  = 'text/css';
    set.headers['Cache-Control'] = 'no-store';
    return file;
  });

  // ── 5. Error overlay ──────────────────────────────────────────────────────
  app.get('/error-overlay.js', async ({ set }) => {
    const file = Bun.file(join(root, 'node_modules/bertui/error-overlay.js'));
    if (!(await file.exists())) { set.status = 404; return ''; }
    set.headers['Content-Type']  = 'application/javascript; charset=utf-8';
    set.headers['Cache-Control'] = 'no-store';
    return file;
  });

  // ── 6. Images ─────────────────────────────────────────────────────────────
  app.get('/images/*', async ({ params, set }) => {
    const filePath = join(srcDir, 'images', (params as any)['*']);
    const file = Bun.file(filePath);
    if (!(await file.exists())) { set.status = 404; return 'Not found'; }
    set.headers['Content-Type'] = imageContentType(extname(filePath).toLowerCase());
    return file;
  });

  // ── 7. Public directory ───────────────────────────────────────────────────
  app.get('/public/*', async ({ params, set }) => {
    const file = Bun.file(join(publicDir, (params as any)['*']));
    if (!(await file.exists())) { set.status = 404; return 'Not found'; }
    return file;
  });

  // Root-level public files — /favicon.svg, /robots.txt etc.
  app.get('/*', async ({ params, set }, next) => {
    const slug = (params as any)['*'] as string;
    if (!slug?.includes('.')) return (next as any)?.();
    const file = Bun.file(join(publicDir, slug));
    if (!(await file.exists())) return (next as any)?.();
    set.headers['Content-Type'] = staticContentType(extname(slug).toLowerCase());
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

  // ── 9. bertui-animate.css ─────────────────────────────────────────────────
  app.get('/bertui-animate.css', async ({ set }) => {
    const file = Bun.file(join(root, 'node_modules/bertui-animate/dist/bertui-animate.min.css'));
    if (!(await file.exists())) { set.status = 404; return ''; }
    set.headers['Content-Type'] = 'text/css';
    return file;
  });

  // ── 10. Catch-all → BertUI page renderer ──────────────────────────────────
  const hasRouter = existsSync(join(compiledDir, 'router.js'));
  app.get('*', async ({ set }) => {
    const html = await serveHTML(root, hasRouter, bertuiConfig, port);
    set.headers['Content-Type'] = 'text/html';
    return html;
  });

  if (watcherCleanup) {
    process.on('exit',   watcherCleanup);
    process.on('SIGINT', () => { watcherCleanup?.(); process.exit(0); });
  }

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
