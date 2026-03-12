// Optional: type-safe API client powered by bunny/client
// Usage: const { data } = await api.api.users.get()
import { createApiClient } from 'bunnyx/client'
import type { App } from './index'

export const api = createApiClient<App>()
