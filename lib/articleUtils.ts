/**
 * Shared article utilities — slug generation, tweet fetching, article generation.
 * Used by both /api/articles and /news/[slug]/page.tsx
 */

export interface FAQ { q: string; a: string }

export interface Article {
  id: string
  slug: string
  headline: string
  subhead: string
  body: string        // markdown-ish: ## H2, ### H3, paragraphs separated by \n\n
  faqs?: FAQ[]
  tags: string[]
  geo_tags?: string[] // US state names for geo SEO
  source_tweet?: {
    id: string
    text: string
    author: string
    username: string
    url: string
    created_at: string
  } | null
  generated_at: number
}

export function toSlug(headline: string, tweetId: string): string {
  const base = headline
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 65)
    .replace(/-+$/, '') // no trailing dash
  return base
}

/** Legacy: extract tweet ID from old-format slugs (title--tweetId). Returns null for clean slugs. */
export function tweetIdFromSlug(slug: string): string | null {
  const parts = slug.split('--')
  if (parts.length < 2) return null
  const id = parts[parts.length - 1]
  return /^\d{15,}$/.test(id) ? id : null
}

export async function fetchTweetById(tweetId: string, bearer: string): Promise<{
  id: string; text: string; author: string; username: string; avatar?: string; created_at: string
} | null> {
  const params = new URLSearchParams({
    'tweet.fields': 'created_at,author_id,text',
    expansions: 'author_id',
    'user.fields': 'name,username,profile_image_url',
  })
  const res = await fetch(
    `https://api.twitter.com/2/tweets/${tweetId}?${params}`,
    { headers: { Authorization: `Bearer ${bearer}` } }
  )
  if (!res.ok) return null
  const data = await res.json()
  if (!data.data) return null
  const u = data.includes?.users?.[0] ?? { name: 'Unknown', username: 'unknown' }
  return {
    id: data.data.id,
    text: data.data.text,
    author: u.name,
    username: u.username,
    avatar: u.profile_image_url,
    created_at: data.data.created_at,
  }
}

export async function generateArticle(
  tweet: { id: string; text: string; author: string; username: string; created_at: string },
  anthropicKey: string
): Promise<Omit<Article, 'slug'> | null> {
  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

  const prompt = `You are a senior consumer economics journalist writing for whatsthegrocerybill.com — a grocery price intelligence site tracking the cost of food across America for everyday shoppers, families, and budget-conscious consumers.

A market signal just came in. Write a fully SEO-optimized, in-depth article based on this tweet.

TWEET: "${tweet.text}"
SOURCE: @${tweet.username}
DATE: ${today}

Return ONLY valid JSON — no markdown fences, no commentary:
{
  "headline": "8–12 word headline with primary keyword near the front. Example: 'Egg Prices Hit Record High as Avian Flu Cuts US Supply by 20%'",
  "subhead": "One crisp sentence adding context. Include a price figure or % change if available.",
  "body": "Full article body using this exact structure — separate sections with \\n\\n:\\n\\n## What's Happening\\n[2–3 sentences on the specific grocery market event, include any price figures mentioned — eggs, milk, beef, chicken, bread, etc.]\\n\\n## Why It Matters for Your Grocery Bill\\n[2–3 sentences connecting the supply/demand signal to what shoppers will see at checkout. Mention national average context where relevant. Reference affected US regions if applicable.]\\n\\n## What's Driving This\\n[2–3 sentences on root cause: weather events, supply chain disruptions, avian flu, drought, trade policy, inflation, labor costs. Be specific.]\\n\\n## What Shoppers Should Expect\\n[2–3 sentences with price outlook, how long the trend may last, and a concrete shopper tip — stock up now, buy store brand, check Aldi/Walmart/Costco prices, etc.]",
  "faqs": [
    {"q": "Why are grocery prices so high right now?", "a": "2–3 sentence answer specific to this event."},
    {"q": "Which grocery items are most affected?", "a": "2–3 sentence answer with specific items and price ranges."},
    {"q": "How long will grocery prices stay elevated?", "a": "2–3 sentence realistic outlook."}
  ],
  "tags": ["5–7 tags: mix of topic tags (Egg Prices, Grocery Inflation, Food Costs) and question-style tags (Why are groceries so expensive, grocery price forecast 2025)"],
  "geo_tags": ["list of US state names most relevant to this story — e.g. California, Texas, Florida"]
}

Rules:
- Total body ~500–600 words across all sections
- Track these key grocery categories: eggs, milk, bread, chicken, beef, pork, produce, cereal, cooking oil
- Use specific numbers when available; if not available, use ranges or context
- Tone: Consumer Reports meets Main Street — authoritative but friendly and practical
- Never fabricate prices; hedge with "could", "may", "analysts expect" when uncertain
- Each section header (##) must stay — they become H2 tags on the page
- SEO: naturally include phrases like "grocery prices today", "cost of groceries", "average grocery bill" at least once each`

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }],
      }),
    })
    if (!res.ok) return null
    const data = await res.json()
    const raw = data.content?.[0]?.text?.trim()
    if (!raw) return null
    const cleaned = raw.replace(/^```json\s*/i, '').replace(/\s*```$/, '').trim()
    const parsed = JSON.parse(cleaned)
    return {
      id: tweet.id,
      headline: parsed.headline,
      subhead: parsed.subhead,
      body: parsed.body,
      faqs: parsed.faqs ?? [],
      tags: parsed.tags ?? [],
      geo_tags: parsed.geo_tags ?? [],
      source_tweet: {
        id: tweet.id,
        text: tweet.text,
        author: tweet.author,
        username: tweet.username,
        url: `https://twitter.com/${tweet.username}/status/${tweet.id}`,
        created_at: tweet.created_at,
      },
      generated_at: Date.now(),
    }
  } catch {
    return null
  }
}
