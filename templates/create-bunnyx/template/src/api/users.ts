import { Elysia, t } from 'elysia'

export const usersRoutes = new Elysia({ prefix: '/api/users' })
  .get('/', () => ({
    users: [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
    ],
  }))

  .get('/:id', ({ params }) => ({
    user: { id: Number(params.id), name: 'Alice' },
  }))

  .post('/', ({ body }) => ({
    created: { id: Date.now(), ...body },
  }), {
    body: t.Object({
      name: t.String(),
    }),
  })
