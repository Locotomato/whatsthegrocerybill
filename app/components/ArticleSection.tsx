'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Article {
  id: string
  slug: string
  headline: string
  subhead: string
  tags: string[]
  source_tweet: { created_at: string; username: string }
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export default function ArticleSection() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/articles')
      .then(r => r.json())
      .then(d => { setArticles((d.articles ?? []).filter((a: Article) => a?.source_tweet?.created_at)); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return (
    <section style={{ marginBottom: 32 }}>
      <SectionHeader />
      <div style={{ color: 'var(--subtle)', fontSize: 14 }}>Loading analysis…</div>
    </section>
  )

  if (!articles.length) return null

  return (
    <section style={{ marginBottom: 32 }}>
      <SectionHeader />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {articles.map((a, i) => (
          <Link key={a.id} href={`/news/${a.slug}`} style={{ textDecoration: 'none' }}>
            <article style={{
              background: '#fff',
              border: '1px solid var(--border)',
              borderLeft: `3px solid ${i === 0 ? 'var(--red)' : 'var(--blue)'}`,
              borderRadius: 12,
              padding: '16px 20px',
              cursor: 'pointer',
              transition: 'box-shadow 0.15s, transform 0.1s',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.10)'
              ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'
              ;(e.currentTarget as HTMLElement).style.transform = ''
            }}
            >
              {/* Tags + time */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 9, alignItems: 'center' }}>
                <span style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: '0.07em',
                  color: 'var(--red)', background: 'var(--red-light)',
                  border: '1px solid var(--red-border)',
                  padding: '2px 8px', borderRadius: 4, textTransform: 'uppercase',
                }}>🛒 Grocery Prices</span>
                {a.tags.slice(0, 2).map(tag => (
                  <span key={tag} style={{
                    fontSize: 10, color: 'var(--muted)',
                    background: '#f1f5f9', border: '1px solid var(--border)',
                    padding: '2px 8px', borderRadius: 4,
                  }}>{tag}</span>
                ))}
                <span style={{ fontSize: 11, color: 'var(--subtle)', marginLeft: 'auto' }}>
                  {a.source_tweet?.created_at ? timeAgo(a.source_tweet.created_at) : ''}
                </span>
              </div>

              {/* Headline */}
              <h3 style={{
                margin: '0 0 6px',
                fontSize: i === 0 ? 18 : 15,
                fontWeight: 800,
                color: 'var(--text)',
                lineHeight: 1.3,
                letterSpacing: '-0.01em',
              }}>{a.headline}</h3>

              {/* Subhead */}
              <p style={{ margin: '0 0 10px', fontSize: 13, color: 'var(--muted)', lineHeight: 1.5 }}>
                {a.subhead}
              </p>

              {/* CTA */}
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--blue)', display: 'flex', alignItems: 'center', gap: 4 }}>
                Read full analysis →
              </div>
            </article>
          </Link>
        ))}
      </div>

      <div style={{ marginTop: 14, textAlign: 'right' }}>
        <Link href="/news" style={{ fontSize: 13, color: 'var(--muted)', textDecoration: 'none', fontWeight: 500 }}>
          View all analysis →
        </Link>
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </section>
  )
}

function SectionHeader() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
      <div style={{
        width: 9, height: 9, borderRadius: '50%',
        background: 'var(--red)', boxShadow: '0 0 6px var(--red)',
        animation: 'pulse 2s infinite', flexShrink: 0,
      }} />
      <h2 style={{ margin: 0, fontSize: 19, fontWeight: 700, color: 'var(--text)' }}>
        Grocery Price Trends
      </h2>
      <a href="https://twitter.com/wtgbofficial" target="_blank" rel="noopener noreferrer"
        style={{ fontSize: 12, color: 'var(--blue)', marginLeft: 4, textDecoration: 'none' }}>
        @wtgbofficial
      </a>
    </div>
  )
}
