'use client'

import { useState } from 'react'

interface Props {
  placement: 'mid' | 'end'
}

export default function ArticleEmailCapture({ placement }: Props) {
  const [email, setEmail]   = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setStatus('loading')
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      setStatus(res.ok ? 'done' : 'error')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'done') {
    return (
      <div style={{
        margin: '28px 0',
        padding: '18px 22px',
        background: 'rgba(239,68,68,0.08)',
        border: '1px solid rgba(239,68,68,0.2)',
        borderRadius: 10,
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <span style={{ fontSize: 22 }}>🛒</span>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9' }}>You're in.</div>
          <div style={{ fontSize: 13, color: '#64748b' }}>We'll hit you when prices make a move.</div>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      margin: '28px 0',
      padding: placement === 'mid' ? '0' : '22px',
      background: placement === 'mid' ? 'transparent' : 'rgba(255,255,255,0.02)',
      border: placement === 'mid' ? 'none' : '1px solid rgba(255,255,255,0.07)',
      borderRadius: placement === 'mid' ? 0 : 12,
      borderLeft: placement === 'mid' ? '3px solid #ef4444' : 'none',
      paddingLeft: placement === 'mid' ? '18px' : '22px',
      position: 'relative',
    }}>

      {/* Dismiss */}
      <button
        onClick={() => setDismissed(true)}
        aria-label="Dismiss"
        style={{
          position: 'absolute', top: placement === 'mid' ? 0 : 10, right: placement === 'mid' ? -8 : 10,
          background: 'none', border: 'none', color: '#334155',
          cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: '2px 6px',
        }}
      >×</button>

      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#ef4444', marginBottom: 3, letterSpacing: '0.03em' }}>
          🛒 {placement === 'mid' ? 'Get price alerts — free' : 'Don\'t miss the next move'}
        </div>
        <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.4 }}>
          {placement === 'mid'
            ? 'We track gas & oil daily. Get alerts when prices spike or drop.'
            : 'Join readers tracking Grocery Prices with us. No spam, ever.'}
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8 }}>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          disabled={status === 'loading'}
          style={{
            flex: 1,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 6,
            padding: '8px 12px',
            color: '#f1f5f9',
            fontSize: 13,
            outline: 'none',
            minWidth: 0,
          }}
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          style={{
            background: '#ef4444',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            padding: '8px 16px',
            fontSize: 13,
            fontWeight: 700,
            cursor: status === 'loading' ? 'wait' : 'pointer',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          {status === 'loading' ? '…' : 'Get alerts'}
        </button>
      </form>
      {status === 'error' && (
        <div style={{ fontSize: 12, color: '#f87171', marginTop: 6 }}>Something went wrong — try again.</div>
      )}
    </div>
  )
}
