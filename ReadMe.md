# 🐰 Bunnyx

> Full-stack Bun app. One port. One command.

No CORS configs. No Vite proxies. No separate dev servers. No type mismatches between your API and your UI.

**Just write your backend. Write your frontend. Run one command. It works.**

![version](https://img.shields.io/badge/version-v0.1.0--beta-orange) ![license](https://img.shields.io/badge/license-MIT-blue) ![bun](https://img.shields.io/badge/runtime-bun-black)

> ⚠️ **Beta Release** — Docs website is on the way. Testing is undergoing. Feedback and issues welcome.

---

## The Problem

Every full-stack setup makes you fight before you can build:

- Two dev servers, two ports, CORS errors on day one
- Vite proxy configs just to call your own API
- Type your response in the backend, type it again in the frontend
- Deploy two separate things and pray they talk to each other

Bunnyx removes all of that.

---

## The Solution

```bash
bun run dev   # one command → http://localhost:3000
```

Your Elysia API and React pages on the same port. Your backend types automatically available in your frontend. No glue code. No config overhead.

- **Your Elysia app is still a normal Elysia app**
- **Your React pages are still normal React**
- **Nothing is locked in**

---

## Quick Start

```ts
// src/index.ts
import { Elysia } from 'elysia'

const app = new Elysia()
  .get('/api/hello', () => ({ message: 'Hello from Elysia!' }))

export type App = typeof app
export default app
```

```jsx
// src/pages/index.jsx
import { useState, useEffect } from 'react'
import { api } from '../bunnyx-api/api-client'

export default function Home() {
  const [msg, setMsg] = useState('...')

  useEffect(() => {
    api.api.hello.get().then(({ data }) => setMsg(data.message))
  }, [])

  return <h1>{msg}</h1>
}
```

That's it. Type-safe, full-stack, one port.

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

### One Server, Zero Config
- Frontend and backend on the same port — CORS is a non-issue
- No proxy configs, no environment variables for API URLs
- `bun run dev` starts everything

### Type-Safe API Client — Auto Generated
Bunnyx reads your Elysia routes and generates a fully typed client at `bunnyx-api/api-client.ts` every time you run dev. Your IDE knows every route, every parameter, every response shape.

```ts
import { api } from '../bunnyx-api/api-client'

// full autocomplete ✅ — no manual types needed
api.api.users.get()
api.api.users({ id: 5 }).get()
api.api.users.post({ body: { name: 'Pease', age: 20 } })
```

### Instant HMR
Save any file in `src/` — browser updates in milliseconds.

### File-Based Routing
Drop a file in `src/pages/` — it becomes a route. `blog/[slug].jsx` → `/blog/:slug`. No config.

### Production Build
```bash
bun run build     # compiles everything to dist/
bun dist/start.js # runs the full app — frontend + backend, one process
```

---

## Project Structure

```
my-app/
├── src/
│   ├── pages/        ← React pages (auto-routed)
│   ├── api/          ← Elysia route files
│   ├── styles/       ← CSS files
│   └── index.ts      ← Elysia entry
├── public/           ← Static files
├── bunnyx.config.ts  ← Config
└── bunnyx-api/       ← Auto-generated typed client (do not edit)
```

---

## Setting Up Your Elysia Server

**Every route file must be registered in `src/index.ts` before it's available in the type-safe client.**

```ts
// src/index.ts
import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { usersRoutes } from './api/users'
import { postsRoutes } from './api/posts'

const app = new Elysia()
  .use(cors())
  .use(usersRoutes)
  .use(postsRoutes)

// Both exports required — do not remove
export type App = typeof app  // powers the type-safe client
export default app            // Bunnyx mounts this
```

> ⚠️ **Do not call `.listen()` in `src/index.ts`** — Bunnyx handles that.

> ⚠️ **Routes not added to `src/index.ts` won't appear in autocomplete** — always register every route file here first.

---

## Using the Type-Safe Client

Import directly from the generated file — adjust the relative path based on where your component lives:

```ts
import { api } from '../../bunnyx-api/api-client' // from src/pages/
import { api } from '../bunnyx-api/api-client'     // from src/
```

Eden Treaty mirrors your URL structure exactly:

| Elysia route | Client call |
|---|---|
| `GET /api/users` | `api.api.users.get()` |
| `GET /api/users/:id` | `api.api.users({ id: 5 }).get()` |
| `POST /api/users` | `api.api.users.post({ body: {...} })` |
| `GET /test/` | `api.test.index.get()` |
| `GET /test/user/:id` | `api.test.user({ id: 5 }).get()` |

---

## Deployment

```bash
bun run build       # outputs to dist/
bun dist/start.js   # runs the full app
```

**Recommended hosts:** Railway, Fly.io, any VPS with Bun installed.

Set `PORT` environment variable to change the port in production.

---

## Roadmap

- ✅ Elysia + React — stable and the focus going forward
- 🔜 Better Elysia integration — deeper type support, plugins, auth
- 🔜 More frontend framework support in future versions
- 🔜 Docs website

---

## Beta Notes

- Windows support is untested
- Vercel deployment untested — Railway/Fly.io recommended
- `@bunnyx/api` alias unreliable — import from `bunnyx-api/api-client` directly
- Elysia Swagger, Lucia auth, tRPC — should work but untested with the bridge

---

## License

MIT · Made with 🐰 by [PeaseErnest](https://github.com/BunElysiaReact/BERTUI)