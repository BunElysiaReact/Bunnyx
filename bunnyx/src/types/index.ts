// bunny/src/types/index.ts

import type { Elysia } from 'elysia';

// ─── Bunny Config ────────────────────────────────────────────────────────────

export interface BunnyConfig {
  /**
   * Path to your Elysia server entry file.
   * Matches the exact format from `bun create elysia` → src/index.ts
   * Default: './src/index.ts'
   */
  server?: string;

  /** Full BertUI config passthrough — same fields as bertui.config.js */
  bertui?: BertuiBridgeConfig;

  /** Dev server settings */
  dev?: {
    port?: number;
    host?: string;
  };

  /** Build output settings */
  build?: {
    outDir?: string;
  };
}

// ─── BertUI passthrough — mirrors bertui.config.js exactly ───────────────────

export interface BertuiMetaConfig {
  title?: string;
  description?: string;
  keywords?: string;
  author?: string;
  themeColor?: string;
  lang?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
}

export interface BertuiAppShellConfig {
  loading?: boolean;
  loadingText?: string;
  backgroundColor?: string;
}

export interface BertuiRobotsConfig {
  disallow?: string[];
  crawlDelay?: number | null;
}

export interface BertuiBridgeConfig {
  /** Base URL for sitemap + robots.txt (e.g. 'https://myapp.com') */
  baseUrl?: string;

  /**
   * Alias imports — same as bertui.config.js importhow
   * @example { components: './src/components', ui: './src/components/ui' }
   */
  importhow?: Record<string, string>;

  /** Page meta defaults */
  meta?: BertuiMetaConfig;

  /** App shell / loading screen config */
  appShell?: BertuiAppShellConfig;

  /** robots.txt config */
  robots?: BertuiRobotsConfig;

  /** Site name */
  siteName?: string;
}

// ─── Resolved / internal ─────────────────────────────────────────────────────

export interface ResolvedBunnyConfig {
  /** Absolute path to Elysia server entry (e.g. /project/src/index.ts) */
  server: string;
  /** Merged BertUI config — written as bertui.config.js at build time */
  bertui: BertuiBridgeConfig;
  dev:    Required<NonNullable<BunnyConfig['dev']>>;
  build:  Required<NonNullable<BunnyConfig['build']>>;
  /** Absolute project root */
  root:   string;
}

// ─── Server module shape ──────────────────────────────────────────────────────

export interface ElysiaServerModule {
  /** The Elysia app instance — from `export default app` */
  default: Elysia<any, any, any, any, any, any>;
  /** Optional type export — from `export type App = typeof app` */
  App?: unknown;
}

// ─── Dev server result ────────────────────────────────────────────────────────

export interface BunnyDevServer {
  port: number;
  url:  string;
  stop: () => void;
}

// ─── Build result ─────────────────────────────────────────────────────────────

export interface BunnyBuildResult {
  success:  boolean;
  outDir:   string;
  duration: number;
}
