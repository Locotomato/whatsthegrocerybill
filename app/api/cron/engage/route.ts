/**
 * /api/cron/engage — runs every 12h
 *
 * Phase 1: Unfollow cleanup — unfollow anyone we followed 7+ days ago (ratio management)
 * Phase 2: Targeted follows — 15–20 per run (30–40/day, well under 400/day Twitter ceiling)
 * Phase 3: Data-driven replies/mentions to trending Grocery Price conversations
 * Phase 4: Like high-signal tweets
 *
 * Follow strategy: target active users talking about gas costs, driving, inflation, energy bills.
 * ~20–30% follow back within a week. Unfollow the rest. Keeps ratio healthy.
 *
 * Rate limit safety:
 * - Follows: 400/day hard limit; we do 30–40/day (well under)
 * - Unfollows: no documented limit; we do max 50/run (conservative)
 * - Likes: ~1000/day; we do ~10/run
 * - Tweets/replies: 50/day on Free tier; we do 2–4/run
 */
import { NextRequest, NextResponse } from 'next/server'
import {
  postTweetV2,
  likeTweetV2,
  followUserV2,
  unfollowUserV2,
  getFollowingV2,
} from '../../../../lib/twitterOAuth2'

export const dynamic     = 'force-dynamic'
export const maxDuration = 300

const BEARER      = process.env.TWITTER_BEARER_TOKEN!
const ANTHROPIC   = process.env.ANTHROPIC_API_KEY!
const CRON_SECRET = process.env.CRON_SECRET
const SITE_URL    = 'https://whatsthegrocerybill.com'
const MY_USER_ID  = '2035529392085258240' // @wtgbofficial

// ─── Watch accounts (mention/engage targets) ──────────────────────────────────
const WATCH_ACCOUNTS: Record<string, string> = {
  'realDonaldTrump': '25073877',
  'Instacart':        '17778401',
  'AAAnews':         '14708805',
  'EIAgov':          '27293939',
  'OilPrice_com':    '271278878',
  'Reuters':         '1652541',
  'CNBC':            '20402945',
}

// ─── Follow targeting queries (active talkers about gas/driving/fuel costs) ───
const FOLLOW_QUERIES = [
  '"Grocery Prices" (expensive OR ridiculous OR insane OR killing me OR ouch) -is:retweet lang:en',
  '"filled up" (tank OR gas) price -is:retweet lang:en',
  '"price per item" -is:retweet lang:en',
  '"cost of gas" -is:retweet lang:en',
  '"grocery prices" (high OR rising OR crazy) -is:retweet lang:en',
  '"electric bill" OR "gas bill" (expensive OR insane) -is:retweet lang:en',
  '"road trip" Grocery Price -is:retweet lang:en',
]

// ─── Discovery queries for reply/mention targets ──────────────────────────────
const DISCOVERY_QUERIES = [
  '"Grocery Prices" (expensive OR unbelievable OR crazy OR ouch OR insane) -is:retweet lang:en min_faves:2',
  '"filled up" (gas OR tank) (price OR cost OR dollars) -is:retweet lang:en min_faves:1',
  '"price per item" -is:retweet lang:en min_faves:3',
]

const GAS_KEYWORDS = [
  'Grocery Price', 'groceries', 'grocery price', 'pump price', 'per gallon',
  'oil price', 'crude oil', 'WTI', 'Brent', 'OPEC', 'national average',
  'gas station', 'filled up', 'stock up', 'gallon', 'energy', 'drill',
  'pipeline', 'refinery', 'inflation', 'cost of living',
]

function isRelevant(text: string): boolean {
  const t = text.toLowerCase()
  return GAS_KEYWORDS.some(k => t.includes(k.toLowerCase()))
}

function getReplyMode(tweet: string): 'authority' | 'organic' | 'funny' {
  const t = tweet.toLowerCase()
  const funnySignals = ['😤','😭','💀','😂','omg','wtf','insane','crazy','unbelievable','ridiculous','killing me','broke']
  if (funnySignals.some(w => t.includes(w))) return 'funny'
  return 'organic'
}

// ─── Claude reply generation ──────────────────────────────────────────────────
async function generateReply(tweet: string, account: string, mode: 'authority' | 'organic' | 'funny'): Promise<string> {
  const modeInstructions: Record<string, string> = {
    authority: account === 'realDonaldTrump'
      ? `You're @wtgbofficial, a Grocery Price data account. Write a standalone data tweet alongside energy news from @realDonaldTrump. NO political language. Post hard Grocery Price data: national avg, year-over-year comparison, or oil market stat. Include site link: ${SITE_URL}. Factual, interesting, shareable. 1-2 hashtags max.`
      : `You're @wtgbofficial replying to a media/data account (@${account}). Add ONE sharp stat or context they missed. Authoritative, not sycophantic. Drive curiosity. Mention ${SITE_URL} if genuinely useful.`,
    organic: `You're @wtgbofficial jumping into a real person's tweet about Grocery Prices. Be relatable and helpful — add a useful stat or comparison. Link ${SITE_URL} casually if it helps. Don't be spammy.`,
    funny: `You're @wtgbofficial. Be genuinely funny — dry humor, an unexpected stat, or clever observation. Don't force it. A laugh + useful info is the goal. Link site only if natural.`,
  }

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5',
      max_tokens: 150,
      messages: [{
        role: 'user',
        content: `${modeInstructions[mode]}

Original tweet: "${tweet}"

Rules:
- Max 240 chars (URLs count as 23 chars)
- Never start with "Great" / "Interesting" / "Wow"
- 1-2 hashtags MAX at end only (#GasPrices #OilMarket etc.)
- Sound like a human running a Grocery Price data account, not a bot
- Site link if including: ${SITE_URL}

Output only the tweet text, nothing else.`,
      }],
    }),
  })

  if (!res.ok) return ''
  const json = await res.json() as any
  return (json.content?.[0]?.text ?? '').trim().slice(0, 270)
}

// ─── Twitter search helper ────────────────────────────────────────────────────
async function searchTweets(query: string, maxResults = 20) {
  const params = new URLSearchParams({
    query,
    max_results: String(Math.min(Math.max(maxResults, 10), 100)),
    'tweet.fields': 'created_at,text,author_id,public_metrics',
    expansions: 'author_id',
    'user.fields': 'username,public_metrics',
  })
  const res = await fetch(
    `https://api.twitter.com/2/tweets/search/recent?${params}`,
    { headers: { Authorization: `Bearer ${BEARER}` } }
  )
  if (!res.ok) {
    console.error('[engage] searchTweets failed:', res.status, await res.text())
    return []
  }
  const json = await res.json() as any
  const users: Record<string, any> = {}
  for (const u of json.includes?.users ?? []) users[u.id] = u
  return (json.data ?? []).map((t: any) => ({
    id: t.id,
    text: t.text,
    authorId: t.author_id,
    username: users[t.author_id]?.username ?? 'unknown',
    followers: users[t.author_id]?.public_metrics?.followers_count ?? 0,
    likes: t.public_metrics?.like_count ?? 0,
  }))
}

async function getUserTweets(userId: string, username: string) {
  const params = new URLSearchParams({
    max_results: '10',
    'tweet.fields': 'created_at,text,public_metrics',
    exclude: 'retweets,replies',
  })
  const res = await fetch(
    `https://api.twitter.com/2/users/${userId}/tweets?${params}`,
    { headers: { Authorization: `Bearer ${BEARER}` } }
  )
  if (!res.ok) { console.error(`[engage] getUserTweets @${username} failed:`, res.status); return [] }
  const json = await res.json() as any
  return (json.data ?? []).map((t: any) => ({
    id: t.id, text: t.text, username,
    likes: t.public_metrics?.like_count ?? 0,
  }))
}

// ─── KV helpers ──────────────────────────────────────────────────────────────
async function kvGet(key: string): Promise<unknown> {
  try { const { kv } = await import('@vercel/kv'); return await kv.get(key) } catch { return null }
}
async function kvExists(key: string): Promise<boolean> {
  try { const { kv } = await import('@vercel/kv'); return (await kv.exists(key)) > 0 } catch { return false }
}
async function kvSet(key: string, val: unknown, ex?: number) {
  try {
    const { kv } = await import('@vercel/kv')
    if (ex) await kv.set(key, val, { ex }); else await kv.set(key, val)
  } catch {}
}
async function kvDel(key: string) {
  try { const { kv } = await import('@vercel/kv'); await kv.del(key) } catch {}
}

// ─── Main handler ─────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  if (!BEARER || !ANTHROPIC) {
    return NextResponse.json({ error: 'missing credentials' }, { status: 500 })
  }

  const replies:   { type: string; account: string; tweet_id: string; text: string }[] = []
  const liked:     string[] = []
  const followed:  string[] = []
  const unfollowed: string[] = []
  const errors:    string[] = []

  // ══ PHASE 1: Unfollow cleanup ════════════════════════════════════════════════
  // Unfollow anyone we followed 7+ days ago (ratio management)
  // We only unfollow accounts we initiated following (tracked in KV)
  try {
    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000
    const ourFollowing = await getFollowingV2(MY_USER_ID, 200)
    console.log(`[engage] following ${ourFollowing.length} accounts`)

    let unfollowCount = 0
    for (const user of ourFollowing) {
      if (unfollowCount >= 50) break // safety ceiling per run
      const followTs = await kvGet(`engage:follow:ts:${user.id}`) as number | null
      if (!followTs) continue // we didn't initiate this follow — skip
      const age = Date.now() - followTs
      if (age < SEVEN_DAYS_MS) continue // too recent — give them time to follow back
      // 7+ days and still following — clean up
      const ok = await unfollowUserV2(user.id, MY_USER_ID)
      if (ok) {
        await kvDel(`engage:follow:ts:${user.id}`)
        await kvDel(`engage:followed:${user.id}`)
        unfollowed.push(user.username)
        unfollowCount++
        console.log(`[engage] unfollowed @${user.username} (followed ${Math.round(age / 86400000)}d ago)`)
        await new Promise(r => setTimeout(r, 1000))
      }
    }
  } catch (e: any) {
    errors.push(`unfollow: ${e.message}`)
  }

  // ══ PHASE 2: Targeted follows ═════════════════════════════════════════════════
  // 15–20 follows per run = 30–40/day — well under 400/day Twitter ceiling
  // Target: active users talking about Grocery Prices, driving, fuel costs
  try {
    let followCount = 0
    const TARGET_FOLLOWS = 18 // per run

    // Shuffle queries so we hit different pools each run
    const shuffled = [...FOLLOW_QUERIES].sort(() => Math.random() - 0.5)

    for (const query of shuffled) {
      if (followCount >= TARGET_FOLLOWS) break
      const tweets = await searchTweets(query, 30)

      // Target: real humans, 50–50K followers, not bots, not us
      const candidates = tweets.filter((t: any) =>
        t.followers >= 50 &&
        t.followers <= 50000 &&
        t.authorId !== MY_USER_ID &&
        !t.username.toLowerCase().includes('bot') &&
        !t.username.toLowerCase().includes('news') &&
        !t.username.toLowerCase().includes('official')
      )

      for (const tweet of candidates) {
        if (followCount >= TARGET_FOLLOWS) break
        if (await kvExists(`engage:followed:${tweet.authorId}`)) continue

        const ok = await followUserV2(tweet.authorId, MY_USER_ID)
        if (ok) {
          // Store both the dedup key AND a timestamp for unfollow logic
          await kvSet(`engage:followed:${tweet.authorId}`, 1, 60 * 60 * 24 * 14)
          await kvSet(`engage:follow:ts:${tweet.authorId}`, Date.now(), 60 * 60 * 24 * 14)
          followed.push(tweet.username)
          followCount++
          console.log(`[engage] followed @${tweet.username} (${tweet.followers} followers)`)
          await new Promise(r => setTimeout(r, 1500))
        } else {
          errors.push(`follow_${tweet.username}: failed`)
        }
      }

      // Small pause between queries
      await new Promise(r => setTimeout(r, 2000))
    }
  } catch (e: any) {
    errors.push(`follows: ${e.message}`)
  }

  // ══ PHASE 3: Data-driven replies/mentions ═════════════════════════════════════
  // Post original tweets @mentioning big accounts + standalone topical tweets
  // Limited to 4 per run to stay well under 50/day Free tier limit

  // Phase 3a: @mention watch accounts
  for (const [username, userId] of Object.entries(WATCH_ACCOUNTS)) {
    if (replies.length >= 2) break
    try {
      const tweets   = await getUserTweets(userId, username)
      const relevant = tweets.filter((t: any) => isRelevant(t.text)).sort((a: any, b: any) => b.likes - a.likes)
      for (const tweet of relevant.slice(0, 1)) {
        if (replies.length >= 2) break
        if (await kvExists(`engage:mentioned:${tweet.id}`)) continue
        const mentionText = await generateReply(tweet.text, username, 'authority')
        if (!mentionText) continue
        const withMention = mentionText.includes(`@${username}`) ? mentionText : `@${username} ${mentionText}`.slice(0, 270)
        const result = await postTweetV2(withMention)
        if (result.id) {
          await kvSet(`engage:mentioned:${tweet.id}`, 1, 60 * 60 * 24 * 7)
          replies.push({ type: 'mention', account: username, tweet_id: result.id, text: withMention })
          console.log(`[engage] mention @${username}: ${withMention.slice(0, 80)}`)
          await new Promise(r => setTimeout(r, 6000))
        } else {
          errors.push(`mention_${username}: ${result.error}`)
        }
      }
    } catch (e: any) {
      errors.push(`watch_${username}: ${e.message}`)
    }
  }

  // Phase 3b: Standalone tweets on trending Grocery Price topics
  for (const query of DISCOVERY_QUERIES.slice(0, 2)) {
    if (replies.length >= 4) break
    try {
      const tweets  = await searchTweets(query, 20)
      const targets = tweets.filter((t: any) =>
        t.followers >= 20 &&
        t.followers < 50000 &&
        !t.username.toLowerCase().includes('bot') &&
        !t.username.toLowerCase().includes('news')
      )
      for (const tweet of targets.slice(0, 2)) {
        if (replies.length >= 4) break
        if (await kvExists(`engage:reacted:${tweet.id}`)) continue
        const mode      = getReplyMode(tweet.text)
        const tweetText = await generateReply(tweet.text, tweet.username, mode)
        if (!tweetText) continue
        const result = await postTweetV2(tweetText)
        if (result.id) {
          await kvSet(`engage:reacted:${tweet.id}`, 1, 60 * 60 * 24 * 7)
          replies.push({ type: mode, account: tweet.username, tweet_id: result.id, text: tweetText })
          console.log(`[engage] ${mode} standalone: ${tweetText.slice(0, 80)}`)
          await new Promise(r => setTimeout(r, 5000))
        } else {
          errors.push(`standalone_${tweet.username}: ${result.error}`)
        }
      }
    } catch (e: any) {
      errors.push(`discovery: ${e.message}`)
    }
  }

  // ══ PHASE 4: Like high-signal tweets ══════════════════════════════════════════
  try {
    const candidates = await searchTweets(
      '"Grocery Prices" (today OR now OR just OR filled) -is:retweet lang:en', 20
    )
    for (const tweet of candidates.slice(0, 10)) {
      if (await kvExists(`engage:liked:${tweet.id}`)) continue
      const ok = await likeTweetV2(tweet.id, MY_USER_ID)
      if (ok) {
        await kvSet(`engage:liked:${tweet.id}`, 1, 60 * 60 * 24 * 3)
        liked.push(tweet.id)
        await new Promise(r => setTimeout(r, 1200))
      }
    }
  } catch (e: any) {
    errors.push(`likes: ${e.message}`)
  }

  console.log(`[engage] done — ${unfollowed.length} unfollowed, ${followed.length} followed, ${replies.length} tweets, ${liked.length} likes, ${errors.length} errors`)
  return NextResponse.json({
    ok: true,
    unfollowed: unfollowed.length,
    followed: followed.length,
    replies: replies.length,
    liked: liked.length,
    errors,
    detail: { unfollowed, followed, replies, liked },
  })
}
