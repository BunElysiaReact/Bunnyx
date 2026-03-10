// bunny/src/client/index.ts
// Optional type-safe API client — thin wrapper around Elysia Eden Treaty

/**
 * Creates a fully type-safe API client from your Elysia app type.
 *
 * @example
 * ```ts
 * // src/client.ts
 * import { createApiClient } from 'bunnyx/client';
 * import type { App } from './server';
 *
 * export const api = createApiClient<App>();
 *
 * // In a React component:
 * const { data } = await api.api.users.get();
 * //     ^ Fully typed based on your Elysia routes
 * ```
 */
export function createApiClient<TApp extends Record<string, any>>(
  options: { baseUrl?: string } = {}
): EdenClient<TApp> {
  const base = options.baseUrl ?? (
    typeof window !== 'undefined'
      ? window.location.origin
      : 'http://localhost:3000'
  );

  return createProxy(base) as EdenClient<TApp>;
}

// ─── Proxy-based client ───────────────────────────────────────────────────────
// Builds paths like: api.users.get() → GET /users

function createProxy(base: string, path: string[] = []): any {
  return new Proxy(function () {}, {
    get(_, key: string) {
      if (key === 'then') return undefined; // Not a promise
      return createProxy(base, [...path, key]);
    },
    async apply(_, __, [options]: [RequestInit & { query?: Record<string, string>, body?: unknown } | undefined]) {
      const method = path[path.length - 1].toUpperCase();
      const urlPath = '/' + path.slice(0, -1).join('/');

      const url = new URL(base + urlPath);

      if (options?.query) {
        for (const [k, v] of Object.entries(options.query)) {
          url.searchParams.set(k, v);
        }
      }

      const res = await fetch(url.toString(), {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(options?.headers as Record<string, string> ?? {}),
        },
        body: options?.body ? JSON.stringify(options.body) : undefined,
      });

      const data = await res.json().catch(() => null);
      return { data, error: res.ok ? null : data, status: res.status };
    },
  });
}

// ─── Type helpers ─────────────────────────────────────────────────────────────

type EdenClient<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any
    ? EdenMethod<Awaited<ReturnType<T[K]>>>
    : EdenClient<T[K]>;
};

interface EdenMethod<TReturn> {
  get(options?: { query?: Record<string, string>; headers?: Record<string, string> }): Promise<{ data: TReturn; error: null; status: number }>;
  post(options?: { body?: unknown; headers?: Record<string, string> }): Promise<{ data: TReturn; error: null; status: number }>;
  put(options?: { body?: unknown; headers?: Record<string, string> }): Promise<{ data: TReturn; error: null; status: number }>;
  patch(options?: { body?: unknown; headers?: Record<string, string> }): Promise<{ data: TReturn; error: null; status: number }>;
  delete(options?: { query?: Record<string, string>; headers?: Record<string, string> }): Promise<{ data: TReturn; error: null; status: number }>;
}
