/**
 * Shared article utilities — slug generation, tweet fetching, article generation.
 * Used by both /api/articles and /news/[slug]/page.tsx
 */

export interface FAQ { q: string; a: string }

export interface ArticleSource {
  name: string  // e.g. "USDA Economic Research Service"
  url: string   // canonical URL to authoritative source
}

export interface Article {
  id: string
  slug: string
  headline: string
  subhead: string
  body: string        // markdown-ish: ## H2, ### H3, paragraphs separated by \n\n
  faqs?: FAQ[]
  sources?: ArticleSource[]  // 2-3 authoritative outbound citations
  tags: string[]
  geo_tags?: string[] // US state names for geo SEO
  author?: string     // display name of the author persona
  source_tweet?: {
    id: string
    text: string
    author: string
    username: string
    url: string
    created_at: string
  } | null
  imageUrl?: string
  generated_at?: number
  created_at?: string
  publishedAt?: string
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
  anthropicKey: string,
  direction: 'rising' | 'falling' = 'rising',
  authorPersona?: string
): Promise<Omit<Article, 'slug'> | null> {
  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

  const isRising = direction === 'rising'

  // Direction-specific section content
  const headlineExample = isRising
    ? 'Egg Prices Hit Record High as Avian Flu Cuts US Supply by 20%'
    : 'Grocery Prices Drop for Third Week as Supply Chain Pressures Ease'

  const whyItMatters = isRising
    ? '## Why It Matters for Your Grocery Bill\n[2–3 sentences: connect the signal to what shoppers will see at checkout — which items will cost more, by how much, how fast this hits store shelves. Reference affected US regions if applicable.]'
    : '## Why It Matters for Your Grocery Bill\n[2–3 sentences: explain what shoppers stand to gain — where savings will show up first, which stores move fastest, and which categories drop most. Reference affected US regions if applicable.]'

  const meansForFamilies = isRising
    ? '## What This Means for Families\n[2–3 sentences: concrete budget impact — weekly grocery bill change, which staples to swap (store brand, frozen vs fresh, bulk buying), how to offset the increase.]'
    : '## What This Means for Families\n[2–3 sentences: concrete budget opportunity — where families can save the most, which swaps are now worth reversing (name brand vs store brand), ideal time to restock pantry staples.]'

  const meansForOther = isRising
    ? '## What This Means for Restaurants and Food Businesses\n[2–3 sentences: how rising ingredient costs flow through to menu prices and margins. Which restaurant categories (fast food, casual dining, school lunch) feel it first.]'
    : '## What This Means for Restaurants and Food Businesses\n[2–3 sentences: how falling input costs create margin relief. Whether restaurants are likely to pass savings to consumers or absorb them. Which segments benefit most.]'

  const shopperExpect = isRising
    ? '## What Shoppers Should Expect\n[2–3 sentences: price outlook and timeline for how long this lasts, plus one concrete action — stock up now, delay big purchases, check Aldi/Walmart/Costco for deals.]'
    : '## What Shoppers Should Expect\n[2–3 sentences: how long the relief may last, what could reverse it, plus one concrete action — best time to buy in bulk, which stores post the lowest prices first.]'

  const faqRising = [
    { q: 'Why are grocery prices so high right now?', a: '2–3 sentence answer specific to this event.' },
    { q: 'Which grocery items are most affected by rising prices?', a: '2–3 sentence answer with specific items and price ranges.' },
    { q: 'How long will grocery prices stay elevated?', a: '2–3 sentence realistic outlook.' },
  ]
  const faqFalling = [
    { q: 'Why are grocery prices dropping right now?', a: '2–3 sentence answer specific to this event.' },
    { q: 'Which grocery items are getting cheaper first?', a: '2–3 sentence answer with specific items and expected savings.' },
    { q: 'How long will lower grocery prices last?', a: '2–3 sentence realistic outlook.' },
  ]
  const faqTemplate = JSON.stringify(isRising ? faqRising : faqFalling, null, 2)

  // Static system prompt — cached by Anthropic between calls
  const systemPrompt = `You are a senior consumer economics journalist writing for whatsthegrocerybill.com — a grocery price intelligence site tracking the cost of food across America for everyday shoppers, families, and budget-conscious consumers.

Return ONLY valid JSON — no markdown fences, no commentary:
{
  "headline": "8–12 word headline with primary keyword near the front",
  "subhead": "One crisp sentence adding context. Include a price figure or % change if available.",
  "body": "Full article body using the exact section structure provided in the user message — separate each section with \\n\\n",
  "faqs": [array of 3 FAQ objects with q and a fields, using the templates provided in the user message],
  "sources": [
    2 or 3 authoritative outbound sources relevant to THIS specific article. Pick from real, well-known organizations:
    - For egg/poultry: USDA NASS (https://www.nass.usda.gov), CDC Avian Flu tracker (https://www.cdc.gov/bird-flu)
    - For general food inflation: BLS CPI Food (https://www.bls.gov/cpi/), USDA ERS (https://www.ers.usda.gov/topics/food-markets-prices/)
    - For supply chain/trade: USDA Foreign Agricultural Service (https://www.fas.usda.gov), Reuters (https://www.reuters.com/markets/commodities/)
    - For meat/beef: USDA AMS (https://www.ams.usda.gov/market-news/livestock-poultry-grain)
    - For produce: USDA AMS Fruit & Veg (https://www.ams.usda.gov/market-news/fruit-vegetable)
    - For fuel/transport costs: EIA (https://www.eia.gov/petroleum/gasdiesel/)
    Return as: [{"name": "Full Organization Name", "url": "https://exact-url.gov-or-org"}]
    ONLY include sources from .gov, reuters.com, apnews.com, usda.gov, bls.gov, eia.gov — no random blogs
  ],
  "tags": ["5–7 tags: mix of topic tags (Egg Prices, Grocery Inflation, Food Costs) and question-style tags (Why are groceries so expensive, grocery price forecast 2025)"],
  "geo_tags": ["list of US state names most relevant to this story — e.g. California, Texas, Florida"]
}

Rules:
- Total body ~600–700 words across all sections
- Track these key grocery categories: eggs, milk, bread, chicken, beef, pork, produce, cereal, cooking oil
- Use specific numbers when available; if not available, use ranges or context
- Tone: Consumer Reports meets Main Street — authoritative but friendly and practical
- Never fabricate prices; hedge with "could", "may", "analysts expect" when uncertain
- Each section header (##) must stay — they become H2 tags on the page
- SEO: naturally include phrases like "grocery prices today", "cost of groceries", "average grocery bill" at least once each
- The "What This Means for" sections MUST have concrete, actionable content — not vague filler`

  const fullSystemPrompt = authorPersona ? `${authorPersona}\n\n${systemPrompt}` : systemPrompt

  // Dynamic user prompt — changes per article call (tweet, direction, date, templates)
  const userPrompt = `A market signal just came in showing grocery prices are ${direction}. Write a fully SEO-optimized, in-depth article based on this tweet.

TWEET: "${tweet.text}"
SOURCE: @${tweet.username}
DATE: ${today}
DIRECTION: prices ${direction}

Use this headline style: "${headlineExample}"

Use this exact body structure:

## What's Happening
[2–3 sentences on the specific grocery market event, include any price figures mentioned — eggs, milk, beef, chicken, bread, etc.]

${whyItMatters}

## What's Driving This
[2–3 sentences on root cause: weather events, supply chain disruptions, avian flu, drought, trade policy, tariffs, inflation relief, harvest surplus, labor costs. Be specific.]

${meansForFamilies}

${meansForOther}

${shopperExpect}

Use these FAQ templates (fill in the specifics for this event):
${faqTemplate}`

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'prompt-caching-2024-07-31',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        max_tokens: 2000,
        system: [
          {
            type: 'text',
            text: fullSystemPrompt,
            cache_control: { type: 'ephemeral' },
          },
        ],
        messages: [{ role: 'user', content: userPrompt }],
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
      sources: (parsed.sources ?? []).filter((s: any) => s?.name && s?.url),
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
