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
      background: 'var(--navy)',
      borderRadius: 16,
      padding: '24px 26px',
      marginBottom: 24,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Red accent top */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'var(--red)' }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 18 }}>
        <div style={{ fontSize: 28, flexShrink: 0, lineHeight: 1 }}>📊</div>
        <div>
          <h3 style={{ margin: '0 0 5px', fontSize: 17, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.01em' }}>
            Get Weekly Grocery Price Alerts
          </h3>
          <p style={{ margin: 0, fontSize: 13, color: '#94a3b8', lineHeight: 1.5 }}>
            We&apos;ll email you when egg, milk, or beef prices spike — straight from BLS data.
          </p>
        </div>
      </div>

      {status === 'done' ? (
        <div style={{ fontSize: 14, fontWeight: 600, color: '#4ade80', padding: '8px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
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
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#f1f5f9' }}
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
            style={{ color: '#60a5fa', textDecoration: 'none' }}>@wtgbofficial</a>.
        </div>
      )}
    </div>
  )
}
