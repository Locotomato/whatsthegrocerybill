import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@vercel/kv'

const FB_BASE = 'https://www.yrxtrk.com/aff_c?offer_id=22607&aff_id=2414&aff_sub='

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const subid = searchParams.get('subid') ?? 'wtgb-unknown'
  const slug = searchParams.get('slug') ?? ''

  const now = Date.now()
  const day = new Date().toISOString().slice(0, 10)

  const clickData = {
    subid,
    slug,
    site: 'wtgb',
    ts: now,
    ua: req.headers.get('user-agent') ?? '',
    ref: req.headers.get('referer') ?? '',
  }

  const dayKey = `fb:daily:wtgb:${day}`
  const slugKey = `fb:slug:wtgb:${slug}`

  await Promise.all([
    kv.lpush('fb:clicks:wtgb', JSON.stringify(clickData)),
    kv.ltrim('fb:clicks:wtgb', 0, 9999),
    kv.incr(dayKey),
    kv.expire(dayKey, 60 * 60 * 24 * 90),
    kv.incr(slugKey),
    kv.expire(slugKey, 60 * 60 * 24 * 90),
    kv.incr('fb:total:wtgb'),
  ]).catch(() => {})

  const dest = `${FB_BASE}${encodeURIComponent(subid)}`
  return NextResponse.redirect(dest, { status: 302 })
}
