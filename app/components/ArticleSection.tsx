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

  if (loading) {
    return (
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '0 16px 48px' }}>
        <SectionHeader />
        <div style={{ color: '#475569', fontSize: 14 }}>Generating analysis...</div>
      </section>
    )
  }

  if (!articles.length) return null

  return (
    <section style={{ maxWidth: 900, margin: '0 auto', padding: '0 16px 48px' }}>
      <SectionHeader />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {articles.map((a, i) => (
          <Link
            key={a.id}
            href={`/news/${a.slug}`}
            style={{ textDecoration: 'none' }}
          >
            <article style={{
              background: i === 0 ? 'rgba(22,163,74,0.06)' : 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(22,163,74,0.15)',
              borderLeft: '3px solid #16a34a',
              borderRadius: 12,
              padding: '18px 20px',
              cursor: 'pointer',
              transition: 'background 0.15s, border-color 0.15s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(22,163,74,0.1)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = i === 0
                ? 'rgba(22,163,74,0.06)' : 'rgba(255,255,255,0.03)'
            }}
            >
              {/* Tags + time */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10, alignItems: 'center' }}>
                <span style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
                  color: '#16a34a', background: 'rgba(22,163,74,0.12)',
                  padding: '2px 8px', borderRadius: 4, textTransform: 'uppercase',
                }}>🛒 Grocery Prices</span>
                {a.tags.slice(0, 2).map(tag => (
                  <span key={tag} style={{
                    fontSize: 10, color: '#64748b',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    padding: '2px 8px', borderRadius: 4,
                  }}>{tag}</span>
                ))}
                <span style={{ fontSize: 11, color: '#475569', marginLeft: 'auto' }}>
                  {a.source_tweet?.created_at ? timeAgo(a.source_tweet.created_at) : ''}
                </span>
              </div>

              {/* Headline */}
              <h3 style={{
                margin: '0 0 6px',
                fontSize: i === 0 ? 19 : 16,
                fontWeight: 800,
                color: '#f1f5f9',
                lineHeight: 1.3,
                letterSpacing: '-0.01em',
              }}>{a.headline}</h3>

              {/* Subhead */}
              <p style={{
                margin: '0 0 12px',
                fontSize: 13,
                color: '#94a3b8',
                lineHeight: 1.5,
              }}>{a.subhead}</p>

              {/* CTA */}
              <div style={{
                fontSize: 12, fontWeight: 600, color: '#16a34a',
                display: 'flex', alignItems: 'center', gap: 4,
              }}>
                Read full analysis →
              </div>
            </article>
          </Link>
        ))}
      </div>

      {/* More Analysis link */}
      <div style={{ marginTop: 16, textAlign: 'right' }}>
        <Link href="/news" style={{
          fontSize: 13, color: '#64748b', textDecoration: 'none',
          fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 4,
        }}>
          View all analysis →
        </Link>
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
      `}</style>
    </section>
  )
}

function SectionHeader() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
      <div style={{
        width: 10, height: 10, borderRadius: '50%',
        background: '#16a34a', boxShadow: '0 0 8px #16a34a',
        animation: 'pulse 2s infinite', flexShrink: 0,
      }} />
      <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#f1f5f9' }}>
        Grocery Price Trends
      </h2>
      <a
        href="https://twitter.com/wtgbofficial"
        target="_blank"
        rel="noopener noreferrer"
        style={{ fontSize: 12, color: '#1d9bf0', marginLeft: 4, textDecoration: 'none' }}
      >
        @wtgbofficial
      </a>
    </div>
  )
}
