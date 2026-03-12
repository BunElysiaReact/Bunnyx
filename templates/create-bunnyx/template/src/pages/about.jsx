import React from 'react'
import { Link } from 'bertui/router'

export const title = 'About — bunnyx-test'

export default function AboutPage() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'system-ui', maxWidth: '640px', margin: '0 auto' }}>
      <h1>About</h1>
      <p style={{ color: '#6b7280', marginTop: '0.5rem', lineHeight: 1.6 }}>
        This app is powered by <strong>Bunny</strong> — BertUI for the frontend,
        Elysia for the backend, running in one Bun server on one port.
      </p>

      <ul style={{ marginTop: '1.5rem', lineHeight: 2.2 }}>
        <li>📄 Pages live in <code>src/pages/</code></li>
        <li>🔌 API routes live in <code>src/api/</code></li>
        <li>🚪 Entry is <code>src/index.ts</code></li>
        <li>⚙️  Config is <code>bunnyx.config.ts</code></li>
      </ul>

      <Link to="/" style={{ color: '#10b981', display: 'inline-block', marginTop: '1.5rem' }}>← Home</Link>
    </main>
  )
}
