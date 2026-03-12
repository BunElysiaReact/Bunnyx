import type { BunnyConfig } from 'bunnyx';

export default {
  // Elysia entry — exact format from `bun create elysia`
  server: './src/index.ts',

  // BertUI config — same fields as bertui.config.js, passed through directly
  bertui: {
    baseUrl: 'http://localhost:3000',
    siteName: 'bunnyx-test',
    importhow: {
      
      // Add import aliases here — same as bertui importhow
      // components: './src/components',
      // ui: './src/components/ui',
    },
    meta: {
      title: 'bunnyx-test',
      description: 'Built with Bunnyxxx — BertUI + Elysia',
      lang: 'en',
    },
  },

  dev:   { port: 3000 },
  build: { outDir: 'dist' },
} satisfies BunnyConfig;
