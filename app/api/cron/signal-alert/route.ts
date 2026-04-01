/**
 * /api/cron/signal-alert — runs 2x/day (8am + 8pm ET)
 *
 * Signal sources (in priority order):
 *   1. Google News RSS (primary — free, no rate limits)
 *   2. Twitter search/recent (supplemental — max 10 results, skipped on failure)
 *
 * Fires subscriber email alert if:
 *    a) ≥ 50% of signals are "Prices Rising"  →  SPIKE alert
 *    b) ≥ 50% of signals are "Prices Falling" →  DROP alert
 *    c) Any signal contains a BREAKING keyword
 * KV dedup: max 1 alert per alert-type per 12 hours
 */

import { NextRequest, NextResponse } from 'next/server'

export const dynamic     = 'force-dynamic'
export const maxDuration = 60

const BEARER        = process.env.TWITTER_BEARER_TOKEN!
const RESEND_KEY    = process.env.RESEND_API_KEY
const AUDIENCE_ID   = process.env.RESEND_AUDIENCE_ID
const CRON_SECRET   = process.env.CRON_SECRET
const FROM          = 'alerts@whatsthegrocerybill.com'
const SITE          = 'https://whatsthegrocerybill.com'

const TWEET_QUERY   = '"grocery prices" OR "food prices" OR "egg prices" OR "milk prices" OR "meat prices" OR "grocery inflation" OR "food inflation" OR "supermarket prices" OR "cost of groceries" -is:retweet lang:en'

const UP_WORDS      = ['spike','surge','rise','rising','jump','soar','higher','increase',
                       'shortage','disruption','outage','hurricane','storm','crisis','recall','drought','tariff']
const DOWN_WORDS    = ['drop','fall','decline','lower','decrease','cheap','lowest','plunge',
                       'surplus','deal','agreement','relief','ease','discount','sale']

// Breaking keywords that warrant an immediate alert regardless of ratio
const BREAKING_WORDS = [
  'recall','shortage','ban','tariff','emergency','spike','surge','crisis',
  'avian flu','bird flu','outbreak','storm','hurricane','flood','drought',
  'supply chain','port strike','freeze',
]

// ─── KV helpers ────────────────────────────────────────────────────────────────
async function kvExists(key: string): Promise<boolean> {
  try { const { kv } = await import('@vercel/kv'); return (await kv.exists(key)) > 0 } catch { return false }
}
async function kvSet(key: string, val: unknown, ex: number) {
  try { const { kv } = await import('@vercel/kv'); await kv.set(key, val, { ex }) } catch {}
}

// ─── Sentiment classifier ──────────────────────────────────────────────────────
function sentiment(text: string): 'up' | 'down' | 'neutral' {
  const t = text.toLowerCase()
  const up   = UP_WORDS.filter(w => t.includes(w)).length
  const down = DOWN_WORDS.filter(w => t.includes(w)).length
  if (up > down) return 'up'
  if (down > up) return 'down'
  return 'neutral'
}

function hasBreaking(text: string): string | null {
  const t = text.toLowerCase()
  return BREAKING_WORDS.find(w => t.includes(w)) ?? null
}

interface Tweet { id: string; text: string; author: string; username: string; created_at: string }

const NEWS_FEEDS = [
  { url: 'https://news.google.com/rss/search?q=grocery+prices+OR+food+inflation+OR+egg+prices+OR+supermarket+prices+US&hl=en-US&gl=US&ceid=US:en', source: 'Google News' },
  { url: 'https://feeds.reuters.com/reuters/businessNews', source: 'Reuters' },
  { url: 'https://www.supermarketnews.com/rss/all', source: 'Supermarket News' },
]
const GROCERY_KEYWORDS = ['grocery','groceries','supermarket','food price','egg price','milk price',
  'beef','chicken','bread','produce','food inflation','cost of food','grocery bill','walmart','kroger',
  'aldi','whole foods','usda','agriculture','farm price','tariff','commodity']

// ─── Primary: Google News RSS signals ────────────────────────────────────────
async function fetchNewsSignals(): Promise<Tweet[]> {
  const results: Tweet[] = []
  for (const feed of NEWS_FEEDS) {
    try {
      const res = await fetch(feed.url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; WTGBBot/1.0)' },
        signal: AbortSignal.timeout(8000),
      })
      if (!res.ok) continue
      const xml = await res.text()
      for (const m of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
        const block = m[1]
        const title = (block.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1]
                    ?? block.match(/<title>(.*?)<\/title>/)?.[1] ?? '').trim()
        const desc  = (block.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/)?.[1]
                    ?? block.match(/<description>(.*?)<\/description>/)?.[1] ?? '').replace(/<[^>]+>/g,'').trim()
        const pubDate = block.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] ?? new Date().toISOString()
        if (!title) continue
        const combined = `${title} ${desc}`.toLowerCase()
        if (!GROCERY_KEYWORDS.some(kw => combined.includes(kw))) continue
        const id = `news_${Buffer.from(title).toString('base64').slice(0, 24)}`
        results.push({ id, text: `${title}. ${desc.slice(0, 200)}`, author: feed.source,
          username: feed.source.toLowerCase().replace(/\W+/g,''), created_at: pubDate })
      }
    } catch (e) { console.warn('[signal-alert] news feed failed:', feed.source, e) }
  }
  return results
}

// ─── Supplemental: Twitter (max 10, skip on any failure) ─────────────────────
async function fetchTweets(): Promise<Tweet[]> {
  if (!BEARER) return []
  try {
    const params = new URLSearchParams({
      query:          TWEET_QUERY,
      max_results:    '10',
      'tweet.fields': 'created_at,author_id,text',
      expansions:     'author_id',
      'user.fields':  'name,username',
    })
    const res = await fetch(
      `https://api.twitter.com/2/tweets/search/recent?${params}`,
      { headers: { Authorization: `Bearer ${BEARER}` }, signal: AbortSignal.timeout(8000) }
    )
    if (!res.ok) { console.warn('[signal-alert] Twitter skipped:', res.status); return [] }
    const data = await res.json() as any
    const users: Record<string, { name: string; username: string }> = {}
    for (const u of data.includes?.users ?? []) users[u.id] = { name: u.name, username: u.username }
    return (data.data ?? []).map((t: any) => ({
      id: t.id, text: t.text,
      author:     users[t.author_id]?.name ?? 'Unknown',
      username:   users[t.author_id]?.username ?? 'unknown',
      created_at: t.created_at,
    }))
  } catch (e) { console.warn('[signal-alert] Twitter error (skipping):', e); return [] }
}

// ─── Resend: get subscriber count ─────────────────────────────────────────────
async function getSubscriberCount(): Promise<number> {
  if (!RESEND_KEY || !AUDIENCE_ID) return 0
  try {
    const res = await fetch(`https://api.resend.com/audiences/${AUDIENCE_ID}/contacts`, {
      headers: { Authorization: `Bearer ${RESEND_KEY}` },
    })
    if (!res.ok) return 0
    const data = await res.json() as any
    return (data.data ?? []).filter((c: any) => !c.unsubscribed).length
  } catch { return 0 }
}

// ─── Resend: send broadcast ────────────────────────────────────────────────────
async function sendAlert(type: 'spike' | 'drop' | 'breaking', keyword: string, tweets: Tweet[], counts: { up: number; down: number; neutral: number; total: number }) {
  if (!RESEND_KEY || !AUDIENCE_ID) {
    console.log('[signal-alert] Resend not configured — skipping email')
    return false
  }

  const isSpike    = type === 'spike'
  const isFalling  = type === 'drop'
  const isBreaking = type === 'breaking'

  const subject = isSpike
    ? `⚠️ Grocery Price Spike Alert — prices rising fast`
    : isFalling
    ? `📉 Grocery Prices Dropping — prices falling`
    : `🚨 Breaking: ${keyword.charAt(0).toUpperCase() + keyword.slice(1)} affecting grocery prices`

  const headerColor  = isSpike ? '#ef4444' : isFalling ? '#22c55e' : '#f59e0b'
  const headerText   = isSpike
    ? '⚠️ Prices Rising Signal'
    : isFalling
    ? '📉 Prices Falling Signal'
    : `🚨 Breaking Signal: ${keyword.charAt(0).toUpperCase() + keyword.slice(1)}`

  const bodyText = isSpike
    ? `Our market signals show <strong>${counts.up} out of ${counts.total} recent grocery tweets</strong> indicate rising prices. Here's what people are saying right now:`
    : isFalling
    ? `Our market signals show <strong>${counts.down} out of ${counts.total} recent grocery tweets</strong> indicate falling prices. Here's what people are saying right now:`
    : `We detected a breaking signal — the word <strong>"${keyword}"</strong> appeared in multiple grocery price tweets. Here's what's happening:`

  const topTweets = tweets.slice(0, 5)
  const tweetCards = topTweets.map(t => `
    <div style="background:#1e293b;border-left:3px solid ${headerColor};border-radius:8px;padding:12px 16px;margin-bottom:10px">
      <div style="font-weight:700;color:#f1f5f9;font-size:13px">@${t.username}</div>
      <div style="color:#cbd5e1;font-size:13px;margin-top:6px;line-height:1.5">${t.text.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</div>
    </div>
  `).join('')

  const html = `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;background:#0b0d14;color:#f1f5f9;padding:32px;border-radius:12px">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:20px">
        <div style="width:10px;height:10px;border-radius:50%;background:${headerColor};flex-shrink:0"></div>
        <h2 style="margin:0;font-size:18px;color:${headerColor}">${headerText}</h2>
      </div>
      <p style="color:#94a3b8;margin:0 0 20px;line-height:1.6">${bodyText}</p>
      ${tweetCards}
      <div style="margin-top:24px;padding-top:20px;border-top:1px solid rgba(255,255,255,0.08)">
        <a href="${SITE}" style="display:inline-block;background:${headerColor};color:#fff;padding:10px 24px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px">
          View Live Prices →
        </a>
      </div>
      <p style="margin:24px 0 0;color:#334155;font-size:11px">
        You're receiving this because you subscribed at whatsthegrocerybill.com.
        <br>To unsubscribe, reply with "unsubscribe" in the subject.
      </p>
    </div>`

  // Resend broadcast to full audience
  const res = await fetch('https://api.resend.com/broadcasts', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      audience_id: AUDIENCE_ID,
      from:        `What's the Grocery Bill? <${FROM}>`,
      subject,
      html,
    }),
  })

  if (!res.ok) {
    console.error('[signal-alert] Resend broadcast failed:', res.status, await res.text())
    return false
  }

  // Send broadcast immediately
  const { id: broadcastId } = await res.json() as any
  if (broadcastId) {
    await fetch(`https://api.resend.com/broadcasts/${broadcastId}/send`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
  }

  console.log('[signal-alert] Alert sent:', type, keyword, '→ broadcast', broadcastId)
  return true
}

// ─── Main handler ──────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  // Fetch signals: news primary + Twitter supplemental in parallel
  const [newsSignals, twitterSignals] = await Promise.all([fetchNewsSignals(), fetchTweets()])
  const seenIds = new Set<string>()
  const tweets: Tweet[] = []
  for (const t of [...newsSignals, ...twitterSignals]) {
    if (!seenIds.has(t.id)) { seenIds.add(t.id); tweets.push(t) }
  }

  if (tweets.length === 0) {
    return NextResponse.json({ ok: true, action: 'no_signals' })
  }

  // Classify
  const classified = tweets.map(t => ({ ...t, sentiment: sentiment(t.text), breaking: hasBreaking(t.text) }))
  const up      = classified.filter(t => t.sentiment === 'up').length
  const down    = classified.filter(t => t.sentiment === 'down').length
  const neutral = classified.filter(t => t.sentiment === 'neutral').length
  const total   = classified.length
  const counts  = { up, down, neutral, total }

  const upRatio   = up / total
  const downRatio = down / total

  // Check for breaking keywords
  const breakingHits = classified.filter(t => t.breaking !== null)
  const topBreaking  = breakingHits[0]?.breaking ?? null

  const COOLDOWN_SECS = 60 * 60 * 12 // 12 hours

  const alerts: string[] = []

  // SPIKE: ≥50% of tweets are "up"
  if (upRatio >= 0.5) {
    const key = 'wtgb:signal-alert:spike'
    if (!(await kvExists(key))) {
      const upTweets = classified.filter(t => t.sentiment === 'up')
      const sent = await sendAlert('spike', 'price spike', upTweets, counts)
      if (sent) { await kvSet(key, 1, COOLDOWN_SECS); alerts.push('spike') }
    }
  }

  // DROP: ≥50% of tweets are "down"
  if (downRatio >= 0.5) {
    const key = 'wtgb:signal-alert:drop'
    if (!(await kvExists(key))) {
      const downTweets = classified.filter(t => t.sentiment === 'down')
      const sent = await sendAlert('drop', 'price drop', downTweets, counts)
      if (sent) { await kvSet(key, 1, COOLDOWN_SECS); alerts.push('drop') }
    }
  }

  // BREAKING: keyword found in ≥2 tweets (reduce false positives)
  if (topBreaking && breakingHits.length >= 2) {
    const key = `wtgb:signal-alert:breaking:${topBreaking.replace(/\s+/g, '_')}`
    if (!(await kvExists(key))) {
      const sent = await sendAlert('breaking', topBreaking, breakingHits, counts)
      if (sent) { await kvSet(key, 1, COOLDOWN_SECS); alerts.push(`breaking:${topBreaking}`) }
    }
  }

  return NextResponse.json({
    ok:      true,
    total,
    counts,
    ratios:  { up: Math.round(upRatio * 100), down: Math.round(downRatio * 100) },
    breaking: topBreaking,
    alerts_fired: alerts,
    alerts_skipped: alerts.length === 0
      ? [upRatio >= 0.5 ? 'spike_cooldown' : null, downRatio >= 0.5 ? 'drop_cooldown' : null].filter(Boolean)
      : [],
  })
}
