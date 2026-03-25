/**
 * POST /api/cron/seed
 * Generates articles from curated grocery price topics (no Twitter required).
 * Used for bulk seeding when Twitter signals are exhausted.
 */
import { NextResponse } from 'next/server'
import { kv } from '@vercel/kv'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const ANTHROPIC = process.env.ANTHROPIC_API_KEY

interface Article {
  id: string
  slug: string
  headline: string
  subhead: string
  body: string
  tags: string[]
  geo_tags: string[]
  faqs: { q: string; a: string }[]
  generated_at: string
  source_tweet?: undefined
}

// Rotating topic list — each run picks one that hasn't been written yet
const TOPICS = [
  { id: 'eggs-avian-flu-2025', prompt: 'Write about egg prices in 2025–2026 and how avian flu outbreaks have driven them to record highs. Include impact on consumers and when prices might normalize.' },
  { id: 'beef-prices-grilling', prompt: 'Write about ground beef and steak prices rising ahead of grilling season. Cover supply chain factors, cattle herd sizes, and tips to save money on beef.' },
  { id: 'milk-prices-dairy', prompt: 'Write about milk prices and dairy inflation. Cover what drives milk pricing, regional differences, and alternatives shoppers are using.' },
  { id: 'bread-wheat-prices', prompt: 'Write about bread prices and wheat market dynamics. Cover how global wheat supply affects your grocery bill and tips for saving on bread.' },
  { id: 'chicken-prices-rise', prompt: 'Write about chicken prices rising as shoppers switch from beef. Cover supply constraints, bird flu impact, and which chicken products are most affected.' },
  { id: 'coffee-prices-record', prompt: 'Write about coffee prices hitting near-record highs due to crop failures in Brazil and Vietnam. Cover how much prices have risen and which brands are most affected.' },
  { id: 'grocery-shrinkflation', prompt: 'Write about shrinkflation in grocery stores — products getting smaller while prices stay the same. Include specific examples like chips, cereal, and meat packaging.' },
  { id: 'walmart-kroger-prices', prompt: 'Write about comparing grocery prices at Walmart vs Kroger vs Aldi. Which store is cheapest in 2025–2026 and which items have the biggest price differences?' },
  { id: 'grocery-tariffs-2025', prompt: 'Write about how 2025 import tariffs are affecting grocery prices. What foods are most impacted by tariffs and how much are prices expected to rise?' },
  { id: 'organic-food-prices', prompt: 'Write about organic food prices vs conventional — is the premium worth it in 2025? Cover which organic items have the smallest price difference.' },
  { id: 'costco-sams-club-savings', prompt: 'Write about how much shoppers can save at warehouse clubs like Costco and Sam\'s Club vs regular grocery stores. Include which specific items have the biggest savings.' },
  { id: 'frozen-food-prices', prompt: 'Write about frozen food prices rising as a budget-friendly alternative to fresh. Cover which frozen items are still a bargain and which have gotten expensive.' },
  { id: 'grocery-budget-tips-2025', prompt: 'Write practical tips for keeping your grocery bill under $150/week for a family of four in 2025. Focus on meal planning, store brands, and seasonal buying.' },
  { id: 'produce-prices-spring', prompt: 'Write about fresh produce prices and how spring crops affect grocery store shelves. Cover which fruits and vegetables are cheapest right now.' },
  { id: 'pork-prices-2025', prompt: 'Write about pork and bacon prices in 2025. Cover supply trends, seasonal demand, and whether prices are expected to rise or fall.' },
  { id: 'baby-food-formula-costs', prompt: 'Write about the ongoing cost pressures on baby food and infant formula. Cover price increases, store brand alternatives, and what parents can do to save.' },
  { id: 'snack-food-inflation', prompt: 'Write about snack food prices — chips, crackers, cookies — rising faster than other grocery categories. Cover brand strategies and store-brand alternatives.' },
  { id: 'store-brand-vs-name-brand', prompt: 'Write about store brand vs name brand groceries in 2025. How much can switching to store brands save you and which categories have the best quality store brands?' },
  { id: 'grocery-prices-midwest', prompt: 'Write about why grocery prices are lower in Midwest states like Iowa, Missouri, and Nebraska compared to coastal states. Cover local farming, distribution costs, and specific price examples.' },
  { id: 'grocery-prices-california', prompt: 'Write about why California has some of the highest grocery prices in the US. Cover labor costs, regulations, and how prices compare to national averages.' },
  { id: 'grocery-prices-florida', prompt: 'Write about grocery prices in Florida — seasonal patterns, hurricane impacts on food supply, and which chains offer the best prices.' },
  { id: 'grocery-prices-texas', prompt: 'Write about grocery prices in Texas. Cover the large discount chains, regional Mexican grocery stores, and how Texas beef production affects local prices.' },
  { id: 'food-bank-demand-2025', prompt: 'Write about how food bank usage has surged as grocery inflation strains family budgets. Cover statistics and practical resources for families struggling with food costs.' },
  { id: 'grocery-loyalty-programs', prompt: 'Write about grocery store loyalty programs and digital coupons — which ones save the most money in 2025 and how to maximize them.' },
  { id: 'amazon-fresh-grocery-prices', prompt: 'Write about Amazon Fresh and online grocery delivery prices vs in-store shopping. Is the convenience worth the price premium in 2025?' },
]

function toSlug(headline: string, id: string): string {
  return headline.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80)
    .replace(/-$/, '') + '-' + id.slice(-6)
}

async function kvExists(key: string): Promise<boolean> {
  try { return (await kv.exists(key)) > 0 } catch { return false }
}

async function generateFromTopic(topic: typeof TOPICS[0]): Promise<Article | null> {
  if (!ANTHROPIC) return null

  const systemPrompt = `You are a grocery price data journalist. Write SEO-optimized articles about grocery prices and food costs for American consumers.

Format your response as valid JSON with these exact fields:
{
  "headline": "Compelling 60-80 char SEO headline about grocery prices",
  "subhead": "2-sentence summary, 120-160 chars",
  "body": "4-6 paragraphs of informative content. Include specific price data, percentages, and practical consumer advice. Each paragraph 80-120 words.",
  "tags": ["array", "of", "5-8", "topic", "tags"],
  "geo_tags": ["array of 2-4 US state names mentioned, or empty array"],
  "faqs": [
    {"q": "Question about this grocery topic?", "a": "Detailed answer 2-3 sentences."},
    {"q": "Another relevant question?", "a": "Helpful answer."},
    {"q": "Third question?", "a": "Third answer."}
  ]
}

Use current 2025-2026 context. Be specific with numbers. Write for US consumers searching for grocery price information.`

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5',
      max_tokens: 1500,
      system: systemPrompt,
      messages: [{ role: 'user', content: topic.prompt }],
    }),
  })

  if (!res.ok) return null
  const data = await res.json() as any
  const raw = data.content?.[0]?.text ?? ''

  try {
    const json = JSON.parse(raw.match(/\{[\s\S]*\}/)?.[0] ?? raw)
    return {
      id: topic.id,
      slug: toSlug(json.headline, topic.id),
      headline: json.headline,
      subhead: json.subhead,
      body: json.body,
      tags: json.tags ?? [],
      geo_tags: json.geo_tags ?? [],
      faqs: json.faqs ?? [],
      generated_at: new Date().toISOString(),
    }
  } catch { return null }
}

export async function GET(req: Request) {
  // Allow both GET (for manual testing) and POST (for cron)
  return handler(req)
}

export async function POST(req: Request) {
  return handler(req)
}

async function handler(_req: Request) {
  if (!ANTHROPIC) {
    return NextResponse.json({ ok: false, error: 'ANTHROPIC_API_KEY not set' }, { status: 500 })
  }

  // Find the first unseen topic
  let topic: typeof TOPICS[0] | null = null
  for (const t of TOPICS) {
    if (!(await kvExists(`wtgb:topic:seen:${t.id}`))) {
      topic = t
      break
    }
  }

  if (!topic) {
    return NextResponse.json({ ok: true, note: 'all_topics_used', total: TOPICS.length })
  }

  const article = await generateFromTopic(topic)
  if (!article) {
    return NextResponse.json({ ok: false, error: 'generation_failed' }, { status: 500 })
  }

  // Store article + mark topic as seen
  await kv.set(`wtgb:article:${article.slug}`, article, { ex: 60 * 60 * 24 * 90 })
  await kv.lpush('wtgb:articles:index', article.slug)
  await kv.set(`wtgb:topic:seen:${topic.id}`, 1, { ex: 60 * 60 * 24 * 180 }) // 6mo

  // Invalidate the latest cache so the new article appears immediately
  await kv.del('wtgb:articles:latest').catch(() => null)

  return NextResponse.json({ ok: true, slug: article.slug, headline: article.headline, topic: topic.id })
}
