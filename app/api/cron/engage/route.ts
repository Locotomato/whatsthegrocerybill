/**
 * /api/cron/engage — runs every 12h
 *
 * Phase 1: Unfollow cleanup — unfollow anyone we followed 7+ days ago (ratio management)
 * Phase 2: Targeted follows — 15–20 per run (30–40/day, well under 400/day Twitter ceiling)
 * Phase 3: Data-driven replies/mentions to trending grocery price conversations
 * Phase 4: Like high-signal grocery price tweets
 *
 * Follow strategy: target active users talking about grocery costs, food inflation, egg prices, tariffs.
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
const MY_USER_ID  = process.env.WTGB_TWITTER_USER_ID ?? '' // @wtgbofficial user ID (set in env)

// ─── Watch accounts (grocery, food policy, consumer economics) ─────────────────
const WATCH_ACCOUNTS: Record<string, string> = {
  'USDA':           '19923144',
  'BLS_gov':        '14946840',
  'ConsumerReports':'20406683',
  'WSJ':            '3108351',
  'CNBC':           '20402945',
  'FoodNetwork':    '14510190',
  'nytimes':        '807095',
}

// ─── Follow targeting queries (active talkers about grocery costs) ─────────────
const FOLLOW_QUERIES = [
  '"grocery prices" (expensive OR ridiculous OR insane OR killing me OR ouch) -is:retweet lang:en',
  '"egg prices" (why OR high OR crazy OR unbelievable) -is:retweet lang:en',
  '"grocery bill" (higher OR expensive OR shocked OR unreal) -is:retweet lang:en',
  '"food prices" (rising OR up OR inflation OR tariff) -is:retweet lang:en',
  '"cost of groceries" -is:retweet lang:en',
  '"beef prices" OR "milk prices" OR "bread prices" (high OR rising OR expensive) -is:retweet lang:en',
  '"avian flu" eggs prices -is:retweet lang:en',
  'tariffs groceries prices -is:retweet lang:en',
]

// ─── Discovery queries for reply/mention targets ──────────────────────────────
const DISCOVERY_QUERIES = [
  '"grocery prices" (expensive OR unbelievable OR crazy OR ouch OR insane) -is:retweet lang:en min_faves:2',
  '"egg prices" (high OR record OR why) -is:retweet lang:en min_faves:2',
  '"food inflation" 2025 -is:retweet lang:en min_faves:2',
  'groceries (tariff OR inflation) prices -is:retweet lang:en min_faves:3',
]

// ─── Relevance check ──────────────────────────────────────────────────────────
const RELEVANT_WORDS = [
  'grocery','groceries','food price','egg','milk','beef','chicken','bread','butter',
  'inflation','tariff','cost of living','avian flu','food cost',
]
const FUNNY_SIGNALS = [
  'ugh','wtf','seriously','omg','cannot believe','absurd','robbery','broke',
  'wallet','paycheck','budget','coupon','sale','deal',
]

function isRelevant(text: string): boolean {
  const t = text.toLowerCase()
  return RELEVANT_WORDS.some(w => t.includes(w))
}

function getReplyMode(text: string): 'authority' | 'organic' | 'funny' {
  const t = text.toLowerCase()
  if (FUNNY_SIGNALS.some(w => t.includes(w))) return 'funny'
  if (t.includes('data') || t.includes('report') || t.includes('study') || t.includes('%')) return 'authority'
  return 'organic'
}

// ─── Claude reply generation ──────────────────────────────────────────────────
async function generateReply(tweet: string, account: string, mode: 'authority' | 'organic' | 'funny'): Promise<string> {
  const modeInstructions: Record<string, string> = {
    authority: `You're @wtgbofficial, a grocery price data account. Reply to @${account} with ONE sharp stat or context they missed. Add real data: national avg egg price ($4.82/doz), beef ($5.43/lb), milk ($3.94/gal), grocery inflation 22% since 2020. Authoritative, not sycophantic. Mention ${SITE_URL} if genuinely useful.`,
    organic:   `You're @wtgbofficial jumping into a real person's tweet about grocery prices. Be relatable and helpful — add a useful stat or comparison. "Eggs are up 12% YoY, ground beef up 8%..." Link ${SITE_URL} casually if it helps. Don't be spammy.`,
    funny:     `You're @wtgbofficial. Be genuinely funny about grocery prices — dry humor, unexpected stat, clever observation about food costs. A laugh + useful info is the goal. Link site only if natural.`,
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
- 1-2 hashtags MAX at end only (#GroceryPrices #FoodInflation #EggPrices etc.)
- Sound like a human running a grocery price data account, not a bot
- Key data points: eggs $4.82/doz (+12% YoY), beef $5.43/lb (+8%), milk $3.94/gal (+3%), butter $5.11/lb (+15%)
- Site link if including: ${SITE_URL}

Output only the tweet text, nothing else.`,
      }],
    }),
  })

  if (!res.ok) return ''
  const json = await res.json() as any
  return (json.content?.[0]?.text ?? '').trim().slice(0, 270)
}

// ─── Twitter helpers ──────────────────────────────────────────────────────────
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
  if (!res.ok) { console.error('[engage] searchTweets failed:', res.status); return [] }
  const json = await res.json() as any
  const users: Record<string, any> = {}
  for (const u of json.includes?.users ?? []) users[u.id] = u
  return (json.data ?? []).map((t: any) => ({
    id: t.id, text: t.text,
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

// ─── KV helpers ───────────────────────────────────────────────────────────────
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
  if (!MY_USER_ID) {
    return NextResponse.json({ error: 'WTGB_TWITTER_USER_ID not set' }, { status: 500 })
  }

  const replies:    { type: string; account: string; tweet_id: string; text: string }[] = []
  const liked:      string[] = []
  const followed:   string[] = []
  const unfollowed: string[] = []
  const errors:     string[] = []

  // ══ PHASE 1: Unfollow cleanup ════════════════════════════════════════════════
  try {
    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000
    const ourFollowing = await getFollowingV2(MY_USER_ID, 200)
    let unfollowCount = 0
    for (const user of ourFollowing) {
      if (unfollowCount >= 50) break
      const followTs = await kvGet(`wtgb:engage:follow:ts:${user.id}`) as number | null
      if (!followTs) continue
      const age = Date.now() - followTs
      if (age < SEVEN_DAYS_MS) continue
      const ok = await unfollowUserV2(user.id, MY_USER_ID)
      if (ok) {
        await kvDel(`wtgb:engage:follow:ts:${user.id}`)
        await kvDel(`wtgb:engage:followed:${user.id}`)
        unfollowed.push(user.username)
        unfollowCount++
        await new Promise(r => setTimeout(r, 1000))
      }
    }
  } catch (e: any) { errors.push(`unfollow: ${e.message}`) }

  // ══ PHASE 2: Targeted follows ═════════════════════════════════════════════════
  try {
    let followCount = 0
    const TARGET_FOLLOWS = 18
    const shuffled = [...FOLLOW_QUERIES].sort(() => Math.random() - 0.5)

    for (const query of shuffled) {
      if (followCount >= TARGET_FOLLOWS) break
      const tweets = await searchTweets(query, 30)
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
        if (await kvExists(`wtgb:engage:followed:${tweet.authorId}`)) continue
        const ok = await followUserV2(tweet.authorId, MY_USER_ID)
        if (ok) {
          await kvSet(`wtgb:engage:followed:${tweet.authorId}`, 1, 60 * 60 * 24 * 14)
          await kvSet(`wtgb:engage:follow:ts:${tweet.authorId}`, Date.now(), 60 * 60 * 24 * 14)
          followed.push(tweet.username)
          followCount++
          await new Promise(r => setTimeout(r, 1500))
        } else {
          errors.push(`follow_${tweet.username}: failed`)
        }
      }
      await new Promise(r => setTimeout(r, 2000))
    }
  } catch (e: any) { errors.push(`follows: ${e.message}`) }

  // ══ PHASE 3: Data-driven replies/mentions ═════════════════════════════════════

  // Phase 3a: @mention watch accounts
  for (const [username, userId] of Object.entries(WATCH_ACCOUNTS)) {
    if (replies.length >= 2) break
    try {
      const tweets   = await getUserTweets(userId, username)
      const relevant = tweets.filter((t: any) => isRelevant(t.text)).sort((a: any, b: any) => b.likes - a.likes)
      for (const tweet of relevant.slice(0, 1)) {
        if (replies.length >= 2) break
        if (await kvExists(`wtgb:engage:mentioned:${tweet.id}`)) continue
        const mentionText = await generateReply(tweet.text, username, 'authority')
        if (!mentionText) continue
        const withMention = mentionText.includes(`@${username}`) ? mentionText : `@${username} ${mentionText}`.slice(0, 270)
        const result = await postTweetV2(withMention)
        if (result.id) {
          await kvSet(`wtgb:engage:mentioned:${tweet.id}`, 1, 60 * 60 * 24 * 7)
          replies.push({ type: 'mention', account: username, tweet_id: result.id, text: withMention })
          await new Promise(r => setTimeout(r, 6000))
        } else {
          errors.push(`mention_${username}: ${result.error}`)
        }
      }
    } catch (e: any) { errors.push(`watch_${username}: ${e.message}`) }
  }

  // Phase 3b: Standalone replies on trending grocery topics
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
        if (await kvExists(`wtgb:engage:reacted:${tweet.id}`)) continue
        const mode      = getReplyMode(tweet.text)
        const tweetText = await generateReply(tweet.text, tweet.username, mode)
        if (!tweetText) continue
        const result = await postTweetV2(tweetText)
        if (result.id) {
          await kvSet(`wtgb:engage:reacted:${tweet.id}`, 1, 60 * 60 * 24 * 7)
          replies.push({ type: mode, account: tweet.username, tweet_id: result.id, text: tweetText })
          await new Promise(r => setTimeout(r, 5000))
        } else {
          errors.push(`standalone_${tweet.username}: ${result.error}`)
        }
      }
    } catch (e: any) { errors.push(`discovery: ${e.message}`) }
  }

  // ══ PHASE 4: Like high-signal tweets ══════════════════════════════════════════
  try {
    const candidates = await searchTweets(
      '"grocery prices" (today OR just OR filled OR shocked) -is:retweet lang:en', 20
    )
    for (const tweet of candidates.slice(0, 10)) {
      if (await kvExists(`wtgb:engage:liked:${tweet.id}`)) continue
      const ok = await likeTweetV2(tweet.id, MY_USER_ID)
      if (ok) {
        await kvSet(`wtgb:engage:liked:${tweet.id}`, 1, 60 * 60 * 24 * 3)
        liked.push(tweet.id)
        await new Promise(r => setTimeout(r, 1200))
      }
    }
  } catch (e: any) { errors.push(`likes: ${e.message}`) }

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
