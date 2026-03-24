'use client'
import { useEffect, useState } from 'react'

interface NewsItem {
  id: string
  author: string
  username: string
  avatar?: string
  text: string
  url: string
  created_at: string
  sentiment: 'up' | 'down' | 'neutral'
}

const SENTIMENT_CONFIG = {
  up:      { label: '⬆ Price Pressure', color: '#16a34a', bg: 'rgba(22,163,74,0.12)' },
  down:    { label: '⬇ Price Relief',   color: '#22c55e', bg: 'rgba(34,197,94,0.12)'  },
  neutral: { label: '➡ Watching',       color: '#94a3b8', bg: 'rgba(148,163,184,0.10)'},
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

export default function NewsFeed() {
  const [items, setItems] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'up' | 'down' | 'neutral'>('all')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/news')
      .then(r => r.json())
      .then(d => {
        setItems(d.items ?? [])
        setLoading(false)
      })
      .catch(() => {
        setError('Could not load feed')
        setLoading(false)
      })
  }, [])

  const filtered = filter === 'all' ? items : items.filter(i => i.sentiment === filter)
  const counts = {
    up:      items.filter(i => i.sentiment === 'up').length,
    down:    items.filter(i => i.sentiment === 'down').length,
    neutral: items.filter(i => i.sentiment === 'neutral').length,
  }

  return (
    <section style={{ maxWidth: 900, margin: '0 auto', padding: '0 16px 48px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{
          width: 10, height: 10, borderRadius: '50%',
          background: '#16a34a',
          boxShadow: '0 0 8px #16a34a',
          animation: 'pulse 2s infinite',
          flexShrink: 0,
        }} />
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#f1f5f9' }}>
          Market Intelligence Feed
        </h2>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 12, color: '#64748b' }}>updates every 30 min</span>
          <a
            href="https://twitter.com/intent/follow?screen_name=wtgbofficial"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: '#1d9bf0',
              color: '#fff',
              fontSize: 13,
              fontWeight: 600,
              padding: '5px 14px',
              borderRadius: 20,
              textDecoration: 'none',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#1a8cd8')}
            onMouseLeave={e => (e.currentTarget.style.background = '#1d9bf0')}
          >
            {/* X / Twitter logo */}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.63L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/>
            </svg>
            Follow @wtgbofficial
          </a>
        </div>
      </div>

      {/* Sentiment filter buttons */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, overflowX: 'auto', paddingBottom: 4, WebkitOverflowScrolling: 'touch' as const, scrollbarWidth: 'none' as const }}>
        {(['all', 'up', 'down', 'neutral'] as const).map(f => {
          const baseCfg = f === 'all'
            ? { label: `All (${items.length})`, color: '#e2e8f0', bg: 'rgba(255,255,255,0.06)' }
            : { ...SENTIMENT_CONFIG[f], label: `${SENTIMENT_CONFIG[f].label} (${counts[f]})` }
          const cfg = baseCfg
          const active = filter === f
          return (
            <button key={f} onClick={() => setFilter(f)} style={{ flexShrink: 0,
              padding: '6px 14px',
              borderRadius: 20,
              border: `1px solid ${active ? cfg.color : 'rgba(255,255,255,0.1)'}`,
              background: active ? cfg.bg : 'transparent',
              color: active ? cfg.color : '#64748b',
              fontSize: 13,
              fontWeight: active ? 600 : 400,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}>
              {cfg.label}
            </button>
          )
        })}
      </div>

      {/* Feed */}
      {loading && (
        <div style={{ textAlign: 'center', color: '#64748b', padding: 40 }}>
          Loading market signals...
        </div>
      )}
      {error && (
        <div style={{ textAlign: 'center', color: '#16a34a', padding: 40 }}>{error}</div>
      )}
      {!loading && !error && filtered.length === 0 && (
        <div style={{ textAlign: 'center', color: '#64748b', padding: 40 }}>No signals right now.</div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.map(item => {
          const cfg = SENTIMENT_CONFIG[item.sentiment]
          return (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'block',
                background: 'rgba(255,255,255,0.04)',
                border: `1px solid rgba(255,255,255,0.07)`,
                borderLeft: `3px solid ${cfg.color}`,
                borderRadius: 10,
                padding: '14px 16px',
                textDecoration: 'none',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
            >
              {/* Top row: avatar + name block */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
                {item.avatar && (
                  <img src={item.avatar} alt={item.author}
                    style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0, marginTop: 1 }} />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Name row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 2 }}>
                    <span style={{ fontWeight: 700, color: '#f1f5f9', fontSize: 14 }}>{item.author}</span>
                    <span style={{ color: '#475569', fontSize: 12 }}>@{item.username}</span>
                  </div>
                  {/* Badge + time row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      fontSize: 10,
                      fontWeight: 600,
                      color: cfg.color,
                      background: cfg.bg,
                      border: `1px solid ${cfg.color}33`,
                      padding: '2px 7px',
                      borderRadius: 10,
                      whiteSpace: 'nowrap',
                    }}>
                      {cfg.label}
                    </span>
                    <span style={{ color: '#475569', fontSize: 12 }}>
                      {timeAgo(item.created_at)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tweet text */}
              <p style={{ margin: 0, color: '#cbd5e1', fontSize: 14, lineHeight: 1.55 }}>
                {item.text}
              </p>
            </a>
          )
        })}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </section>
  )
}
