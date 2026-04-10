import { NextRequest, NextResponse } from 'next/server'
import { generateArticle, toSlug, type Article } from '../../../../lib/articleUtils'
import { pickAuthor } from '../../../../lib/authors'
import { postTweetV2, buildArticleTweet } from '../../../../lib/twitterOAuth2'
import { getArticleVideo } from '../../../../lib/youtubeUtils'
import { pingBingUrls } from '../../../../lib/bing-webmaster'

export const dynamic     = 'force-dynamic'
export const maxDuration = 300

const BEARER      = process.env.TWITTER_BEARER_TOKEN
const ANTHROPIC   = process.env.ANTHROPIC_API_KEY
const CRON_SECRET = process.env.CRON_SECRET

// ── Daily article cap ─────────────────────────────────────────────────────────
const DAILY_CAP_NORMAL   = 6   // 3–6 articles per day by default
const DAILY_CAP_TRENDING = 12  // unlock more if signals are very hot (avg score ≥ 3)
const TRENDING_THRESHOLD = 3

// ── Twitter signal config ─────────────────────────────────────────────────────
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

// ── News RSS feeds ────────────────────────────────────────────────────────────
const NEWS_FEEDS = [
  { url: 'https://feeds.reuters.com/reuters/businessNews', source: 'Reuters Business' },
  { url: 'https://news.google.com/rss/search?q=grocery+prices+OR+food+inflation+OR+egg+prices+OR+supermarket+prices+US&hl=en-US&gl=US&ceid=US:en', source: 'Google News' },
  { url: 'https://www.usda.gov/rss/home.xml', source: 'USDA' },
  { url: 'https://progressivegrocer.com/rss.xml', source: 'Progressive Grocer' },
  { url: 'https://www.supermarketnews.com/rss/all', source: 'Supermarket News' },
]

const GROCERY_KEYWORDS = [
  'grocery','groceries','supermarket','food price','egg price','milk price',
  'beef price','chicken price','bread price','produce price','food inflation',
  'cost of food','food cost','grocery bill','walmart','kroger','aldi',
  'food stamp','snap','usda','agriculture','farm price','commodity price',
]

async function fetchNewsSignals(): Promise<Array<{
  id: string; text: string; author: string; username: string; created_at: string; score: number
}>> {
  const signals: Array<{ id: string; text: string; author: string; username: string; created_at: string; score: number }> = []

  for (const feed of NEWS_FEEDS) {
    try {
      const res = await fetch(feed.url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; WTGBBot/1.0; +https://whatsthegrocerybill.com)' },
        signal: AbortSignal.timeout(8000),
      })
      if (!res.ok) continue
      const xml = await res.text()

      const itemMatches = xml.matchAll(/<item>([\s\S]*?)<\/item>/g)
      for (const m of itemMatches) {
        const block   = m[1]
        const title   = (block.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1]
                      ?? block.match(/<title>(.*?)<\/title>/)?.[1] ?? '').trim()
        const desc    = (block.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/)?.[1]
                      ?? block.match(/<description>(.*?)<\/description>/)?.[1] ?? '').replace(/<[^>]+>/g, '').trim()
        const pubDate = block.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] ?? new Date().toISOString()
        if (!title) continue

        const combined = `${title} ${desc}`.toLowerCase()
        const relevant = GROCERY_KEYWORDS.some(kw => combined.includes(kw))
        if (!relevant) continue

        const score = sentimentScore(`${title} ${desc}`)
        if (score === 0) continue

        const id   = `news_${Buffer.from(title).toString('base64').slice(0, 32)}`
        const text = desc ? `${title}. ${desc.slice(0, 200)}` : title

        signals.push({
          id, text, author: feed.source,
          username: feed.source.toLowerCase().replace(/\W+/g, ''),
          created_at: pubDate, score,
        })
      }
    } catch (e) {
      console.warn(`[generate] news feed failed: ${feed.source}`, e)
    }
  }

  return signals.sort((a, b) => Math.abs(b.score) - Math.abs(a.score))
}

// Twitter is a supplemental signal only — max 15 results, skip gracefully on any error
async function fetchSignalTweets(): Promise<Array<{
  id: string; text: string; author: string; username: string; created_at: string; score: number
}>> {
  if (!BEARER) return []
  try {
    const params = new URLSearchParams({
      query: QUERY, max_results: '15',
      'tweet.fields': 'created_at,author_id',
      expansions: 'author_id', 'user.fields': 'username,name',
    })
    const res = await fetch(`https://api.twitter.com/2/tweets/search/recent?${params}`, {
      headers: { Authorization: `Bearer ${BEARER}` },
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) {
      console.warn('[generate] Twitter fetch skipped:', res.status)
      return []
    }
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
      .filter((t: any) => t.score !== 0)
      .sort((a: any, b: any) => Math.abs(b.score) - Math.abs(a.score))
  } catch (e) {
    console.warn('[generate] Twitter fetch error (skipping):', e)
    return []
  }
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

// ─── KV helpers ───────────────────────────────────────────────────────────────
async function kvGet<T>(key: string): Promise<T | null> {
  try { const { kv } = await import('@vercel/kv'); return await kv.get<T>(key) }
  catch { return null }
}

// ─── Main handler ─────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (CRON_SECRET && auth !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  if (!ANTHROPIC) {
    return NextResponse.json({ error: 'missing_anthropic_key' }, { status: 500 })
  }

  // ── Daily cap check ───────────────────────────────────────────────────────
  const today         = new Date().toISOString().slice(0, 10)
  const dailyCountKey = `wtgb:daily:count:${today}`
  const dailyCount    = (await kvGet<number>(dailyCountKey)) ?? 0

  // Google News RSS is primary. Twitter is supplemental — runs in parallel but skipped on failure.
  const [newsSignals, tweetSignals] = await Promise.all([
    fetchNewsSignals(),
    fetchSignalTweets(),
  ])

  // Merge: news first (primary), Twitter supplements; deduplicate by id
  const seenIds = new Set<string>()
  const allSignals: typeof tweetSignals = []
  for (const s of [...newsSignals, ...tweetSignals]) {
    if (!seenIds.has(s.id)) { seenIds.add(s.id); allSignals.push(s) }
  }

  if (allSignals.length === 0) {
    return NextResponse.json({ ok: false, note: 'no_signals', sources: { twitter: tweetSignals.length, news: newsSignals.length } })
  }

  // Determine if we're in trending mode
  const topScores   = allSignals.slice(0, 5).map(s => Math.abs(s.score))
  const avgTopScore = topScores.reduce((a, b) => a + b, 0) / (topScores.length || 1)
  const isTrending  = avgTopScore >= TRENDING_THRESHOLD
  const dailyCap    = isTrending ? DAILY_CAP_TRENDING : DAILY_CAP_NORMAL
  const remaining   = Math.max(0, dailyCap - dailyCount)

  if (remaining === 0) {
    return NextResponse.json({ ok: true, note: 'daily_cap_reached', dailyCap, dailyCount, isTrending })
  }

  // Per-run limit: max 3 at a time
  const perRunLimit = Math.min(3, remaining)

  // Deduplicate against already-seen signals
  const newSignals: typeof allSignals = []
  for (const s of allSignals.slice(0, 30)) {
    if (await kvExists(`wtgb:signal:seen:${s.id}`)) continue
    newSignals.push(s)
    if (newSignals.length >= perRunLimit) break
  }

  if (newSignals.length === 0) {
    return NextResponse.json({ ok: true, note: 'all_signals_already_seen', stored: 0, dailyCount })
  }

  // ── Generate articles ─────────────────────────────────────────────────────
  const articleAuthors = newSignals.map(s => pickAuthor(s.score > 0 ? 'rising' : 'falling', s.text))
  const results = await Promise.allSettled(
    newSignals.map((s, i) => generateArticle(s, ANTHROPIC!, s.score > 0 ? 'rising' : 'falling', articleAuthors[i].promptPersona))
  )

  const stored: Article[] = []
  for (let i = 0; i < results.length; i++) {
    const r = results[i]
    if (r.status !== 'fulfilled' || !r.value) continue
    const article: Article = { ...r.value, author: articleAuthors[i].name, slug: toSlug(r.value.headline, r.value.id), publishedAt: new Date().toISOString() }
    await kvSet(`wtgb:article:${article.slug}`, article, 60 * 60 * 24 * 60)
    await kvLpush('wtgb:articles:index', article.slug)
    await kvSet(`wtgb:signal:seen:${newSignals[i].id}`, 1, 60 * 60 * 24 * 7)
    stored.push(article)
  }

  // ── Update daily counter ──────────────────────────────────────────────────
  if (stored.length > 0) {
    const newCount = dailyCount + stored.length
    await kvSet(dailyCountKey, newCount, 60 * 60 * 28)
    await kvSet('wtgb:articles:latest', stored.slice(0, 3), 60 * 60 * 2)
  }

  // ── Pre-warm YouTube video cache ──────────────────────────────────────────
  for (const article of stored) {
    try { await getArticleVideo(article.slug, article.headline, article.tags ?? []) } catch {}
  }

  // ── IndexNow + Bing Webmaster ───────────────────────────────────────────
  if (stored.length > 0) {
    const INDEXNOW_KEY = '1aad7dfecb3488df56e98b3335b912a3'
    const SITE = 'https://whatsthegrocerybill.com'
    const publishedUrls = stored.map(a => `${SITE}/news/${a.slug}`)
    try {
      await fetch('https://api.indexnow.org/indexnow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({
          host: 'whatsthegrocerybill.com',
          key: INDEXNOW_KEY,
          keyLocation: `${SITE}/${INDEXNOW_KEY}.txt`,
          urlList: publishedUrls,
        }),
      })
    } catch (e) { console.error('[generate] IndexNow failed:', e) }
    await pingBingUrls(publishedUrls, SITE)
  }

  console.log(`[generate] stored ${stored.length} | daily ${dailyCount + stored.length}/${dailyCap} | trending=${isTrending} | sources: twitter=${tweetSignals.length} news=${newsSignals.length}`)
  return NextResponse.json({
    ok: true,
    stored: stored.length,
    dailyCount: dailyCount + stored.length,
    dailyCap,
    isTrending,
    remaining: remaining - stored.length,
    sources: { twitter: tweetSignals.length, news: newsSignals.length },
    directions: newSignals.slice(0, stored.length).map(s => s.score > 0 ? 'rising' : 'falling'),
    headlines: stored.map(a => a.headline),
  })
}
