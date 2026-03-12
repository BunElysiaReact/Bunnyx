# bunnyx-test

> 🐰 Built with [Bunny](https://github.com/BunElysiaReact/bunny) — BertUI + Elysia in one server

## Quick Start

```bash
bun install
bun run dev        # → http://localhost:3000
```

## Commands

| Command          | Description                       |
|-----------------|-----------------------------------|
| `bun run dev`   | Development server + HMR          |
| `bun run build` | Production build → dist/          |
| `bun run start` | Start production server           |

## Structure

```
src/
├── index.ts           # Elysia entry (bun create elysia format)
├── api/
│   ├── users.ts       # /api/users routes
│   └── posts.ts       # /api/posts routes
├── api.ts             # Type-safe client (optional)
├── main.jsx           # BertUI entry
├── pages/             # File-based routing
│   ├── index.jsx      → /
│   ├── about.jsx      → /about
│   └── blog/
│       ├── index.jsx  → /blog
│       └── [slug].jsx → /blog/:slug
├── components/        # React components
└── styles/
    └── global.css
```

## Migrating existing apps

**From a BertUI app:** copy `src/pages`, `src/components`, `src/styles` as-is.
Move `bertui.config.js` settings into the `bertui` block in `bunnyx.config.ts`.

**From a `bun create elysia` app:** copy `src/index.ts` and `src/api/` as-is.
No changes needed.
