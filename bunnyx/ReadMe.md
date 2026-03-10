# 🐰 Bunnyx

> Stop fighting your framework and start building your app.

**Bunnyx** is the invisible bridge between the fastest HTTP server ([Elysia](https://elysiajs.com)) and the most direct UI framework ([BertUI](https://github.com/BunElysiaReact/BERTUI)).

![version](https://img.shields.io/badge/version-v0.1.0--beta-orange) ![license](https://img.shields.io/badge/license-MIT-blue) ![bun](https://img.shields.io/badge/runtime-bun-black)

> ⚠️ **Beta Release** — Testing was not done that much. Things may break. Feedback and issues welcome.

---

## Why Bunnyx?

Most full-stack setups make you fight: CORS configs, Vite proxies, separate ports, separate deploys, type mismatches between frontend and backend. Bunnyx removes all of that.

**One server. One port. One command.**

Your Elysia API and BertUI pages run together — no glue code, no config overhead. That's what "zero abstraction" means: Bunnyx doesn't wrap your tools or invent new concepts. It just wires them together and gets out of the way.

- Your Elysia app is still a normal Elysia app.
- Your React pages are still normal React.
- Nothing is locked in.

> 📝 You will see **BertUI** referenced in logs, folders (`.bertui/`), and config. That's expected — Bunnyx inherits BertUI's full frontend capabilities. BertUI handles compilation, routing, HMR, and CSS. Bunnyx adds Elysia and the type bridge on top.

---

## Quick Start

Full-stack Hello World in ~10 lines:

```ts
// src/index.ts
import { Elysia } from 'elysia';
export const App = new Elysia().get('/api/hello', () => ({ message: 'Hello from Elysia!' }));
```

```jsx
// src/pages/index.jsx
import { useState, useEffect } from 'react';

export default function Home() {
  const [msg, setMsg] = useState('...');
  useEffect(() => {
    fetch('/api/hello').then(r => r.json()).then(d => setMsg(d.message));
  }, []);
  return <h1>{msg}</h1>;
}
```

```bash
bun run dev   # → http://localhost:3000
```

That's it. Full-stack, one port, zero config.

---

## Installation

```bash
bun add bunnyx bertui
```

Or scaffold a new project:

```bash
bunx create-bunnyx my-app
cd my-app
bun run dev
```

---

## Features

### Zero-Abstraction Core
- **No vendor lock-in** — Your Elysia API is a standard Elysia app. Move it, scale it, or deploy it standalone whenever you want.
- **Pure React/JSX** — Use standard React patterns in `src/pages/`. No Bunnyx-specific hooks required.

### Unified Dev Experience
- **Single-port harmony** — Frontend and backend on the same port. No CORS issues. No Vite proxy configs.
- **Instant HMR** — Save any file in `src/` and the browser refreshes in milliseconds.
- **Auto-orchestration** — Bunnyx detects and stops orphan server listeners, preventing `address already in use` errors during development.

### `@bunnyx/api` Type Bridge
- **Ambient type generation** — Auto-generates `bunnyx-env.d.ts` so your IDE knows your API routes exist without running any commands.
- **Eden-powered client** — Uses the official `@elysiajs/eden` under the hood. Full autocomplete, type safety, and WebSocket support out of the box.
- **Path intelligence** — The client auto-detects browser vs server and adjusts `baseUrl` accordingly.

```ts
import { api } from '@bunnyx/api';
const { data } = await api.api.hello.get(); // fully typed ✅
```

### File-Based Routing *(BertUI-Powered)*
- **Intuitive paths** — `src/pages/blog/[slug].jsx` → `/blog/:slug`. Just drop files.
- **Smart hydration** — Automatically identifies interactive vs static components to keep the bundle lean and SEO strong.

### Production Ready
- **Single-file build** — `bun run build` compiles your entire full-stack app into `dist/`.
- **Simplified deployment** — Run everything with one command: `bun dist/start.js`. Works with Docker, Railway, any VPS.

---

## Project Structure

```
my-app/
├── src/
│   ├── pages/        ← JSX pages (auto-routed by BertUI)
│   ├── api/          ← Elysia route files
│   ├── styles/       ← CSS files
│   └── index.ts      ← Elysia entry (must export App)
├── public/           ← Static files
├── bunnyx.config.ts  ← Config
└── bunnyx-api/       ← Auto-generated client (do not edit)
```

---

## API Routes + Logging

```ts
// src/index.ts
import { Elysia } from 'elysia';
import { postsRoutes } from './api/posts';

const logger = new Elysia({ name: 'logger' })
  .derive(() => ({ _start: Date.now() }))
  .onAfterHandle({ as: 'global' }, ({ request, set, _start }) => {
    const status = (set.status as number) || 200;
    const ms = Date.now() - _start;
    console.log(`  ${status}  ${request.method}  ${new URL(request.url).pathname}  ${ms}ms`);
  });

export const App = new Elysia()
  .use(logger)
  .use(postsRoutes);
```

---

## Deployment

```bash
bun run build       # outputs to dist/
bun dist/start.js   # runs the full app
```

Set the `PORT` environment variable to change the port in production.

---

## Programmatic API

```ts
import { startDev, createBridge, generateTypes } from 'bunnyx';
```

---

## Beta Notes

- ⚠️ Testing was not done that much. This is a happy beta release.
- No visual error overlay — check the browser console for errors.
- Windows support is untested.
- Plugins like Elysia Swagger, authentication (Lucia/Auth.js), and tRPC should work — but haven't been tested with the bridge yet. Try it and report back.

---

## License

MIT · Made with 🐰 by [PeaseErnest](https://github.com/BunElysiaReact/BERTUI)