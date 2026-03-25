import { NextRequest, NextResponse } from 'next/server'
import { postTweet, buildArticleTweet } from '../../../../lib/twitterPost'
import type { Article } from '../../../../lib/articleUtils'

export const dynamic = 'force-dynamic'

async function kvGet<T>(key: string): Promise<T | null> {
  try {
    const { kv } = await import('@vercel/kv')
    return await kv.get<T>(key)
  } catch { return null }
}

async function kvExists(key: string): Promise<boolean> {
  try {
    const { kv } = await import('@vercel/kv')
    const v = await kv.get(key)
    return v !== null
  } catch { return false }
}

async function kvSet(key: string, value: unknown, ex: number) {
  try {
    const { kv } = await import('@vercel/kv')
    await kv.set(key, value, { ex })
  } catch { /* no-op */ }
}

// ─── Cron handler ─────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://whatsthegrocerybill.com'

  // 1. Get recent article slugs
  const { kv } = await import('@vercel/kv')
  const slugs = await kv.lrange<string>('wtgb:articles:index', 0, 19)
  if (!slugs || slugs.length === 0) {
    return NextResponse.json({ ok: false, note: 'no_articles' })
  }

  // 2. Find an article we haven't tweeted yet
  let articleToTweet: Article | null = null
  let chosenSlug = ''

  for (const slug of slugs) {
    const alreadyTweeted = await kvExists(`wtgb:tweeted:${slug}`)
    if (!alreadyTweeted) {
      articleToTweet = await kvGet<Article>(`wtgb:article:${slug}`)
      if (articleToTweet) {
        chosenSlug = slug
        break
      }
    }
  }

  if (!articleToTweet) {
    return NextResponse.json({ ok: false, note: 'all_articles_tweeted' })
  }

  // 3. Build tweet text using OAuth 1.0a builder (includes newsletter CTA)
  const final = buildArticleTweet(articleToTweet.headline, chosenSlug, articleToTweet.tags ?? [])

  // 4. Post via OAuth 1.0a (@wtgbofficial)
  const secrets = {
    apiKey:      process.env.TWITTER_API_KEY!,
    apiSecret:   process.env.TWITTER_API_SECRET!,
    token:       process.env.TWITTER_ACCESS_TOKEN!,
    tokenSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET!,
  }
  const result = await postTweet(final, secrets)

  if (result.error) {
    console.error('[cron/tweet] post failed:', result.error)
    return NextResponse.json({ ok: false, error: result.error })
  }

  // 5. Mark as tweeted (30 days)
  await kvSet(`wtgb:tweeted:${chosenSlug}`, result.id, 60 * 60 * 24 * 30)

  console.log(`[cron/tweet] posted tweet ${result.id}: ${final}`)
  return NextResponse.json({ ok: true, tweet_id: result.id, text: final, slug: chosenSlug })
}
