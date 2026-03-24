'use client'
import { useState } from 'react'

export default function EmailCapture() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
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

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(22,163,74,0.1) 0%, rgba(22,163,74,0.04) 100%)',
      border: '1px solid rgba(22,163,74,0.25)',
      borderRadius: 16,
      padding: '22px 24px',
      marginBottom: 24,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 16 }}>
        <div style={{ fontSize: 26, flexShrink: 0, lineHeight: 1 }}>🛒</div>
        <div>
          <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.01em' }}>
            Get Grocery Price Alerts
          </h3>
          <p style={{ margin: 0, fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>
            Weekly email when prices spike or drop — eggs, beef, chicken, and more.
          </p>
        </div>
      </div>

      {status === 'done' ? (
        <div style={{ fontSize: 14, fontWeight: 600, color: '#22c55e', padding: '6px 0' }}>
          ✅ You&apos;re in — we&apos;ll keep you posted.
        </div>
      ) : (
        <form onSubmit={submit} className="email-form">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="email-form-input"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="email-form-btn"
          >
            {status === 'loading' ? 'Signing up…' : 'Get Alerts →'}
          </button>
        </form>
      )}

      {status === 'error' && (
        <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 8 }}>
          Something went wrong — try again or follow{' '}
          <a href="https://twitter.com/wtgbofficial" target="_blank" rel="noopener noreferrer"
            style={{ color: '#1d9bf0', textDecoration: 'none' }}>@wtgbofficial</a>.
        </div>
      )}
    </div>
  )
}
