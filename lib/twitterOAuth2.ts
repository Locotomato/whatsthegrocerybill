/**
 * Twitter OAuth 2.0 utilities
 * Uses PKCE + refresh token (stored in Vercel KV) to post tweets,
 * replies, likes, and follows.
 * TWITTER_BEARER_TOKEN is still used for read-only search.
 *
 * FALLBACK: If OAuth 2.0 refresh token is stale, postTweetV2 falls back
 * to OAuth 1.0a (TWITTER_API_KEY + TWITTER_API_SECRET + TWITTER_ACCESS_TOKEN
 * + TWITTER_ACCESS_TOKEN_SECRET) which never rotates.
 */

import { createHmac } from 'crypto'

// ─── OAuth 1.0a signing ───────────────────────────────────────────────────────
function oAuth1Header(
  method: string,
  url: string,
  body: Record<string, unknown>,
): string {
  const apiKey      = process.env.TWITTER_API_KEY ?? ''
  const apiSecret   = process.env.TWITTER_API_SECRET ?? ''
  const token       = process.env.TWITTER_ACCESS_TOKEN ?? ''
  const tokenSecret = process.env.TWITTER_ACCESS_TOKEN_SECRET ?? ''

  const nonce     = Math.random().toString(36).slice(2) + Date.now().toString(36)
  const timestamp = Math.floor(Date.now() / 1000).toString()

  const oauthParams: Record<string, string> = {
    oauth_consumer_key:     apiKey,
    oauth_nonce:            nonce,
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp:        timestamp,
    oauth_token:            token,
    oauth_version:          '1.0',
  }

  const enc = (s: string) => encodeURIComponent(s)

  // Base string: merge oauth params (no body for JSON posts — content-type is application/json)
  const sorted = Object.entries(oauthParams)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${enc(k)}=${enc(v)}`)
    .join('&')

  const baseString = [method.toUpperCase(), enc(url), enc(sorted)].join('&')
  const signingKey = `${enc(apiSecret)}&${enc(tokenSecret)}`

  const signature = createHmac('sha1', signingKey)
    .update(baseString)
    .digest('base64')

  oauthParams.oauth_signature = signature

  const header = 'OAuth ' + Object.entries(oauthParams)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${enc(k)}="${enc(v)}"`)
    .join(', ')

  return header
}

async function postTweetOAuth1(
  text: string,
  options?: { replyToId?: string; quoteTweetId?: string },
): Promise<{ id?: string; error?: string }> {
  const url  = 'https://api.twitter.com/2/tweets'
  const body: Record<string, unknown> = { text }
  if (options?.replyToId)    body.reply          = { in_reply_to_tweet_id: options.replyToId }
  if (options?.quoteTweetId) body.quote_tweet_id = options.quoteTweetId

  const authHeader = oAuth1Header('POST', url, body)

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization:  authHeader,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  const json = await res.json() as any
  if (!res.ok) {
    console.error('[twitterOAuth2] OAuth1 postTweet failed:', JSON.stringify(json))
    return { error: JSON.stringify(json) }
  }
  return { id: json.data?.id }
}

const KV_REFRESH_KEY = 'wtgb:twitter:refresh_token'

// ─── In-memory token cache (per serverless invocation) ───────────────────────
// Prevents token rotation race when multiple calls happen in the same function run
let _cachedToken: string | null = null
let _cachedTokenExpiry = 0

// ─── KV helpers ──────────────────────────────────────────────────────────────
async function kvGet(key: string): Promise<string | null> {
  try {
    const { kv } = await import('@vercel/kv')
    return await kv.get<string>(key)
  } catch { return null }
}

async function kvSet(key: string, value: string) {
  try {
    const { kv } = await import('@vercel/kv')
    await kv.set(key, value)
  } catch (e) { console.error('[twitterOAuth2] kv.set failed:', e) }
}

// ─── Token refresh ────────────────────────────────────────────────────────────
interface TokenResponse {
  access_token: string
  refresh_token?: string
  expires_in: number
  token_type: string
}

export async function refreshAccessToken(): Promise<string | null> {
  // Return in-memory cached token if still valid (saves a KV round-trip + prevents rotation races)
  if (_cachedToken && Date.now() < _cachedTokenExpiry) {
    return _cachedToken
  }

  const clientId     = process.env.TWITTER_CLIENT_ID
  const clientSecret = process.env.TWITTER_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    console.error('[twitterOAuth2] Missing TWITTER_CLIENT_ID or TWITTER_CLIENT_SECRET')
    return null
  }

  // Try KV first, fall back to env var (for initial bootstrap)
  let refreshToken = await kvGet(KV_REFRESH_KEY)
  if (!refreshToken) {
    refreshToken = process.env.TWITTER_REFRESH_TOKEN ?? null
  }

  if (!refreshToken) {
    console.error('[twitterOAuth2] No refresh token found — run the OAuth 2.0 auth flow first')
    return null
  }

  const res = await fetch('https://api.twitter.com/2/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
    },
    body: new URLSearchParams({
      grant_type:    'refresh_token',
      refresh_token: refreshToken,
    }).toString(),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error('[twitterOAuth2] Token refresh failed:', err)
    return null
  }

  const data = await res.json() as TokenResponse

  // Twitter rotates refresh tokens — always save the latest one
  if (data.refresh_token) {
    await kvSet(KV_REFRESH_KEY, data.refresh_token)
  }

  // Cache in memory for ~10 min (Twitter access tokens last 2h, but we refresh often anyway)
  _cachedToken = data.access_token
  _cachedTokenExpiry = Date.now() + 10 * 60 * 1000

  return data.access_token
}

// ─── Post a tweet, reply, or quote tweet ─────────────────────────────────────
// Tries OAuth 2.0 first; falls back to OAuth 1.0a if the refresh token is stale.
export async function postTweetV2(
  text: string,
  options?: {
    replyToId?: string    // reply to a tweet (requires prior engagement — may 403 on new accounts)
    quoteTweetId?: string // quote-tweet (always works, shows up in original tweet's "quoted by")
  }
): Promise<{ id?: string; error?: string }> {
  // ── Try OAuth 2.0 first ──
  const accessToken = await refreshAccessToken()
  if (accessToken) {
    const body: Record<string, unknown> = { text }
    if (options?.replyToId)    body.reply          = { in_reply_to_tweet_id: options.replyToId }
    if (options?.quoteTweetId) body.quote_tweet_id = options.quoteTweetId

    const res = await fetch('https://api.twitter.com/2/tweets', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const json = await res.json() as any
    if (res.ok) return { id: json.data?.id }
    console.warn('[twitterOAuth2] OAuth2 postTweet failed, falling back to OAuth1:', JSON.stringify(json))
  } else {
    console.warn('[twitterOAuth2] OAuth2 token unavailable, falling back to OAuth1')
  }

  // ── Fallback: OAuth 1.0a (never rotates) ──
  return postTweetOAuth1(text, options)
}

// ─── Like a tweet ─────────────────────────────────────────────────────────────
// Requires like.write scope
export async function likeTweetV2(
  tweetId: string,
  myUserId: string
): Promise<boolean> {
  const accessToken = await refreshAccessToken()
  if (!accessToken) return false

  const res = await fetch(`https://api.twitter.com/2/users/${myUserId}/likes`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ tweet_id: tweetId }),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error('[twitterOAuth2] likeTweet failed:', err)
  }
  return res.ok
}

// ─── Follow a user ────────────────────────────────────────────────────────────
// Requires follows.write scope
export async function followUserV2(
  targetUserId: string,
  myUserId: string
): Promise<boolean> {
  const accessToken = await refreshAccessToken()
  if (!accessToken) return false

  const res = await fetch(`https://api.twitter.com/2/users/${myUserId}/following`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ target_user_id: targetUserId }),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error('[twitterOAuth2] followUser failed:', err)
  }
  return res.ok
}

/** Build an engaging tweet for a new article */
export function buildArticleTweet(
  headline: string,
  slug: string,
  tags: string[]
): string {
  const url = `https://whatsthegrocerybill.com/news/${slug}`

  const hashtags = tags
    .slice(0, 3)
    .map(t => '#' + t.replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, ''))
    .filter(h => h.length > 1 && h.length <= 20)
    .join(' ')

  const fixed   = '#GroceryPrices #GroceryInflation'
  const allTags = [hashtags, fixed].filter(Boolean).join(' ')

  const budget = 280 - 1 - url.length - 1 - allTags.length - 2
  const hl     = headline.length <= budget ? headline : headline.slice(0, budget - 1) + '…'

  return `${hl}\n\n${url}\n\n${allTags}`
}

// ─── Unfollow a user ─────────────────────────────────────────────────────────
// Requires follows.write scope
export async function unfollowUserV2(
  targetUserId: string,
  myUserId: string
): Promise<boolean> {
  const accessToken = await refreshAccessToken()
  if (!accessToken) return false

  const res = await fetch(
    `https://api.twitter.com/2/users/${myUserId}/following/${targetUserId}`,
    {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  )

  if (!res.ok) {
    const err = await res.text()
    console.error('[twitterOAuth2] unfollowUser failed:', err)
  }
  return res.ok
}

// ─── Get accounts we follow ───────────────────────────────────────────────────
export async function getFollowingV2(
  myUserId: string,
  maxResults = 200
): Promise<{ id: string; username: string }[]> {
  const accessToken = await refreshAccessToken()
  if (!accessToken) return []

  const params = new URLSearchParams({
    max_results: String(Math.min(maxResults, 1000)),
    'user.fields': 'username',
  })

  const res = await fetch(
    `https://api.twitter.com/2/users/${myUserId}/following?${params}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )

  if (!res.ok) {
    console.error('[twitterOAuth2] getFollowing failed:', res.status)
    return []
  }
  const json = await res.json() as any
  return (json.data ?? []).map((u: any) => ({ id: u.id, username: u.username }))
}

// ─── Content type configs ─────────────────────────────────────────────────────
type ContentType = 'guide' | 'state' | 'city' | 'club' | 'page'

const CONTENT_HASHTAGS: Record<ContentType, string[]> = {
  guide:  ['#GroceryPrices', '#GroceryBudget', '#FoodInflation'],
  state:  ['#GroceryPrices', '#FoodPrices', '#CostOfLiving'],
  city:   ['#GroceryPrices', '#LocalPrices', '#FoodCosts'],
  club:   ['#GroceryPrices', '#Costco', '#SamsClub'],
  page:   ['#GroceryPrices', '#GroceryInflation'],
}

const CONTENT_PREFIXES: Record<ContentType, string[]> = {
  guide:  ['New guide 📚', 'Just published 📖', 'New explainer 🔍'],
  state:  ['Live now 🛒', 'Tracking today 🛒', 'Updated 🛒'],
  city:   ['City prices live 🛒', 'Now tracking 🛒'],
  club:   ['Member savings update 💰', 'Warehouse club prices 🛒'],
  page:   ['New page live 🛒'],
}

/** Build an announcement tweet for any newly deployed content page */
export function buildContentTweet(opts: {
  type: ContentType
  title: string
  description: string
  url: string                // full URL e.g. https://whatsthegrocerybill.com/guides/...
  extraHashtags?: string[]   // additional hashtags to append
}): string {
  const { type, title, description, url, extraHashtags = [] } = opts

  const prefixes = CONTENT_PREFIXES[type]
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]

  const baseTags = CONTENT_HASHTAGS[type]
  const allTagStrs = [...baseTags, ...extraHashtags.map(t => t.startsWith('#') ? t : `#${t}`)]
  const tagLine = allTagStrs.slice(0, 4).join(' ')

  // Budget: 280 - url(23) - tagLine - newlines - prefix - ": "
  const overhead = url.length + tagLine.length + prefix.length + 4 // \n\n + ": "
  const budget = 280 - overhead - 5 // safety margin

  // Try full title + truncated description
  const sep = ' — '
  const descBudget = budget - title.length - sep.length
  let body: string
  if (descBudget >= 30) {
    const desc = description.length <= descBudget
      ? description
      : description.slice(0, descBudget - 1) + '…'
    body = `${title}${sep}${desc}`
  } else {
    // Just title, truncated if needed
    body = title.length <= budget ? title : title.slice(0, budget - 1) + '…'
  }

  return `${prefix}: ${body}\n\n${url}\n\n${tagLine}`
}

