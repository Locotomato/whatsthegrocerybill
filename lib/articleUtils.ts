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
  writer_id?: string  // one of the WRITERS[].id values
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

const FLUFF_PHRASES = [
  'in conclusion',
  'ever-evolving',
  "it's worth noting",
  "it's important to understand",
  'it is worth noting',
  'it is important to understand',
  'in summary',
  'to summarize',
  'needless to say',
  'at the end of the day',
]

function isLowQualityDraft(body: string): boolean {
  const lower = body.toLowerCase()
  if (FLUFF_PHRASES.some(phrase => lower.includes(phrase))) return true

  // ── Information-gain checks (LOC-382) ────────────────────────────────────
  // Require a "Data Snapshot" section
  if (!lower.includes('data snapshot')) return true
  // Require at least one specific number (dollar amount, percentage, or large figure)
  const hasSpecificData = /\$[\d,]+(\.\d+)?|\d+(\.\d+)?%|\d{1,3}(,\d{3})+/.test(body)
  if (!hasSpecificData) return true
  // Require at least one authoritative source reference in body
  const hasAuthoritativeRef = /usda|bls\.gov|ers\.usda|nass\.usda|bls\.gov\/cpi|ams\.usda/i.test(body)
  if (!hasAuthoritativeRef) return true

  return false
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

/** Compute a topic fingerprint tag from a headline for duplicate detection. */
function topicFingerprintTag(headline: string): string {
  const STOPWORDS = new Set([
    'a','an','the','and','or','but','in','on','at','to','for','of','with',
    'as','by','from','is','are','was','were','be','been','being','have',
    'has','had','do','does','did','will','would','could','should','may',
    'might','can','that','this','these','those','it','its','we','us','our',
    'they','their','you','your','he','she','his','her','up','down','out',
    'new','now','how','what','why','when','where','which','who','over','after',
  ])
  const words = headline
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOPWORDS.has(w))
  const top5 = words.slice(0, 5).sort().join('|')
  let hash = 0
  for (let i = 0; i < top5.length; i++) {
    hash = ((hash << 5) - hash + top5.charCodeAt(i)) | 0
  }
  return `fp:${Math.abs(hash).toString(16).slice(0, 12)}`
}

export async function generateArticle(
  tweet: { id: string; text: string; author: string; username: string; created_at: string },
  anthropicKey: string,
  direction: 'rising' | 'falling' = 'rising',
  authorPersona?: string,
  existingFingerprintTags?: string[] // tags from recent DB articles for dupe detection
): Promise<Omit<Article, 'slug'> | null> {
  const { assignWriter } = await import('./writers')
  const writer = assignWriter(tweet.id)
  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

  // Duplicate detection — check fingerprint against recent articles
  const fingerprintTag = topicFingerprintTag(tweet.text)
  if (existingFingerprintTags?.includes(fingerprintTag)) {
    console.log(`[DUPE] topic already covered — fingerprint ${fingerprintTag}`)
    return null
  }

  const isRising = direction === 'rising'

  const headlineExample = isRising
    ? 'Egg Prices Hit Record High as Avian Flu Cuts US Supply by 20%'
    : 'Grocery Prices Drop for Third Week as Supply Chain Pressures Ease'

  // Direction-specific FAQ templates
  const faqRising = [
    { q: 'Why are grocery prices so high right now?', a: 'Full 2–3 sentence answer specific to this event — not a template.' },
    { q: 'Which grocery items are most affected by rising prices?', a: 'Full 2–3 sentence answer with specific items and price ranges.' },
    { q: 'How long will grocery prices stay elevated?', a: 'Full 2–3 sentence realistic outlook.' },
    { q: 'What can shoppers do to reduce their grocery bill?', a: 'Full 2–3 sentence practical answer with specific stores, substitutions, or timing tips.' },
  ]
  const faqFalling = [
    { q: 'Why are grocery prices dropping right now?', a: 'Full 2–3 sentence answer specific to this event — not a template.' },
    { q: 'Which grocery items are getting cheaper first?', a: 'Full 2–3 sentence answer with specific items and expected savings.' },
    { q: 'How long will lower grocery prices last?', a: 'Full 2–3 sentence realistic outlook.' },
    { q: 'Which stores are passing savings on to shoppers fastest?', a: 'Full 2–3 sentence practical answer with specific retailers or categories.' },
  ]
  const faqTemplate = JSON.stringify(isRising ? faqRising : faqFalling, null, 2)

  // Static system prompt — cached by Anthropic between calls
  const SYSTEM_PROMPT = `You are a senior consumer economics journalist writing for whatsthegrocerybill.com — a grocery price intelligence site tracking the cost of food across America for everyday shoppers, families, and budget-conscious consumers. Your job is to write substantive, deeply reported articles that give readers genuine insight into grocery price movements and what to do about them.

CRITICAL QUALITY RULES:
- Write REAL, INFORMATIVE content — no filler, no padding, no generic statements
- Every section must add new, specific information not repeated elsewhere
- Include real figures: price per unit, % changes, specific categories (eggs, milk, beef, chicken, bread, cereal, cooking oil)
- Reference real organizations: USDA, BLS, ERS, NASS, Progressive Grocer, Reuters
- Track these key grocery categories: eggs, milk, bread, chicken, beef, pork, produce, cereal, cooking oil
- Tone: Consumer Reports meets Main Street — authoritative but friendly and practical
- Never fabricate prices; hedge with "could", "may", "analysts expect" when uncertain
- SEO: naturally include "grocery prices today", "cost of groceries", "average grocery bill" at least once each

Return ONLY valid JSON — no markdown fences, no commentary:
{
  "headline": "8–12 word headline with primary keyword near the front",
  "subhead": "One crisp sentence adding context. Include a price figure or % change if available.",
  "body": "Full article body — separate sections with \\n\\n — TARGET 1500–1700 WORDS TOTAL:

## What's Happening
[250 words — specific grocery market event. Price figures for affected categories. What changed, by how much, compared to what baseline.]

## Data Snapshot
[150 words — MANDATORY proprietary data section. Include at least one computed or sourced data point not available in the original signal. Examples: current BLS CPI Food at Home index value and month-over-month change, USDA ERS retail food price forecasts, NASS weekly egg/milk/beef spot prices, year-over-year % change for specific categories. Reference the .gov source inline (e.g., "according to BLS CPI data" or "USDA ERS projects"). This section must contain at least one specific dollar figure, percentage, or index number.]

## Why It Matters for Your Grocery Bill
[250 words — checkout-level impact. Which items affected and by how much. How fast this hits store shelves vs. warehouse prices. Regional variation — which states or metro areas feel it first.]

## What's Driving This
[200 words — root causes. Be specific: weather events and affected growing regions, supply chain disruption details, avian flu flock numbers, drought impact on harvest yields, trade policy changes, tariff specifics, labor cost data.]

## Historical Context
[150 words — how this compares to prior price moves for these categories. Reference prior highs/lows with actual figures. Give readers perspective on whether this is unusual or routine.]

## Category Breakdown
[200 words — deep dive into the specific categories most affected. For each: current price range, direction, and how much it changed. Cover relevant items from: eggs, milk, beef, chicken, pork, produce, bread, cereal, cooking oil.]

## What This Means for Families
[200 words — concrete budget impact. How much more (or less) a typical weekly grocery run costs. Which substitutions make sense — store brand vs. name brand, frozen vs. fresh, bulk buying opportunities. Specific dollar savings where possible.]

## What This Means for Restaurants and Food Businesses
[150 words — how ingredient cost shifts flow through to menu prices and margins. Which restaurant categories (fast food, casual dining, school lunch, food trucks) feel it first. Whether consumers should expect menu price changes.]

## What Shoppers Should Expect
[150 words — price outlook and timeline. How long this may last. What could reverse it. One concrete action: best time to buy in bulk, which stores post the lowest prices first, apps like Flipp or Instacart for price comparison.]",
  "faqs": [array of 4 FAQ objects provided in the user message — fill each answer with specifics for this event],
  "sources": [
    2 or 3 authoritative outbound sources relevant to THIS specific article. Pick from:
    - For egg/poultry: USDA NASS (https://www.nass.usda.gov), CDC Avian Flu tracker (https://www.cdc.gov/bird-flu)
    - For general food inflation: BLS CPI Food (https://www.bls.gov/cpi/), USDA ERS (https://www.ers.usda.gov/topics/food-markets-prices/)
    - For supply chain/trade: USDA Foreign Agricultural Service (https://www.fas.usda.gov), Reuters (https://www.reuters.com/markets/commodities/)
    - For meat/beef: USDA AMS (https://www.ams.usda.gov/market-news/livestock-poultry-grain)
    - For produce: USDA AMS Fruit & Veg (https://www.ams.usda.gov/market-news/fruit-vegetable)
    ONLY include sources from .gov, reuters.com, apnews.com, usda.gov, bls.gov, eia.gov
    Return as: [{"name": "Full Organization Name", "url": "https://exact-url"}]
  ],
  "tags": ["5–7 tags: mix of topic tags (Egg Prices, Grocery Inflation, Food Costs) and question-style tags (Why are groceries so expensive, grocery price forecast 2025)"],
  "geo_tags": ["list of US state names most relevant to this story"]
}`

  const fullSystemPrompt = authorPersona ? `${authorPersona}\n\n${SYSTEM_PROMPT}` : SYSTEM_PROMPT

  const personaInstruction = authorPersona
    ? `Write in a factual, data-backed, consumer-first voice.`
    : `You are ${writer.name}, ${writer.title} at whatsthegrocerybill.com.\nWriting style: ${writer.styleNote}`

  const userPrompt = `${personaInstruction}

A market signal just came in showing grocery prices are ${direction}. Write a fully SEO-optimized, in-depth article of 1500–1700 words. Every section must be substantive — no filler, no padding.

TWEET: "${tweet.text}"
SOURCE: @${tweet.username}
DATE: ${today}
DIRECTION: prices ${direction}

Use this headline style: "${headlineExample}"

Use these FAQ templates (fill each answer with specifics for this event):
${faqTemplate}`

  const makeRequest = async (temperature: number): Promise<string | null> => {
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
          model: 'claude-sonnet-4-6',
          max_tokens: 4000,
          temperature,
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
      return data.content?.[0]?.text?.trim() ?? null
    } catch {
      return null
    }
  }

  const parseResponse = (raw: string) => {
    const cleaned = raw.replace(/^```json\s*/i, '').replace(/\s*```$/, '').trim()
    return JSON.parse(cleaned)
  }

  // Initial generation
  let raw = await makeRequest(0.3)
  if (!raw) return null

  let parsed
  try {
    parsed = parseResponse(raw)
  } catch {
    return null
  }

  // Quality gate: word count check
  const wordCount = countWords(parsed.body ?? '')
  if (wordCount < 1550) {
    console.log(`[REPAIR] ${tweet.id} — ${wordCount} words, below 1550 floor. Running repair.`)
    const repairPrompt = `The article body you wrote was only ${wordCount} words — it needs to be at least 1550 words.

Expand the thinnest sections (Historical Context, Category Breakdown, What Shoppers Should Expect) to add more specific detail, data points, and context. Do not add padding or repeat what was already said — add genuinely new information. Return the complete updated JSON with the same structure.

Current article:
${raw}`

    const repairRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 4000,
        temperature: 0.2,
        messages: [{ role: 'user', content: repairPrompt }],
      }),
    })

    if (repairRes.ok) {
      const repairData = await repairRes.json()
      const repairRaw = repairData.content?.[0]?.text?.trim()
      if (repairRaw) {
        try {
          const repairParsed = parseResponse(repairRaw)
          const repairWordCount = countWords(repairParsed.body ?? '')
          if (repairWordCount >= 1550) {
            parsed = repairParsed
          } else {
            console.log(`[SKIP] ${tweet.id} — repair produced ${repairWordCount} words, still below 1550. Skipping.`)
            return null
          }
        } catch {
          return null
        }
      }
    }
  }

  // Fluff guard
  if (isLowQualityDraft(parsed.body ?? '')) {
    console.log(`[SKIP] ${tweet.id} — fluff phrases detected in body.`)
    return null
  }

  // Include fingerprint tag for future duplicate detection
  const tags = [...(parsed.tags ?? []), fingerprintTag]

  return {
    id: tweet.id,
    headline: parsed.headline,
    subhead: parsed.subhead,
    body: parsed.body,
    faqs: parsed.faqs ?? [],
    sources: (parsed.sources ?? []).filter((s: any) => s?.name && s?.url),
    tags,
    geo_tags: parsed.geo_tags ?? [],
    source_tweet: {
      id: tweet.id,
      text: tweet.text,
      author: tweet.author,
      username: tweet.username,
      url: `https://twitter.com/${tweet.username}/status/${tweet.id}`,
      created_at: tweet.created_at,
    },
    writer_id: writer.id,
    author: writer.name,
    generated_at: Date.now(),
  }
}
