/**
 * POST /api/announce
 *
 * Tweets an announcement for newly deployed content.
 * Called by the deploy script (scripts/announce_deploy.ts) after each deploy.
 *
 * Body: {
 *   type: 'guide' | 'state' | 'city' | 'club' | 'page'
 *   title: string          -- page title
 *   description: string    -- one-liner description for the tweet
 *   path: string           -- URL path e.g. /guides/gas-tax-by-state
 *   hashtags?: string[]    -- extra hashtags (optional)
 *   secret: string         -- must match CRON_SECRET env var
 * }
 *
 * Response: { ok: boolean; tweet_id?: string; text?: string; error?: string }
 */

import { NextRequest, NextResponse } from 'next/server'
import { postTweetV2, buildContentTweet } from '../../../lib/twitterOAuth2'

const BASE = 'https://whatsthegrocerybill.com'

export async function POST(req: NextRequest) {
  let body: {
    type?: string
    title?: string
    description?: string
    path?: string
    hashtags?: string[]
    secret?: string
  }

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 })
  }

  // Auth
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && body.secret !== cronSecret) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  }

  const { type, title, description, path, hashtags = [] } = body

  if (!type || !title || !description || !path) {
    return NextResponse.json({ ok: false, error: 'missing_fields: type, title, description, path required' }, { status: 400 })
  }

  const url = `${BASE}${path}`

  const tweetText = buildContentTweet({
    type: type as 'guide' | 'state' | 'city' | 'club' | 'page',
    title,
    description,
    url,
    extraHashtags: hashtags,
  })

  const result = await postTweetV2(tweetText)

  if (result.error) {
    console.error('[announce] tweet failed:', result.error)
    return NextResponse.json({ ok: false, error: result.error }, { status: 500 })
  }

  console.log(`[announce] tweeted for ${path}: ${result.id}`)
  return NextResponse.json({ ok: true, tweet_id: result.id, text: tweetText })
}
