import React, { useState, useEffect } from 'react'
import { useRouter, Link } from 'bertui/router'

export const title = 'Post'

export default function BlogPostPage() {
  const { params } = useRouter()
  const [post, setPost] = useState(null)

  useEffect(() => {
    fetch(`/api/posts/${params.slug}`)
      .then(r => r.json())
      .then(d => setPost(d.post))
  }, [params.slug])

  if (!post) return <p style={{ padding: '2rem', fontFamily: 'system-ui' }}>Loading...</p>

  return (
    <main style={{ padding: '2rem', fontFamily: 'system-ui', maxWidth: '640px', margin: '0 auto' }}>
      <h1>{post.title}</h1>
      <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>{post.content}</p>
      <Link to="/blog" style={{ color: '#10b981', display: 'inline-block', marginTop: '1.5rem' }}>← Blog</Link>
    </main>
  )
}
