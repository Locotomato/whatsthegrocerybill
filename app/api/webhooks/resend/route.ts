import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const LOCO_WEBHOOK_URL = 'https://locotomato.com/api/webhooks/resend'
const LOCO_SOURCE = 'wtgb'
const LOCO_SECRET = process.env.LOCO_WEBHOOK_SECRET!

export async function POST(req: NextRequest) {
  // Read raw body for signature verification passthrough
  const rawBody = await req.text()

  // Forward to Loco — raw payload, zero transformation
  try {
    const res = await fetch(LOCO_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-loco-source': LOCO_SOURCE,
        'x-loco-secret': LOCO_SECRET,
      },
      body: rawBody,
    })

    console.log(`[resend-webhook] forwarded to Loco: ${res.status}`)
  } catch (e) {
    console.error('[resend-webhook] forward failed:', e)
    // Don't fail — Resend needs a 200 or it retries
  }

  return NextResponse.json({ ok: true })
}
