import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const RESEND_KEY      = process.env.RESEND_API_KEY
const RESEND_AUDIENCE = process.env.RESEND_AUDIENCE_ID
const FROM_EMAIL      = 'alerts@whatsthegrocerybill.com'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const email = (body.email ?? '').trim().toLowerCase()

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ ok: false, error: 'invalid_email' }, { status: 400 })
  }

  if (!RESEND_KEY) {
    // Resend not configured yet — log and return success so form UX isn't broken
    console.log('[subscribe] NEW SUBSCRIBER (Resend not configured):', email)
    return NextResponse.json({ ok: true, note: 'logged_only' })
  }

  let contactOk = false

  // 1. Add to Resend audience (subscriber list)
  if (RESEND_AUDIENCE) {
    try {
      const res = await fetch(`https://api.resend.com/audiences/${RESEND_AUDIENCE}/contacts`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, unsubscribed: false }),
      })
      contactOk = res.ok
      if (!res.ok) console.error('[subscribe] Resend contacts error:', res.status, await res.text())
    } catch (e) {
      console.error('[subscribe] Resend contacts failed:', e)
    }
  }

  // 2. Welcome email — domain verified 2026-03-22, sending from alerts@whatsthegrocerybill.com
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: `What's the Grocery Bill? <${FROM_EMAIL}>`,
        to: [email],
        subject: "You're in — Grocery Price alerts are on 🛒",
        html: `
          <div style="font-family:sans-serif;max-width:520px;margin:0 auto;background:#0b0d14;color:#f1f5f9;padding:32px;border-radius:12px">
            <h2 style="color:#ef4444;margin:0 0 8px">🛒 Grocery Price Alerts Active</h2>
            <p style="color:#94a3b8;margin:0 0 20px">You'll hear from us when prices move — spikes, drops, and the signals that matter.</p>
            <p style="margin:0 0 8px;color:#cbd5e1">In the meantime:</p>
            <ul style="color:#cbd5e1;padding-left:20px;line-height:1.8">
              <li>Check live prices: <a href="https://whatsthegrocerybill.com" style="color:#ef4444">whatsthegrocerybill.com</a></li>
              <li>Follow us on X: <a href="https://twitter.com/wtgbofficial" style="color:#1d9bf0">@wtgbofficial</a></li>
            </ul>
            <p style="margin:24px 0 0;color:#475569;font-size:12px">
              You signed up at whatsthegrocerybill.com. No spam, ever.
            </p>
          </div>`,
      }),
    })
  } catch (e) {
    console.error('[subscribe] Welcome email failed:', e)
  }

  return NextResponse.json({ ok: true, added: contactOk })
}
