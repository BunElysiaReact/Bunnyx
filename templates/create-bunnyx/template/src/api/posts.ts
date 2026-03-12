import { Elysia, t } from 'elysia'

export const postsRoutes = new Elysia({ prefix: '/api/posts' })
  .get('/', () => ({
    posts: [
      { id: 1, title: 'Hello World', slug: 'hello-world' },
      { id: 2, title: 'Getting Started', slug: 'getting-started' },
    ],
  }))

  .get('/:slug', ({ params }) => ({
    post: { slug: params.slug, title: 'Hello World', content: '...' },
  }))
