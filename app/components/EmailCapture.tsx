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
      padding: '28px 26px',
      marginBottom: 24,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Red accent top */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'var(--red)' }} />

      {status === 'done' ? (
        <div style={{ textAlign: 'center', padding: '12px 0' }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>🛒</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#4ade80', marginBottom: 6 }}>
            You&apos;re in! Welcome to the list.
          </div>
          <div style={{ fontSize: 13, color: '#94a3b8' }}>
            First edition lands in your inbox this week.
          </div>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 26 }}>🛒</span>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.01em' }}>
                Stop Overpaying at the Grocery Store
              </h3>
            </div>
            <p style={{ margin: '0 0 14px', fontSize: 14, color: '#94a3b8', lineHeight: 1.6 }}>
              Join <strong style={{ color: '#cbd5e1' }}>free weekly newsletter</strong> — grocery price tracker, inflation alerts,
              and the best ways to cut your bill without clipping coupons.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {[
                '📈 Price spike alerts',
                '💡 Money-saving tips',
                '🏪 Store-by-store comparisons',
                '🥚 Weekly staple price roundup',
              ].map((item, i) => (
                <span key={i} style={{
                  fontSize: 12, color: '#94a3b8',
                  background: 'rgba(255,255,255,0.07)',
                  borderRadius: 20, padding: '4px 10px',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}>
                  {item}
                </span>
              ))}
            </div>
          </div>

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
              {status === 'loading' ? 'Joining…' : 'Get the Free Newsletter →'}
            </button>
          </form>

          <p style={{ margin: '10px 0 0', fontSize: 11, color: '#64748b', textAlign: 'center' }}>
            Free forever. No spam. Unsubscribe anytime.
          </p>
        </>
      )}

      {status === 'error' && (
        <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 8, textAlign: 'center' }}>
          Something went wrong — try again or follow{' '}
          <a href="https://twitter.com/wtgbofficial" target="_blank" rel="noopener noreferrer"
            style={{ color: '#60a5fa', textDecoration: 'none' }}>@wtgbofficial</a>.
        </div>
      )}
    </div>
  )
}
