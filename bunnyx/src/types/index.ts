// bunnyx/src/types/index.ts

import type { Elysia } from 'elysia';

// ─── Bunny Config ────────────────────────────────────────────────────────────

export interface BunnyConfig {
  /**
   * Path to your Elysia server entry file.
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

  /**
   * Paths that Elysia owns but don't start with /api/.
   * Bunnyx will not serve the HTML shell for these — Elysia handles them directly.
   * 
   * @example
   * // bunnyx.config.ts
   * export default {
   *   bypass: ['reference', 'swagger', 'scalar']
   * }
   * 
   * This allows @elysiajs/openapi's /reference route to work correctly.
   */
  bypass?: string[];
}

// ─── BertUI passthrough ───────────────────────────────────────────────────────

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
  baseUrl?:   string;
  importhow?: Record<string, string>;
  meta?:      BertuiMetaConfig;
  appShell?:  BertuiAppShellConfig;
  robots?:    BertuiRobotsConfig;
  siteName?:  string;
}

// ─── Resolved / internal ─────────────────────────────────────────────────────

export interface ResolvedBunnyConfig {
  server: string;
  bertui: BertuiBridgeConfig;
  dev:    Required<NonNullable<BunnyConfig['dev']>>;
  build:  Required<NonNullable<BunnyConfig['build']>>;
  root:   string;
  bypass: string[]; // ← added
}

// ─── Server module shape ──────────────────────────────────────────────────────

export interface ElysiaServerModule {
  default: Elysia<any, any, any, any, any, any>;
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