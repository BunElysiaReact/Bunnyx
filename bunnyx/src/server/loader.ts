// bunny/src/server/loader.ts
// Loads the user's Elysia server entry — handles `bun create elysia` format exactly.
//
// KEY BEHAVIOUR:
// `bun create elysia` generates src/index.ts with `.listen(3000)` at the bottom.
// When Bunny imports this file, that .listen() fires and Elysia starts on its own port.
// Bunny then grabs the `export default app` instance and mounts it via .use() —
// so the routes, plugins, guards are all extracted without re-listening.
// The orphan server spun up by .listen() is stopped immediately.

import { existsSync } from 'fs';
import type { Elysia } from 'elysia';
import type { ElysiaServerModule } from '../types/index.ts';
import { logger } from '../utils/logger.ts';

export async function loadElysiaServer(
  serverPath: string
): Promise<Elysia<any, any, any, any, any, any> | null> {

  if (!existsSync(serverPath)) {
    logger.warn(`No server file found at: ${serverPath}`);
    logger.dim('Tip: create src/index.ts with `export default app`');
    return null;
  }

  try {
    // Cache-bust so hot-reload works — each load gets a fresh module
    const mod = await import(`${serverPath}?t=${Date.now()}`) as ElysiaServerModule;

    if (!mod.default) {
      logger.error(`${serverPath} must have: export default app`);
      logger.dim('Example: const app = new Elysia(); export default app;');
      return null;
    }

    const app = mod.default as any;

    // Stop the orphan server that .listen() started inside the user's file
    // Bunny will re-listen on the correct port via bridge.listen()
    if (app.server) {
      try {
        app.server.stop();
        logger.dim('Stopped orphan .listen() from src/index.ts');
      } catch {
        // Already stopped or never started — fine
      }
    }

    // Validate it's an Elysia instance by checking for known methods
    const isElysia = typeof app.use   === 'function' &&
                     typeof app.get   === 'function' &&
                     typeof app.post  === 'function';

    if (!isElysia) {
      logger.error(`Default export from ${serverPath} is not an Elysia instance`);
      return null;
    }

    logger.success(`Elysia server loaded  ${countRoutes(app)} routes`);
    return app;

  } catch (err: any) {
    logger.error(`Failed to load ${serverPath}: ${err.message}`);
    if (err.stack) {
      logger.dim(err.stack.split('\n').slice(1, 4).join('\n'));
    }
    return null;
  }
}

export async function reloadElysiaServer(
  serverPath: string
): Promise<Elysia<any, any, any, any, any, any> | null> {
  logger.step('Reloading Elysia server...');
  return loadElysiaServer(serverPath);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function countRoutes(app: any): string {
  try {
    const routes = app.routes?.length ?? 0;
    return routes > 0 ? `(${routes} routes)` : '';
  } catch {
    return '';
  }
}

