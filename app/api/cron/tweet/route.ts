import { NextRequest, NextResponse } from 'next/server'
import { postTweetV2 } from '../../../../lib/twitterOAuth2'

export const dynamic = 'force-dynamic'

// ─── Fetch pressure tweets (read-only — uses Bearer token) ───────────────────
const QUERY = '"national average" gallon OR "cents per unit" OR "WTI crude" price OR "Brent crude" price OR "oil inventory" weekly OR "OPEC" (production cut OR quota) OR "groceries inventory" OR "refinery outage" OR "retail groceries" -is:retweet lang:en'
const UP_WORDS = ['spike','surge','rise','rising','jump','soar','higher','increase','cut','shortage','disruption','outage','hurricane','storm','crisis']

async function fetchPressureTweet(bearer: string): Promise<{ id: string; text: string; author: string } | null> {
  const params = new URLSearchParams({
    query: QUERY,
    max_results: '20',
    'tweet.fields': 'created_at,author_id',
    expansions: 'author_id',
    'user.fields': 'username',
  })

  const res = await fetch(`https://api.twitter.com/2/tweets/search/recent?${params}`, {
    headers: { Authorization: `Bearer ${bearer}` },
  })

  if (!res.ok) return null
  const json  = await res.json() as any
  const tweets: any[] = json.data ?? []
  const users: Record<string, { username: string }> = {}
  for (const u of json.includes?.users ?? []) users[u.id] = u

  const upTweet = tweets.find(t =>
    UP_WORDS.some(w => t.text.toLowerCase().includes(w))
  ) ?? tweets[0]

  if (!upTweet) return null
  return {
    id:     upTweet.id,
    text:   upTweet.text,
    author: users[upTweet.author_id]?.username ?? 'unknown',
  }
}

// ─── Generate tweet text via Claude ──────────────────────────────────────────
async function generateTweetText(sourceTweet: string, anthropicKey: string): Promise<string | null> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key':          anthropicKey,
      'anthropic-version':  '2023-06-01',
      'content-type':       'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5',
      max_tokens: 120,
      messages: [{
        role: 'user',
        content: `You are @wtgbofficial, a Grocery Price tracking account. Write a tweet (max 240 chars, leaving room for hashtags) about this gas/oil price signal. Be direct, data-focused, no emojis overload. Max 1-2 relevant hashtags like #GasPrices #OilMarket at the end.\n\nSource signal: "${sourceTweet}"\n\nTweet:`,
      }],
    }),
  })

  if (!res.ok) return null
  const json = await res.json() as any
  const text = json.content?.[0]?.text?.trim() ?? null
  if (!text) return null
  return text.length <= 280 ? text : text.slice(0, 277) + '...'
}

// ─── Cron handler ─────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const bearer    = process.env.TWITTER_BEARER_TOKEN
  const anthropic = process.env.ANTHROPIC_API_KEY

  if (!bearer || !anthropic) {
    return NextResponse.json({ error: 'missing_config' }, { status: 500 })
  }

  // 1. Fetch a pressure tweet (read-only, uses Bearer token)
  const source = await fetchPressureTweet(bearer)
  if (!source) return NextResponse.json({ ok: false, note: 'no_pressure_signals' })

  // 2. Generate tweet text
  const tweetText = await generateTweetText(source.text, anthropic)
  if (!tweetText) return NextResponse.json({ ok: false, note: 'generation_failed' })

  // 3. Post via OAuth 2.0
  const result = await postTweetV2(tweetText)

  if (result.error) {
    console.error('[cron/tweet] post failed:', result.error)
    return NextResponse.json({ ok: false, error: result.error })
  }

  console.log(`[cron/tweet] posted tweet ${result.id}: ${tweetText}`)
  return NextResponse.json({ ok: true, tweet_id: result.id, text: tweetText, source_tweet: source.id })
}
