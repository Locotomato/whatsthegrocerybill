/**
 * /api/cron/follow — runs once daily
 *
 * Follows 1–2 real people per day who are actively talking about grocery prices.
 * Conservative by design — learned from WTPOG ban.
 *
 * Rules:
 * - Max 2 follows per run, hard stop
 * - Targets: 100–50K followers, not bots/news/brand accounts
 * - KV dedup: never follow the same user twice (30-day window)
 * - No unfollows, no replies, no likes — follows only
 */

import { NextRequest, NextResponse } from 'next/server'
import { followUserV2 } from '../../../../lib/twitterOAuth2'
import { kv } from '@vercel/kv'

export const dynamic     = 'force-dynamic'
export const maxDuration = 60

const BEARER      = process.env.TWITTER_BEARER_TOKEN!
const CRON_SECRET = process.env.CRON_SECRET
const MY_USER_ID  = process.env.WTGB_TWITTER_USER_ID ?? ''

const MAX_FOLLOWS = 2

// Real people talking about grocery costs — mix of pain points and topics
const SEARCH_QUERIES = [
  '"grocery bill" (shocked OR high OR unbelievable OR expensive) -is:retweet lang:en',
  '"grocery prices" (killing me OR ridiculous OR can\'t afford) -is:retweet lang:en',
  '"food prices" (rising OR inflation OR tariff OR insane) -is:retweet lang:en',
  '"egg prices" (why OR high OR crazy) -is:retweet lang:en',
  '"cost of groceries" -is:retweet lang:en',
]

// Skip obvious bots, news orgs, brand accounts
function isRealPerson(username: string, name: string): boolean {
  const u = username.toLowerCase()
  const n = name.toLowerCase()
  const skipWords = ['news', 'bot', 'official', 'media', 'deal', 'coupon', 'price', 'alert', 'stock', 'finance', 'crypto', 'nft', 'shop', 'store', 'market']
  return !skipWords.some(w => u.includes(w) || n.includes(w))
}

async function searchTweets(query: string) {
  const params = new URLSearchParams({
    query,
    max_results: '15',
    'tweet.fields': 'author_id',
    expansions: 'author_id',
    'user.fields': 'username,name,public_metrics',
  })
  const res = await fetch(
    `https://api.twitter.com/2/tweets/search/recent?${params}`,
    { headers: { Authorization: `Bearer ${BEARER}` } }
  )
  if (!res.ok) return []
  const json = await res.json() as any
  const users: Record<string, any> = {}
  for (const u of (json.includes?.users ?? [])) users[u.id] = u
  return (json.data ?? []).map((t: any) => {
    const user = users[t.author_id] ?? {}
    return {
      authorId: t.author_id,
      username: user.username ?? '',
      name: user.name ?? '',
      followers: user.public_metrics?.followers_count ?? 0,
    }
  })
}

export async function GET(req: NextRequest) {
  if (CRON_SECRET && req.headers.get('authorization') !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  if (!BEARER) return NextResponse.json({ error: 'missing TWITTER_BEARER_TOKEN' }, { status: 500 })
  if (!MY_USER_ID) return NextResponse.json({ error: 'missing WTGB_TWITTER_USER_ID' }, { status: 500 })

  const followed: string[] = []
  const errors:   string[] = []

  // Shuffle queries so we don't always hit the same one
  const queries = [...SEARCH_QUERIES].sort(() => Math.random() - 0.5)

  outer: for (const query of queries) {
    let tweets: Awaited<ReturnType<typeof searchTweets>>
    try {
      tweets = await searchTweets(query)
    } catch (e: any) {
      errors.push(`search: ${e.message}`)
      continue
    }

    // Filter to real people with reasonable follower counts
    const candidates = tweets.filter((t: { followers: number; authorId: string; username: string; name: string }) =>
      t.followers >= 100 &&
      t.followers <= 50000 &&
      t.authorId !== MY_USER_ID &&
      isRealPerson(t.username, t.name)
    )

    for (const candidate of candidates) {
      if (followed.length >= MAX_FOLLOWS) break outer

      const dedupKey = `wtgb:follow:done:${candidate.authorId}`
      const alreadyFollowed = await kv.exists(dedupKey)
      if (alreadyFollowed) continue

      try {
        const ok = await followUserV2(candidate.authorId, MY_USER_ID)
        if (ok) {
          // 30-day dedup so we don't re-follow
          await kv.set(dedupKey, 1, { ex: 60 * 60 * 24 * 30 })
          followed.push(candidate.username)
          // Small delay between follows
          await new Promise(r => setTimeout(r, 2000))
        } else {
          errors.push(`follow @${candidate.username}: api returned false`)
        }
      } catch (e: any) {
        errors.push(`follow @${candidate.username}: ${e.message}`)
      }
    }

    // Small delay between search queries
    await new Promise(r => setTimeout(r, 1500))
  }

  return NextResponse.json({
    ok: true,
    followed: followed.length,
    accounts: followed,
    errors,
  })
}
