// bunnyx/src/dev/index.ts

import { join } from 'path';
import { watch, existsSync } from 'fs';
import type { ResolvedBunnyConfig } from '../types/index.ts';
import { logger } from '../utils/logger.ts';
import { loadElysiaServer, reloadElysiaServer } from '../server/loader.ts';
import { createBridge } from '../server/bridge.ts';
import { generateTypes, patchTsConfig } from '../typegen/index.ts';

import { compileProject }            from 'bertui/compiler';
import { compileLayouts }            from 'bertui/layouts';
import { compileLoadingComponents }  from 'bertui/loading';
import { analyzeRoutes }             from 'bertui/hydration';

const TOTAL_STEPS = 6;

// main.js content — uses named export { routes } from router.js
// NOT `import routes from './router.js'` which gives undefined (router has no default export)
const MAIN_JS = `import React from 'react';
import { createRoot } from 'react-dom/client';
import { Router, routes } from './router.js';

const root = createRoot(document.getElementById('root'));
root.render(React.createElement(Router, { routes }));
`;

export async function startDev(config: ResolvedBunnyConfig): Promise<void> {
  logger.banner();
  const { port } = config.dev;
  const root        = config.root;
  const compiledDir = join(root, '.bertui', 'compiled');

  try {
    // ── Step 1: Compile BertUI src/ ─────────────────────────────────────────
    process.stdout.write(`  [1/${TOTAL_STEPS}] Compiling BertUI...\r`);
    const { routes } = await compileProject(root);
    // Always write main.js after compile — bertui's compileProject may overwrite it
    await Bun.write(join(compiledDir, 'main.js'), MAIN_JS);
    console.log(`  [1/${TOTAL_STEPS}] \x1b[32m✓\x1b[0m  BertUI compiled   \x1b[90m${routes.length} routes\x1b[0m`);

    // ── Step 2: Layouts + Loading states ────────────────────────────────────
    process.stdout.write(`  [2/${TOTAL_STEPS}] Layouts & loading states...\r`);
    const layouts = await compileLayouts(root, compiledDir);
    await compileLoadingComponents(root, compiledDir);
    const layoutCount = Object.keys(layouts).length;
    console.log(`  [2/${TOTAL_STEPS}] \x1b[32m✓\x1b[0m  Layouts           \x1b[90m${layoutCount > 0 ? layoutCount + ' found' : 'none'}\x1b[0m`);

    // ── Step 3: Hydration analysis ───────────────────────────────────────────
    process.stdout.write(`  [3/${TOTAL_STEPS}] Analyzing routes...\r`);
    const analyzed = routes.length > 0
      ? await analyzeRoutes(routes)
      : { interactive: [], static: [] as any[] };
    console.log(`  [3/${TOTAL_STEPS}] \x1b[32m✓\x1b[0m  Hydration         \x1b[90m${analyzed.interactive.length} interactive · ${(analyzed as any).static?.length ?? 0} static\x1b[0m`);

    // ── Step 4: Load Elysia server ────────────────────────────────────────────
    process.stdout.write(`  [4/${TOTAL_STEPS}] Loading Elysia server...\r`);
    let userApp = await loadElysiaServer(config.server);
    console.log(`  [4/${TOTAL_STEPS}] \x1b[32m✓\x1b[0m  Elysia            \x1b[90m${userApp ? config.server.replace(root, '') : 'not found — API skipped'}\x1b[0m`);

    // ── Step 5: Generate @bunnyx/api types ──────────────────────────────────
    process.stdout.write(`  [5/${TOTAL_STEPS}] Generating types...\r`);
    await generateTypes(root, config.server);
    const patched = await patchTsConfig(root);
    console.log(
      `  [5/${TOTAL_STEPS}] \x1b[32m✓\x1b[0m  \x1b[1m@bunnyx/api\x1b[0m       \x1b[90m` +
      `bunnyx-env.d.ts · bunnyx-api/api-client.js${patched ? ' · tsconfig patched' : ''}\x1b[0m`
    );

    // ── Step 6: Start unified server ─────────────────────────────────────────
    process.stdout.write(`  [6/${TOTAL_STEPS}] Starting unified server...\r`);
    const bridge = await createBridge(config, userApp, 'dev');
    await bridge.listen(port);
    console.log(`  [6/${TOTAL_STEPS}] \x1b[32m✓\x1b[0m  Server started`);

    logger.ready(port);
    logger.dim(`BertUI pages     →  src/pages/`);
    logger.dim(`Elysia API       →  src/index.ts`);
    logger.dim(`Type-safe client →  import { api } from '@bunnyx/api'`);
    console.log('');

    // ── Watch src/ — bunnyx owns this, bridge has NO internal watcher ────────
    watchSrc(root, compiledDir, bridge);

    // ── Watch Elysia files ───────────────────────────────────────────────────
    watchElysiaFiles(root, config.server, async () => {
      userApp = await reloadElysiaServer(config.server);
      if (userApp) {
        await generateTypes(root, config.server);
        logger.success('Elysia reloaded  \x1b[90m(@bunnyx/api updated)\x1b[0m');
      }
    });

  } catch (err: any) {
    logger.error(`Dev server failed: ${err.message}`);
    if (err.stack) console.error(err.stack);
    process.exit(1);
  }
}

function watchSrc(root: string, compiledDir: string, bridge: any) {
  const srcDir = join(root, 'src');
  if (!existsSync(srcDir)) return;

  let debounce: Timer | null = null;
  let recompiling = false;

  watch(srcDir, { recursive: true }, async (_, filename) => {
    if (!filename?.match(/\.(jsx?|tsx?|css)$/)) return;
    if (debounce) clearTimeout(debounce);

    debounce = setTimeout(async () => {
      if (recompiling) return;
      recompiling = true;

      try {
        logger.dim(`changed: ${filename}`);
        broadcast(bridge, { type: 'recompiling' });

        await compileProject(root);
        // Re-write main.js — compileProject may overwrite it
        await Bun.write(join(compiledDir, 'main.js'), MAIN_JS);

        broadcast(bridge, { type: 'compiled' });
        setTimeout(() => broadcast(bridge, { type: 'reload' }), 100);
        logger.success('Recompiled');
      } catch (err: any) {
        logger.error(`Recompile failed: ${err.message}`);
        broadcast(bridge, {
          type: 'compilation-error',
          message: err.message,
          file: (err as any).file || filename,
          line: (err as any).line || null,
          column: (err as any).column || null,
        });
      } finally {
        recompiling = false;
      }
    }, 200);
  });
}

function broadcast(bridge: any, message: object) {
  try {
    bridge.server?.publish('__hmr', JSON.stringify(message));
  } catch {
    // no clients yet — fine
  }
}

function watchElysiaFiles(root: string, serverPath: string, onChanged: () => Promise<void>) {
  let debounce: Timer | null = null;

  function trigger(filename: string) {
    if (debounce) clearTimeout(debounce);
    logger.dim(`changed: ${filename}`);
    debounce = setTimeout(onChanged, 200);
  }

  if (existsSync(serverPath)) {
    watch(serverPath, (_, filename) => trigger(filename ?? serverPath));
  }

  const apiDir = join(root, 'src', 'api');
  if (existsSync(apiDir)) {
    watch(apiDir, { recursive: true }, (_, filename) => {
      if (filename?.match(/\.(ts|js)$/)) trigger(`api/${filename}`);
    });
  }
}