'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { Article } from '../../lib/articleUtils'

function NewsEmailBanner() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle'|'loading'|'done'|'error'>('idle')
  if (status === 'done') return (
    <div style={{ marginBottom: 32, padding: '18px 20px', background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 12, fontSize: 14, color: '#22c55e', fontWeight: 600 }}>
      ✅ You&apos;re in — price alerts on their way.
    </div>
  )
  return (
    <div style={{ marginBottom: 32, padding: '20px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12 }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9', marginBottom: 4 }}>
        🛒 Get Grocery Price spike alerts
      </div>
      <div style={{ fontSize: 13, color: '#64748b', marginBottom: 14 }}>
        Free email alerts when prices move. No spam, unsubscribe anytime.
      </div>
      <form onSubmit={async e => {
        e.preventDefault()
        if (!email.trim()) return
        setStatus('loading')
        try {
          const r = await fetch('/api/subscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) })
          setStatus(r.ok ? 'done' : 'error')
        } catch { setStatus('error') }
      }} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <input
          type="email" value={email} onChange={e => setEmail(e.target.value)}
          placeholder="your@email.com" required
          style={{ padding: '12px 16px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.06)', color: '#f1f5f9', fontSize: 15, width: '100%', boxSizing: 'border-box', outline: 'none' }}
        />
        <button type="submit" disabled={status === 'loading'}
          style={{ padding: '13px 20px', borderRadius: 10, border: 'none', background: status === 'loading' ? '#475569' : '#16a34a', color: '#fff', fontSize: 15, fontWeight: 700, cursor: status === 'loading' ? 'default' : 'pointer', width: '100%' }}>
          {status === 'loading' ? 'Signing up…' : 'Get Alerts →'}
        </button>
      </form>
      {status === 'error' && <div style={{ fontSize: 12, color: '#16a34a', marginTop: 8 }}>Something went wrong — try again.</div>}
    </div>
  )
}

function timeAgo(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (s < 60)   return `${s}s ago`
  if (s < 3600) return `${Math.floor(s/60)}m ago`
  if (s < 86400) return `${Math.floor(s/3600)}h ago`
  return `${Math.floor(s/86400)}d ago`
}

export default function NewsArchive() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    fetch('/api/articles/archive')
      .then(r => r.json())
      .then(d => { setArticles(d.articles ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <main style={{ minHeight: '100vh', background: '#0b0d14', color: '#f1f5f9' }}>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '32px 20px 80px' }}>

        {/* Nav */}
        <div style={{ marginBottom: 32 }}>
          <Link href="/" style={{ color: '#64748b', textDecoration: 'none', fontSize: 14 }}>
            ← whatsthegrocerybill.com
          </Link>
        </div>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#16a34a', display: 'inline-block' }} />
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: '#f8fafc' }}>
              Price Pressure Analysis
            </h1>
            <a
              href="https://twitter.com/wtgbofficial"
              target="_blank" rel="noopener noreferrer"
              style={{ fontSize: 13, color: '#1d9bf0', textDecoration: 'none', fontWeight: 600 }}
            >@wtgbofficial</a>
          </div>
          <p style={{ margin: 0, color: '#64748b', fontSize: 15 }}>
            Every market signal we've analyzed — oil spikes, supply shocks, and what they mean at the pump.
          </p>
        </div>

        {/* Email CTA — slim banner, top of archive */}
        <NewsEmailBanner />

        {/* Article list */}
        {loading ? (
          <div style={{ color: '#475569', fontSize: 14, padding: '40px 0', textAlign: 'center' }}>
            Loading analysis archive…
          </div>
        ) : articles.length === 0 ? (
          <div style={{ color: '#475569', fontSize: 14, padding: '40px 0', textAlign: 'center' }}>
            No articles yet — check back soon.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {articles.map((article, i) => (
              <Link
                key={article.slug}
                href={`/news/${article.slug}`}
                style={{ textDecoration: 'none' }}
              >
                <div style={{
                  padding: '20px 0',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                  cursor: 'pointer',
                  transition: 'padding-left 0.15s',
                }}
                  onMouseEnter={e => (e.currentTarget.style.paddingLeft = '8px')}
                  onMouseLeave={e => (e.currentTarget.style.paddingLeft = '0')}
                >
                  {/* Tags + time */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                    <span style={{
                      fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
                      color: '#16a34a', background: 'rgba(239,68,68,0.1)',
                      padding: '2px 8px', borderRadius: 4, textTransform: 'uppercase',
                    }}>⬆ Price Pressure</span>
                    {article.tags.slice(0, 2).map(tag => (
                      <span key={tag} style={{
                        fontSize: 10, color: '#475569',
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.07)',
                        padding: '2px 8px', borderRadius: 4,
                      }}>{tag}</span>
                    ))}
                    <span style={{ fontSize: 12, color: '#334155', marginLeft: 'auto' }}>
                      {timeAgo(article.source_tweet?.created_at ?? article.created_at ?? new Date(article.generated_at || Date.now()).toISOString())}
                    </span>
                  </div>

                  {/* Headline */}
                  <h2 style={{
                    margin: '0 0 6px',
                    fontSize: 18, fontWeight: 700,
                    color: '#f1f5f9', lineHeight: 1.35,
                  }}>{article.headline}</h2>

                  {/* Subhead */}
                  <p style={{
                    margin: 0, fontSize: 14, color: '#64748b', lineHeight: 1.5,
                  }}>{article.subhead}</p>

                  <div style={{ marginTop: 10, fontSize: 13, color: '#16a34a', fontWeight: 600 }}>
                    Read full analysis →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Follow CTA */}
        <div style={{
          marginTop: 48, padding: '24px', textAlign: 'center',
          background: 'rgba(29,155,240,0.06)',
          border: '1px solid rgba(29,155,240,0.15)',
          borderRadius: 12,
        }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#f1f5f9', marginBottom: 8 }}>
            Get signals in real-time
          </div>
          <a
            href="https://twitter.com/intent/follow?screen_name=wtgbofficial"
            target="_blank" rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: '#1d9bf0', color: '#fff',
              padding: '9px 20px', borderRadius: 20,
              textDecoration: 'none', fontSize: 14, fontWeight: 700,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.63L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/>
            </svg>
            Follow @wtgbofficial
          </a>
        </div>
      </div>
    </main>
  )
}
