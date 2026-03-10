// bunny/index.ts — Public API

// Config types
export type {
  BunnyConfig,
  BertuiBridgeConfig,
  ResolvedBunnyConfig,
  BunnyDevServer,
  BunnyBuildResult,
  ElysiaServerModule,
} from './src/types/index.ts';

// Config loader (for programmatic use)
export { loadBunnyConfig } from './src/config/index.ts';

// Dev + build (for programmatic use)
export { startDev }  from './src/dev/index.ts';
export { runBuild }  from './src/build/index.ts';

// Bridge (advanced: build your own server)
export { createBridge } from './src/server/bridge.ts';

// Type generator
export { generateTypes, patchTsConfig } from './src/typegen/index.ts';

// API client helper
export { createApiClient } from './src/client/index.ts';
