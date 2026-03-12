import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { usersRoutes } from './api/users'
import { postsRoutes } from './api/posts'

const app = new Elysia()
  .use(cors())
  .use(usersRoutes)
  .use(postsRoutes)
  .listen(3000)

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`)

// Export type for the type-safe client
export type App = typeof app
export default app
