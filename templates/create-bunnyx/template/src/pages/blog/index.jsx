import React, { useState, useEffect } from 'react'
import { Link } from 'bertui/router'

export const title = 'Blog — bunnyx-test'

export default function BlogPage() {
  const [posts, setPosts] = useState([])

  useEffect(() => {
    fetch('/api/posts')
      .then(r => r.json())
      .then(d => setPosts(d.posts))
  }, [])

  return (
    <main style={{ padding: '2rem', fontFamily: 'system-ui', maxWidth: '640px', margin: '0 auto' }}>
      <h1>Blog</h1>
      <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {posts.map(p => (
          <Link key={p.id} to={`/blog/${p.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
              <h2 style={{ margin: 0, fontSize: '1.1rem' }}>{p.title}</h2>
            </div>
          </Link>
        ))}
      </div>
      <Link to="/" style={{ color: '#10b981', display: 'inline-block', marginTop: '1.5rem' }}>← Home</Link>
    </main>
  )
}
