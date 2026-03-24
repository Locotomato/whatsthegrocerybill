'use client'
import { useState } from 'react'

export default function GroceryEmailBanner() {
  const [email, setEmail]   = useState('')
  const [status, setStatus] = useState<'idle'|'loading'|'done'|'error'>('idle')

  if (status === 'done') return (
    <div style={{ marginBottom: 32, padding: '18px 20px', background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 12, fontSize: 14, color: '#22c55e', fontWeight: 600 }}>
      ✅ You&apos;re in — we&apos;ll alert you when prices spike near you.
    </div>
  )

  return (
    <div style={{ marginBottom: 32, padding: '20px', background: 'rgba(22,163,74,0.06)', border: '1px solid rgba(22,163,74,0.2)', borderRadius: 12 }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9', marginBottom: 4 }}>
        🛒 Get notified when Grocery Prices spike
      </div>
      <div style={{ fontSize: 13, color: '#64748b', marginBottom: 14 }}>
        Free email alerts — no spam, unsubscribe anytime.
      </div>
      <form onSubmit={async e => {
        e.preventDefault()
        if (!email.trim()) return
        setStatus('loading')
        try {
          const r = await fetch('/api/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
          })
          setStatus(r.ok ? 'done' : 'error')
        } catch { setStatus('error') }
      }} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <input
          type="email" value={email} onChange={e => setEmail(e.target.value)}
          placeholder="your@email.com" required
          style={{ padding: '12px 16px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.06)', color: '#f1f5f9', fontSize: 15, width: '100%', boxSizing: 'border-box', outline: 'none' }}
        />
        <button
          type="submit" disabled={status === 'loading'}
          style={{ padding: '13px 20px', borderRadius: 10, border: 'none', background: status === 'loading' ? '#475569' : '#16a34a', color: '#fff', fontSize: 15, fontWeight: 700, cursor: status === 'loading' ? 'default' : 'pointer', width: '100%' }}
        >
          {status === 'loading' ? 'Signing up…' : 'Get Alerts →'}
        </button>
      </form>
      {status === 'error' && (
        <div style={{ fontSize: 12, color: '#16a34a', marginTop: 8 }}>Something went wrong — try again.</div>
      )}
    </div>
  )
}
