#!/usr/bin/env bun
// bunny/src/cli/index.ts

import { loadBunnyConfig } from '../config/index.ts';
import { startDev } from '../dev/index.ts';
import { runBuild } from '../build/index.ts';
import { logger } from '../utils/logger.ts';

async function main() {
  const args    = process.argv.slice(2);
  const command = args[0];
  const root    = process.cwd();

  // Parse --port flag
  const portIdx = args.findIndex(a => a === '--port' || a === '-p');
  const portOverride = portIdx !== -1 ? parseInt(args[portIdx + 1]) : null;

  const config = await loadBunnyConfig(root);

  if (portOverride) config.dev.port = portOverride;

  switch (command) {
    case 'dev':
    case undefined:
      await startDev(config);
      break;

    case 'build':
      await runBuild(config);
      break;

    case 'start': {
      // Production start — just run dist/start.js
      const { join } = await import('path');
      const { existsSync } = await import('fs');
      const startFile = join(root, config.build.outDir, 'start.js');
      if (!existsSync(startFile)) {
        logger.error(`No production build found. Run: bunnyx build`);
        process.exit(1);
      }
      await import(startFile);
      break;
    }

    case '--version':
    case '-v':
      console.log('bunnyx v1.0.0');
      break;

    case '--help':
    case '-h':
      showHelp();
      break;

    default:
      logger.error(`Unknown command: ${command}`);
      showHelp();
      process.exit(1);
  }
}

function showHelp() {
  console.log(`
  \x1b[1m🐰 Bunnyx CLI\x1b[0m  — BertUI + Elysia in one server

  \x1b[1mCommands:\x1b[0m
    bunnyx dev              Start development server
    bunnyx build            Build for production
    bunnyx start            Start production server (after build)

  \x1b[1mOptions:\x1b[0m
    --port, -p <number>    Override port (default: 3000)
    --version, -v          Show version
    --help, -h             Show this help

  \x1b[1mExamples:\x1b[0m
    bunnyx dev
    bunnyx dev --port 8080
    bunnyx build
    bunnyx start
  `);
}

main().catch(err => {
  logger.error(err.message);
  console.error(err.stack);
  process.exit(1);
});
