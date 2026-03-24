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
    <section style={{ maxWidth: 900, margin: '0 auto', padding: '0 16px 32px' }}>
      <div style={{
        background: 'linear-gradient(135deg, rgba(22,163,74,0.08) 0%, rgba(22,163,74,0.03) 100%)',
        border: '1px solid rgba(22,163,74,0.2)',
        borderRadius: 16,
        padding: '24px 20px',
      }}>
        {/* Top row: icon + copy */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 16 }}>
          <div style={{ fontSize: 28, flexShrink: 0, lineHeight: 1 }}>🛒</div>
          <div>
            <h3 style={{ margin: '0 0 4px', fontSize: 17, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.01em' }}>
              Get Grocery Price Alerts
            </h3>
            <p style={{ margin: 0, fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>
              We&apos;ll alert you when prices spike or drop in your area.
            </p>
          </div>
        </div>

        {/* Form — stacks on mobile */}
        {status === 'done' ? (
          <div style={{ fontSize: 14, fontWeight: 600, color: '#22c55e', padding: '6px 0' }}>
            ✅ You&apos;re in — we&apos;ll keep you posted.
          </div>
        ) : (
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              style={{
                padding: '12px 16px',
                borderRadius: 10,
                border: '1px solid rgba(255,255,255,0.12)',
                background: 'rgba(255,255,255,0.06)',
                color: '#f1f5f9',
                fontSize: 15,
                width: '100%',
                boxSizing: 'border-box',
                outline: 'none',
              }}
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              style={{
                padding: '12px 20px',
                borderRadius: 10,
                border: 'none',
                background: status === 'loading' ? '#475569' : '#16a34a',
                color: '#fff',
                fontSize: 15,
                fontWeight: 700,
                cursor: status === 'loading' ? 'default' : 'pointer',
                width: '100%',
              }}
            >
              {status === 'loading' ? 'Signing up...' : 'Get Alerts →'}
            </button>
          </form>
        )}

        {status === 'error' && (
          <div style={{ fontSize: 12, color: '#16a34a', marginTop: 8 }}>
            Something went wrong — try again or follow @wtgbofficial for updates.
          </div>
        )}
      </div>
    </section>
  )
}
