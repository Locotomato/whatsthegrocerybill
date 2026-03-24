import { NextResponse } from 'next/server'

// ─── Next.js ISR: cache this response for 30 minutes on Vercel ───────────────
export const revalidate = 1800

const BEARER = process.env.TWITTER_BEARER_TOKEN

// High-precision query — actual price reporting phrases only, no political noise
// Under 512 chars. No $ signs (break Twitter parser).
const FULL_QUERY = '"grocery prices" OR "food prices" OR "egg prices" OR "milk prices" OR "meat prices" OR "produce prices" OR "grocery inflation" OR "food inflation" OR "supermarket prices" OR "cost of groceries" -is:retweet lang:en'

const UP_WORDS   = ['spike','surge','rise','rising','jump','soar','higher','increase',
  'shortage','disruption','outage','hurricane','storm','crisis','recall','drought']
const DOWN_WORDS = ['drop','fall','decline','lower','decrease','cheap','lowest','plunge',
  'surplus','deal','agreement','relief','ease','discount','sale']

function sentiment(text: string): 'up' | 'down' | 'neutral' {
  const t = text.toLowerCase()
  const up   = UP_WORDS.filter(w => t.includes(w)).length
  const down = DOWN_WORDS.filter(w => t.includes(w)).length
  if (up > down) return 'up'
  if (down > up) return 'down'
  return 'neutral'
}

export interface NewsItem {
  id: string
  author: string
  username: string
  avatar?: string
  text: string
  url: string
  created_at: string
  sentiment: 'up' | 'down' | 'neutral'
}

export async function GET() {
  if (!BEARER) {
    console.error('[news] TWITTER_BEARER_TOKEN not set')
    return NextResponse.json({ items: [], error: 'no_token' })
  }

  const params = new URLSearchParams({
    query:          FULL_QUERY,
    max_results:    '40',
    'tweet.fields': 'created_at,author_id,text',
    expansions:     'author_id',
    'user.fields':  'name,username,profile_image_url',
  })

  const res = await fetch(
    `https://api.twitter.com/2/tweets/search/recent?${params}`,
    { headers: { Authorization: `Bearer ${BEARER}` } }
  )

  if (!res.ok) {
    const body = await res.text()
    console.error(`[news] Twitter ${res.status}:`, body)
    return NextResponse.json({ items: [], error: `twitter_${res.status}` })
  }

  const data = await res.json()

  const users: Record<string, { name: string; username: string; avatar?: string }> = {}
  for (const u of data.includes?.users ?? []) {
    users[u.id] = { name: u.name, username: u.username, avatar: u.profile_image_url }
  }

  const items: NewsItem[] = (data.data ?? []).map((t: { id: string; author_id: string; text: string; created_at: string }) => {
    const user = users[t.author_id] ?? { name: 'Unknown', username: 'unknown' }
    return {
      id:         t.id,
      text:       t.text,
      author:     user.name,
      username:   user.username,
      avatar:     user.avatar,
      url:        `https://twitter.com/${user.username}/status/${t.id}`,
      created_at: t.created_at,
      sentiment:  sentiment(t.text),
    }
  })

  return NextResponse.json({ items, cached: false, lastFetch: Date.now() })
}
