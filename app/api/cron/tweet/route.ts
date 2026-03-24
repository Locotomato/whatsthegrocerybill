import { NextRequest, NextResponse } from 'next/server'
import { postTweetV2 } from '../../../../lib/twitterOAuth2'
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

  // 3. Build tweet text
  const url    = `${siteUrl}/news/${chosenSlug}`
  const tags   = (articleToTweet.tags ?? []).slice(0, 2).map(t => `#${t.replace(/\s+/g, '')}`).join(' ')
  const tweet  = `${articleToTweet.headline}\n\n${url}\n\n${tags} #GroceryPrices`
  const final  = tweet.length <= 280 ? tweet : `${articleToTweet.headline}\n\n${url}\n\n#GroceryPrices`

  // 4. Post via OAuth 2.0
  const result = await postTweetV2(final)

  if (result.error) {
    console.error('[cron/tweet] post failed:', result.error)
    return NextResponse.json({ ok: false, error: result.error })
  }

  // 5. Mark as tweeted (30 days)
  await kvSet(`wtgb:tweeted:${chosenSlug}`, result.id, 60 * 60 * 24 * 30)

  console.log(`[cron/tweet] posted tweet ${result.id}: ${final}`)
  return NextResponse.json({ ok: true, tweet_id: result.id, text: final, slug: chosenSlug })
}
