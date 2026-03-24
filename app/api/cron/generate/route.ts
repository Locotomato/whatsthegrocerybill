import { NextRequest, NextResponse } from 'next/server'
import { generateArticle, toSlug, type Article } from '../../../../lib/articleUtils'
import { postTweetV2, buildArticleTweet } from '../../../../lib/twitterOAuth2'
import { getArticleVideo } from '../../../../lib/youtubeUtils'

export const dynamic     = 'force-dynamic'
export const maxDuration = 300

const BEARER      = process.env.TWITTER_BEARER_TOKEN
const ANTHROPIC   = process.env.ANTHROPIC_API_KEY
const CRON_SECRET = process.env.CRON_SECRET

const QUERY = '(grocery prices OR egg prices OR food prices OR grocery inflation OR "cost of groceries" OR "grocery bill" OR milk prices OR beef prices OR chicken prices OR bread prices) (rising OR up OR down OR high OR record OR surge OR drop OR inflation OR tariff OR cheaper OR falling OR lower OR relief OR expensive) -is:retweet lang:en'

const UP_WORDS   = ['spike','surge','rise','rising','jump','soar','higher','increase','shortage',
                    'disruption','crisis','record','expensive','inflation','tariff','tax','worst','all-time']
const DOWN_WORDS = ['drop','fall','falling','decline','lower','decrease','cheap','cheapest','plunge',
                    'relief','ease','sale','discount','savings','cheaper','down','affordable']

/** Positive score = rising pressure. Negative score = falling pressure. */
function sentimentScore(text: string): number {
  const t = text.toLowerCase()
  const up   = UP_WORDS.filter(w => t.includes(w)).length
  const down = DOWN_WORDS.filter(w => t.includes(w)).length
  return up - down
}

async function fetchSignalTweets() {
  if (!BEARER) return []
  const params = new URLSearchParams({
    query: QUERY, max_results: '100',
    'tweet.fields': 'created_at,author_id,public_metrics',
    expansions: 'author_id', 'user.fields': 'username,name',
  })
  const res = await fetch(`https://api.twitter.com/2/tweets/search/recent?${params}`, {
    headers: { Authorization: `Bearer ${BEARER}` },
  })
  if (!res.ok) return []
  const json = await res.json() as any
  const users: Record<string, { name: string; username: string }> = {}
  for (const u of json.includes?.users ?? []) users[u.id] = u

  return (json.data ?? [])
    .map((t: any) => ({
      id: t.id, text: t.text,
      author:    users[t.author_id]?.name     ?? 'Unknown',
      username:  users[t.author_id]?.username ?? 'unknown',
      created_at: t.created_at,
      score: sentimentScore(t.text),
    }))
    .filter((t: any) => t.score !== 0)           // must have a clear direction
    .sort((a: any, b: any) => Math.abs(b.score) - Math.abs(a.score)) // strongest signal first
}

// ─── KV helpers ───────────────────────────────────────────────────────────────
async function kvSet(key: string, value: unknown, ex?: number) {
  try {
    const { kv } = await import('@vercel/kv')
    if (ex) await kv.set(key, value, { ex })
    else    await kv.set(key, value)
  } catch (e) { console.error('[generate] kv.set failed:', e) }
}
async function kvExists(key: string): Promise<boolean> {
  try {
    const { kv } = await import('@vercel/kv')
    return (await kv.exists(key)) > 0
  } catch { return false }
}
async function kvLpush(key: string, value: string) {
  try { const { kv } = await import('@vercel/kv'); await kv.lpush(key, value) } catch {}
}

// ─── Main handler ─────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (CRON_SECRET && auth !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  if (!BEARER || !ANTHROPIC) {
    return NextResponse.json({ error: 'missing_config' }, { status: 500 })
  }

  // 1. Fetch all signal tweets (rising + falling), ranked by abs(score)
  const allTweets = await fetchSignalTweets()
  if (allTweets.length === 0) {
    return NextResponse.json({ ok: false, note: 'no_signals' })
  }

  // 2. Deduplicate against seen tweets — max 3 new per run
  const newTweets: typeof allTweets = []
  for (const t of allTweets.slice(0, 30)) {
    if (await kvExists(`wtgb:tweet:seen:${t.id}`)) continue
    newTweets.push(t)
    if (newTweets.length >= 3) break
  }

  if (newTweets.length === 0) {
    return NextResponse.json({ ok: true, note: 'all_tweets_already_seen', stored: 0 })
  }

  // 3. Generate all 3 in parallel
  const results = await Promise.allSettled(
    newTweets.map((t: typeof newTweets[number]) => generateArticle(t, ANTHROPIC!, t.score > 0 ? 'rising' : 'falling'))
  )

  const stored: Article[] = []
  for (let i = 0; i < results.length; i++) {
    const r = results[i]
    if (r.status !== 'fulfilled' || !r.value) continue
    const article: Article = { ...r.value, slug: toSlug(r.value.headline, r.value.id) }
    const key = `wtgb:article:${article.slug}`
    await kvSet(key, article, 60 * 60 * 24 * 60)              // 60d TTL
    await kvLpush('wtgb:articles:index', article.slug)
    await kvSet(`wtgb:tweet:seen:${newTweets[i].id}`, 1, 60 * 60 * 24 * 7)
    stored.push(article)
  }

  // 4. Update homepage latest cache (3 freshest)
  if (stored.length > 0) {
    await kvSet('wtgb:articles:latest', stored.slice(0, 3), 60 * 60 * 2)
  }

  // 4b. Pre-warm YouTube video cache at generation time (not on first page load)
  //     This burns quota once per article at generation, not on every ISR revalidation.
  for (const article of stored) {
    try {
      await getArticleVideo(article.slug, article.headline, article.tags ?? [])
    } catch { /* non-fatal */ }
  }

  // 5. IndexNow — instant indexing on Bing/DDG/Yandex
  if (stored.length > 0) {
    try {
      const INDEXNOW_KEY = '1aad7dfecb3488df56e98b3335b912a3'
      const SITE = 'https://whatsthegrocerybill.com'
      await fetch('https://api.indexnow.org/indexnow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({
          host: 'whatsthegrocerybill.com',
          key: INDEXNOW_KEY,
          keyLocation: `${SITE}/${INDEXNOW_KEY}.txt`,
          urlList: stored.map(a => `${SITE}/news/${a.slug}`),
        }),
      })
    } catch (e) { console.error('[generate] IndexNow failed:', e) }
  }

  // 6. Queue articles for daily tweet — generate is SEO-only, tweet cron handles distribution
  for (const article of stored) {
    // Already stored in wtgb:articles:index — tweet cron picks best one daily
  }

  return NextResponse.json({
    ok: true,
    stored: stored.length,
    skipped: newTweets.length - stored.length,
    directions: newTweets.slice(0, stored.length).map((t: typeof newTweets[number]) => t.score > 0 ? 'rising' : 'falling'),
    headlines: stored.map(a => a.headline),
  })
}
