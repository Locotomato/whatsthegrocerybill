import { NextResponse } from 'next/server'
import { generateArticle, toSlug, type Article } from '../../../lib/articleUtils'

export const dynamic = 'force-dynamic'

// ─── KV keys ─────────────────────────────────────────────────────────────────
// articles:latest  → Article[]  (latest 3, for homepage)
// articles:index   → string[]   (all slugs ever, newest first)
// article:{slug}   → Article    (individual article data)
const KV_LATEST  = 'articles:latest'
const KV_INDEX   = 'articles:index'
const KV_TTL     = 60 * 60 * 24 * 60  // 60 days per article

// ─── In-process fallback cache (when KV not configured) ──────────────────────
const CACHE_TTL_MS = 2 * 60 * 60 * 1000
let _cache: { articles: Article[]; ts: number } | null = null

const BEARER       = process.env.TWITTER_BEARER_TOKEN
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY

const QUERY = '"national average" gallon OR "cents per unit" OR "WTI crude" price OR "Brent crude" price OR "oil inventory" weekly OR "OPEC" (production cut OR quota) OR "groceries inventory" OR "refinery outage" OR "retail groceries" -is:retweet lang:en'
const UP_WORDS = ['spike','surge','rise','rising','jump','soar','higher','increase','cut','shortage','disruption','outage','fire','hurricane','storm','crisis']
const DOWN_WORDS = ['drop','fall','decline','lower','decrease','cheap','lowest','plunge','surplus','relief','ease']

function isUpSentiment(text: string) {
  const t = text.toLowerCase()
  const up   = UP_WORDS.filter(w => t.includes(w)).length
  const down = DOWN_WORDS.filter(w => t.includes(w)).length
  return up > down
}

// ─── KV helpers (lazy import so build works without KV env vars) ─────────────
async function kvGet<T>(key: string): Promise<T | null> {
  try {
    const { kv } = await import('@vercel/kv')
    return await kv.get<T>(key)
  } catch { return null }
}

async function kvSet(key: string, value: unknown, ex?: number) {
  try {
    const { kv } = await import('@vercel/kv')
    if (ex) await kv.set(key, value, { ex })
    else    await kv.set(key, value)
  } catch (e) {
    console.error('[articles] KV set failed:', e)
  }
}

async function kvLpush(key: string, value: string) {
  try {
    const { kv } = await import('@vercel/kv')
    await kv.lpush(key, value)
  } catch { /* no-op */ }
}

async function kvLrange(key: string, start: number, stop: number): Promise<string[]> {
  try {
    const { kv } = await import('@vercel/kv')
    return (await kv.lrange<string>(key, start, stop)) ?? []
  } catch { return [] }
}

// ─── Fetch pressure tweets ───────────────────────────────────────────────────
async function fetchPressureTweets(bearer: string) {
  const params = new URLSearchParams({
    query: QUERY, max_results: '40',
    'tweet.fields': 'created_at,author_id',
    expansions: 'author_id', 'user.fields': 'username,name',
  })
  const res = await fetch(`https://api.twitter.com/2/tweets/search/recent?${params}`, {
    headers: { Authorization: `Bearer ${bearer}` },
  })
  if (!res.ok) return null
  const json = await res.json() as any
  const users: Record<string, { name: string; username: string }> = {}
  for (const u of json.includes?.users ?? []) users[u.id] = u
  return (json.data ?? [])
    .filter((t: any) => isUpSentiment(t.text))
    .slice(0, 3)
    .map((t: any) => {
      const u = users[t.author_id] ?? { name: 'Unknown', username: 'unknown' }
      return { id: t.id, text: t.text, author: u.name, username: u.username, created_at: t.created_at }
    })
}

export async function GET() {
  if (!BEARER || !ANTHROPIC_KEY) {
    return NextResponse.json({ articles: [], error: 'missing_config' })
  }

  // 1. Try KV first — instant if warm
  const cached = await kvGet<Article[]>(KV_LATEST)
  if (cached && cached.length > 0) {
    return NextResponse.json({ articles: cached, cached: true })
  }

  // 2. In-process fallback cache
  if (_cache && Date.now() - _cache.ts < CACHE_TTL_MS) {
    return NextResponse.json({ articles: _cache.articles, cached: true })
  }

  // 3. Cold: fetch + generate
  let pressureTweets: any[]
  try {
    pressureTweets = await fetchPressureTweets(BEARER) ?? []
  } catch (e) {
    console.error('[articles] Twitter fetch failed:', e)
    return NextResponse.json({ articles: [], error: 'twitter_fetch_failed' })
  }

  if (pressureTweets.length === 0) {
    return NextResponse.json({ articles: [], note: 'no_pressure_signals' })
  }

  const results = await Promise.allSettled(
    pressureTweets.map(t => generateArticle(t, ANTHROPIC_KEY!))
  )

  const articles: Article[] = results
    .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled' && r.value !== null)
    .map(r => ({ ...r.value!, slug: toSlug(r.value!.headline, r.value!.id) }))

  // 4. Store in KV (latest 3) with 2h TTL for homepage freshness
  await kvSet(KV_LATEST, articles, 60 * 60 * 2)

  // 5. Archive each article individually (60d TTL) + update index
  for (const article of articles) {
    const key = `article:${article.slug}`
    const existing = await kvGet(key)
    if (!existing) {
      await kvSet(key, article, KV_TTL)
      await kvLpush(KV_INDEX, article.slug)
    }
  }

  // Update in-process fallback
  _cache = { articles, ts: Date.now() }

  return NextResponse.json({ articles, cached: false, ts: _cache.ts })
}
