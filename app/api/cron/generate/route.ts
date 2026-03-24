import { NextRequest, NextResponse } from 'next/server'
import { generateArticle, toSlug, type Article } from '../../../../lib/articleUtils'
import { postTweetV2, buildArticleTweet } from '../../../../lib/twitterOAuth2'

export const dynamic = 'force-dynamic'
export const maxDuration = 300 // Vercel Pro: 300s max

const BEARER       = process.env.TWITTER_BEARER_TOKEN
const ANTHROPIC    = process.env.ANTHROPIC_API_KEY
const CRON_SECRET  = process.env.CRON_SECRET



const QUERY = '(grocery prices OR egg prices OR food prices OR grocery inflation OR "cost of groceries" OR "grocery bill" OR milk prices OR beef prices OR chicken prices OR bread prices) (rising OR up OR down OR high OR record OR surge OR drop OR inflation OR tariff OR cheaper) -is:retweet lang:en'
const UP_WORDS   = ['spike','surge','rise','rising','jump','soar','higher','increase','shortage','disruption','crisis','record','expensive','inflation','tariff','tax']
const DOWN_WORDS = ['drop','fall','decline','lower','decrease','cheap','cheapest','plunge','relief','ease','sale','discount','savings']

function sentimentScore(text: string): number {
  const t = text.toLowerCase()
  const up   = UP_WORDS.filter(w => t.includes(w)).length
  const down = DOWN_WORDS.filter(w => t.includes(w)).length
  return up - down
}

async function fetchAllPressureTweets() {
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
      author: users[t.author_id]?.name ?? 'Unknown',
      username: users[t.author_id]?.username ?? 'unknown',
      created_at: t.created_at,
      score: sentimentScore(t.text),
    }))
    .filter((t: any) => t.score > 0)
    .sort((a: any, b: any) => b.score - a.score)
}

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
  try {
    const { kv } = await import('@vercel/kv')
    await kv.lpush(key, value)
  } catch {}
}

export async function GET(req: NextRequest) {
  // Auth check for external cron calls
  const auth = req.headers.get('authorization')
  if (CRON_SECRET && auth !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  if (!BEARER || !ANTHROPIC) {
    return NextResponse.json({ error: 'missing_config' }, { status: 500 })
  }

  // 1. Fetch up to 100 tweets, ranked by sentiment score
  const tweets = await fetchAllPressureTweets()
  if (tweets.length === 0) {
    return NextResponse.json({ ok: false, note: 'no_pressure_signals' })
  }

  // 2. Skip tweets already in KV (don't regenerate)
  const newTweets = []
  for (const t of tweets.slice(0, 20)) {
    const tempSlug = `${t.id}` // quick dedup check by tweet ID prefix
    const exists   = await kvExists(`tweet:seen:${t.id}`)
    if (!exists) newTweets.push(t)
    if (newTweets.length >= 9) break // max 9 per run (3 batches × 3)
  }

  if (newTweets.length === 0) {
    return NextResponse.json({ ok: true, note: 'all_tweets_already_archived', stored: 0 })
  }

  // 3. Generate articles in batches of 3 (parallel within batch, serial between)
  const stored: Article[] = []
  const BATCH = 3
  for (let i = 0; i < newTweets.length; i += BATCH) {
    const batch = newTweets.slice(i, i + BATCH)
    const results = await Promise.allSettled(
      batch.map(t => generateArticle(t, ANTHROPIC!))
    )
    for (let j = 0; j < results.length; j++) {
      const r = results[j]
      if (r.status === 'fulfilled' && r.value) {
        const article: Article = { ...r.value, slug: toSlug(r.value.headline, r.value.id) }
        const key = `article:${article.slug}`
        await kvSet(key, article, 60 * 60 * 24 * 60)        // 60d TTL
        await kvLpush('articles:index', article.slug)         // append to archive index
        await kvSet(`tweet:seen:${batch[j].id}`, 1, 60 * 60 * 24 * 7) // 7d dedup
        stored.push(article)
      }
    }
  }

  // 4. Update articles:latest with the 3 freshest stored articles
  if (stored.length > 0) {
    await kvSet('articles:latest', stored.slice(0, 3), 60 * 60 * 2) // 2h homepage TTL
  }

  // 5. IndexNow — ping Bing/DDG/Yandex for instant indexing of new articles
  if (stored.length > 0) {
    try {
      const INDEXNOW_KEY = '1aad7dfecb3488df56e98b3335b912a3'
      const SITE = 'https://whatsthegrocerybill.com'
      const urlList = stored.map(a => `${SITE}/news/${a.slug}`)
      await fetch('https://api.indexnow.org/indexnow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({
          host: 'whatsthegrocerybill.com',
          key: INDEXNOW_KEY,
          keyLocation: `${SITE}/${INDEXNOW_KEY}.txt`,
          urlList,
        }),
      })
      console.log(`[generate] IndexNow pinged ${urlList.length} URLs`)
    } catch (e) {
      console.error('[generate] IndexNow failed:', e)
    }
  }

  // 6. Tweet each new article — stagger 8s apart to avoid rate limits
  const tweeted: { headline: string; tweet_id: string }[] = []

  for (const article of stored) {
    try {
      const tweetText = buildArticleTweet(article.headline, article.slug, article.tags ?? [])
      const result    = await postTweetV2(tweetText)
      if (result.id) {
        tweeted.push({ headline: article.headline, tweet_id: result.id })
        console.log(`[generate] tweeted ${result.id}: ${article.headline}`)
      } else {
        console.error('[generate] tweet failed:', result.error)
      }
      // Stagger — Twitter rate limit: 50 posts per 24h on Basic tier
      if (stored.indexOf(article) < stored.length - 1) {
        await new Promise(r => setTimeout(r, 8000))
      }
    } catch (e) {
      console.error('[generate] tweet error:', e)
    }
  }

  console.log(`[generate] stored ${stored.length} articles, tweeted ${tweeted.length}`)
  return NextResponse.json({
    ok: true,
    stored: stored.length,
    tweeted: tweeted.length,
    skipped: newTweets.length - stored.length,
    headlines: stored.map(a => a.headline),
    tweets: tweeted,
  })
}
