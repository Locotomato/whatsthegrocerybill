import { NextRequest, NextResponse } from 'next/server'
import { generateSourcedArticle, toSlug, type Article } from '../../../../lib/articleUtils'
import { decodeEntities, readSource } from '../../../../lib/sourcedDraft'
import { postTweetV2, buildArticleTweet } from '../../../../lib/twitterOAuth2'
import { getArticleVideo } from '../../../../lib/youtubeUtils'
import { pingBingUrls } from '../../../../lib/bing-webmaster'

export const dynamic     = 'force-dynamic'
export const maxDuration = 300

const ANTHROPIC   = process.env.ANTHROPIC_API_KEY
const CRON_SECRET = process.env.CRON_SECRET

// ── Daily article cap ─────────────────────────────────────────────────────────
const DAILY_CAP_NORMAL   = 6   // 3–6 articles per day by default
const DAILY_CAP_TRENDING = 12  // unlock more if signals are very hot (avg score ≥ 3)
const TRENDING_THRESHOLD = 3

const MAX_SOURCE_AGE_DAYS = 10
const MAX_DRAFTS_PER_RUN = 5
const MAX_RESOLVE_FAILURES = 3 // Google refuses some Vercel IPs, so stop asking after a few
const RUN_TIME_BUDGET_MS = 200_000
const SEEN_TTL_SECONDS = 60 * 60 * 24 * 120 // longer than an article lives, so stories don't repeat

// ── Signal scoring ────────────────────────────────────────────────────────────
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
  { url: 'https://news.google.com/rss/search?q=grocery+prices+OR+food+inflation+OR+egg+prices+OR+supermarket+prices+US+when:7d&hl=en-US&gl=US&ceid=US:en', source: 'Google News' },
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

type Signal = { id: string; title: string; link: string; feed: string; pubDate: Date | null; score: number }

async function fetchNewsSignals(): Promise<Signal[]> {
  const signals: Signal[] = []

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
        const published = new Date(block.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] ?? '')
        const link    = (block.match(/<link>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/link>/)?.[1] ?? '').trim()
        if (!title || !link) continue

        const combined = `${title} ${desc}`.toLowerCase()
        const relevant = GROCERY_KEYWORDS.some(kw => combined.includes(kw))
        if (!relevant) continue

        const score = sentimentScore(`${title} ${desc}`)
        if (score === 0) continue

        const id = `news_${Buffer.from(title).toString('base64').slice(0, 32)}`

        signals.push({
          id, title: decodeEntities(title), link: decodeEntities(link), feed: feed.source,
          pubDate: isNaN(published.getTime()) ? null : published, score,
        })
      }
    } catch (e) {
      console.warn(`[generate] news feed failed: ${feed.source}`, e)
    }
  }

  return signals.sort((a, b) => Math.abs(b.score) - Math.abs(a.score))
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

  const signals = await fetchNewsSignals()

  // Old items were being rewritten as if they were current news.
  const isFresh = (s: Signal) => s.pubDate !== null && (Date.now() - s.pubDate.getTime()) / 86_400_000 <= MAX_SOURCE_AGE_DAYS
  const allSignals = signals.filter(isFresh)
  const skipped = { stale: signals.length - allSignals.length, seen: 0, unreadable: 0 }

  if (allSignals.length === 0) {
    return NextResponse.json({ ok: false, note: 'no_signals', news: signals.length, skipped })
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

  // Per-run limit: max 2 at a time (LOC-382: capped to 1-2 per run until quality bar met)
  const perRunLimit = Math.min(2, remaining)

  // ── Generate articles ─────────────────────────────────────────────────────
  // A failed draft publishes nothing. Its signal stays seen so it isn't drafted again.
  const stored: Article[] = []
  const startedAt = Date.now()
  let drafts = 0
  let resolveFailures = 0
  for (const s of allSignals) {
    if (stored.length >= perRunLimit || drafts >= MAX_DRAFTS_PER_RUN || Date.now() - startedAt > RUN_TIME_BUDGET_MS) break
    if (await kvExists(`wtgb:signal:seen:${s.id}`)) { skipped.seen++; continue }

    // An unreadable source may work on a later run, so it isn't marked seen.
    if (resolveFailures >= MAX_RESOLVE_FAILURES && s.link.includes('news.google.com')) { skipped.unreadable++; continue }
    const source = await readSource(s.link)
    if (!source.ok) {
      console.warn(`[generate] Skipped "${s.title}": ${source.reason}`)
      if (source.reason === 'could not resolve publisher URL') resolveFailures++
      skipped.unreadable++
      continue
    }
    await kvSet(`wtgb:signal:seen:${s.id}`, 1, SEEN_TTL_SECONDS)

    drafts++
    const generated = await generateSourcedArticle({ ...s, pubDate: s.pubDate as Date }, source.value)
    if (!generated) continue

    const article: Article = { ...generated, slug: toSlug(generated.headline, generated.id) }
    await kvSet(`wtgb:article:${article.slug}`, article, 60 * 60 * 24 * 60)
    await kvLpush('wtgb:articles:index', article.slug)
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
    // Ping Google sitemap so GSC re-crawls sooner
    try {
      await fetch(`https://www.google.com/ping?sitemap=${SITE}/sitemap.xml`)
    } catch (e) { console.error('[generate] Google sitemap ping failed:', e) }
  }

  console.log(`[generate] stored ${stored.length} of ${drafts} drafts | daily ${dailyCount + stored.length}/${dailyCap} | trending=${isTrending} | news=${signals.length}`)
  return NextResponse.json({
    ok: true,
    stored: stored.length,
    dailyCount: dailyCount + stored.length,
    dailyCap,
    isTrending,
    remaining: remaining - stored.length,
    drafts,
    news: signals.length,
    skipped,
    headlines: stored.map(a => a.headline),
  })
}
