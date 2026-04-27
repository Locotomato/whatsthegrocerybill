#!/usr/bin/env node
/**
 * batch-rewrite-wtgb.mjs
 * One-time script: regenerate all existing WTGB articles with the upgraded
 * claude-sonnet-4-6 prompt (1550+ word minimum, 8 sections, author attribution).
 *
 * Run:
 *   node scripts/batch-rewrite-wtgb.mjs
 *   node scripts/batch-rewrite-wtgb.mjs --dry-run
 *   node scripts/batch-rewrite-wtgb.mjs --limit 5
 *   node scripts/batch-rewrite-wtgb.mjs --after some-article-slug
 *
 * Required env vars (pull from Vercel or .env.local):
 *   KV_REST_API_URL
 *   KV_REST_API_TOKEN
 *   ANTHROPIC_API_KEY
 */

import { createHash } from 'node:crypto'

// ── Config ────────────────────────────────────────────────────────────────────
const KV_URL   = process.env.KV_REST_API_URL
const KV_TOKEN = process.env.KV_REST_API_TOKEN
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY

if (!KV_URL || !KV_TOKEN || !ANTHROPIC_KEY) {
  console.error('❌  Missing required env vars: KV_REST_API_URL, KV_REST_API_TOKEN, ANTHROPIC_API_KEY')
  process.exit(1)
}

const args = process.argv.slice(2)
const DRY_RUN = args.includes('--dry-run')
const LIMIT = (() => { const i = args.indexOf('--limit'); return i !== -1 ? parseInt(args[i + 1], 10) : Infinity })()
const AFTER_SLUG = (() => { const i = args.indexOf('--after'); return i !== -1 ? args[i + 1] : null })()
const RATE_LIMIT_MS = 3000
const ARTICLE_TTL = 60 * 60 * 24 * 60 // 60 days
const MIN_WORDS = 1550

console.log(`\n🔁 WTGB Batch Rewrite — ${DRY_RUN ? 'DRY RUN' : 'LIVE'}`)
if (LIMIT !== Infinity) console.log(`   Limit: ${LIMIT} articles`)
if (AFTER_SLUG) console.log(`   Starting after: ${AFTER_SLUG}`)
console.log()

// ── Vercel KV REST helpers ────────────────────────────────────────────────────
async function kvCommand(...args) {
  const res = await fetch(`${KV_URL}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${KV_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(args),
  })
  if (!res.ok) throw new Error(`KV error: ${res.status} ${await res.text()}`)
  const data = await res.json()
  return data.result
}

async function kvGet(key) {
  return kvCommand('GET', key)
}

async function kvSet(key, value, ex) {
  if (ex) return kvCommand('SET', key, JSON.stringify(value), 'EX', ex)
  return kvCommand('SET', key, JSON.stringify(value))
}

async function kvLrange(key, start, end) {
  return kvCommand('LRANGE', key, start, end)
}

// ── Writers ───────────────────────────────────────────────────────────────────
const WRITERS = [
  {
    id: 'carmen-reyes',
    name: 'Carmen Reyes',
    title: 'Consumer Economics Reporter',
    styleNote: "Write from the family budget perspective. Connect macro food market events directly to what shoppers feel at checkout. Tone is empathetic, specific, and actionable — always end with what readers should actually do.",
  },
  {
    id: 'jordan-holt',
    name: 'Jordan Holt',
    title: 'Food Supply Chain Analyst',
    styleNote: "Write with data authority. Lead with USDA figures, supply chain specifics, and category-level price moves. Tone is Bloomberg meets the grocery aisle — authoritative and clear about uncertainty.",
  },
  {
    id: 'priya-nair',
    name: 'Priya Nair',
    title: 'Household Finance Writer',
    styleNote: "Write for the budget-conscious reader. Translate supply and price signals into concrete shopping decisions. Tone is Consumer Reports meets your smart friend — practical, warm, and never condescending.",
  },
]

function assignWriter(signalId) {
  const hash = signalId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return WRITERS[hash % WRITERS.length]
}

// ── Quality helpers ───────────────────────────────────────────────────────────
const FLUFF_PHRASES = [
  'in conclusion', 'ever-evolving', "it's worth noting", "it's important to understand",
  'it is worth noting', 'it is important to understand', 'in summary', 'to summarize',
]

function countWords(text) {
  return text.trim().split(/\s+/).filter(Boolean).length
}

function isLowQuality(body) {
  const lower = body.toLowerCase()
  return FLUFF_PHRASES.some(p => lower.includes(p))
}

function topicFingerprintTag(headline) {
  const STOPWORDS = new Set([
    'a','an','the','and','or','but','in','on','at','to','for','of','with',
    'as','by','from','is','are','was','were','be','been','being','have',
    'has','had','do','does','did','will','would','could','should','may',
    'might','can','that','this','these','those','it','its','we','us','our',
    'they','their','you','your','he','she','his','her','up','down','out',
    'new','now','how','what','why','when','where','which','who','over','after',
  ])
  const words = headline.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/)
    .filter(w => w.length > 2 && !STOPWORDS.has(w))
  const top5 = words.slice(0, 5).sort().join('|')
  const hash = createHash('sha256').update(top5).digest('hex').slice(0, 12)
  return `fp:${hash}`
}

// ── Generation ────────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are a senior consumer economics journalist writing for whatsthegrocerybill.com — a grocery price intelligence site tracking the cost of food across America for everyday shoppers, families, and budget-conscious consumers. Your job is to write substantive, deeply reported articles that give readers genuine insight into grocery price movements and what to do about them.

CRITICAL QUALITY RULES:
- Write REAL, INFORMATIVE content — no filler, no padding, no generic statements
- Every section must add new, specific information not repeated elsewhere
- Include real figures: price per unit, % changes, specific categories (eggs, milk, beef, chicken, bread, cereal, cooking oil)
- Reference real organizations: USDA, BLS, ERS, NASS, Progressive Grocer, Reuters
- Track key grocery categories: eggs, milk, bread, chicken, beef, pork, produce, cereal, cooking oil
- Tone: Consumer Reports meets Main Street — authoritative but friendly and practical
- Never fabricate prices; hedge with "could", "may", "analysts expect" when uncertain
- SEO: naturally include "grocery prices today", "cost of groceries", "average grocery bill" at least once each

Return ONLY valid JSON — no markdown fences, no commentary:
{
  "headline": "8–12 word headline with primary keyword near the front",
  "subhead": "One crisp sentence adding context. Include a price figure or % change if available.",
  "body": "Full article body — separate sections with \\n\\n — TARGET 1500–1700 WORDS TOTAL:

## What's Happening
[250 words — specific grocery market event. Price figures for affected categories.]

## Why It Matters for Your Grocery Bill
[250 words — checkout-level impact. Which items affected. Regional variation.]

## What's Driving This
[200 words — root causes: weather, supply chain, avian flu, drought, trade policy, tariffs, harvest surplus, labor costs. Specific.]

## Historical Context
[150 words — how this compares to prior price moves with actual figures.]

## Category Breakdown
[200 words — deep dive into affected categories: eggs, milk, beef, chicken, pork, produce, bread, cereal, cooking oil. Price ranges where known.]

## What This Means for Families
[200 words — concrete budget impact. Weekly grocery bill change. Substitution strategies.]

## What This Means for Restaurants and Food Businesses
[150 words — ingredient cost flow-through to menu prices. Which segments feel it first.]

## What Shoppers Should Expect
[150 words — outlook and timeline. One concrete action: best time to buy in bulk, which stores post lowest prices first, apps like Flipp for price comparison.]",
  "faqs": [
    {"q": "direction-specific question 1", "a": "Full 2–3 sentence answer specific to this event."},
    {"q": "direction-specific question 2", "a": "Full 2–3 sentence answer with specific items."},
    {"q": "direction-specific question 3", "a": "Full 2–3 sentence realistic outlook."},
    {"q": "direction-specific question 4", "a": "Full 2–3 sentence practical answer."}
  ],
  "sources": [
    {"name": "USDA Economic Research Service", "url": "https://www.ers.usda.gov/topics/food-markets-prices/"},
    {"name": "Bureau of Labor Statistics CPI", "url": "https://www.bls.gov/cpi/"}
  ],
  "tags": ["5–7 tags mixing topic and question-style tags"],
  "geo_tags": ["US state names relevant to this story"]
}`

async function callClaude(systemPrompt, userPrompt, temperature) {
  const body = {
    model: 'claude-sonnet-4-6',
    max_tokens: 4000,
    temperature,
    messages: [{ role: 'user', content: userPrompt }],
  }
  if (systemPrompt) body.system = systemPrompt

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) { console.error(`Claude API error: ${res.status}`); return null }
  const data = await res.json()
  return data.content?.[0]?.text?.trim() ?? null
}

function parseJSON(raw) {
  const cleaned = raw.replace(/^```json\s*/i, '').replace(/\s*```$/, '').trim()
  return JSON.parse(cleaned)
}

function detectDirection(article) {
  // Try to infer direction from existing article content
  const text = ((article.headline ?? '') + ' ' + (article.subhead ?? '') + ' ' + (article.body ?? '')).toLowerCase()
  const upSignals = ['rise', 'rising', 'high', 'surge', 'jump', 'increase', 'up ', 'higher', 'record']
  const downSignals = ['fall', 'falling', 'drop', 'decline', 'lower', 'ease', 'relief', 'cheaper', 'down ']
  const upScore = upSignals.filter(w => text.includes(w)).length
  const downScore = downSignals.filter(w => text.includes(w)).length
  return downScore > upScore ? 'falling' : 'rising'
}

async function generateUpgradedArticle(article) {
  const writer = assignWriter(article.id)
  const direction = detectDirection(article)

  // Signal text: prefer source_tweet, fallback to headline+subhead
  const signalText = article.source_tweet?.text
    ?? `${article.headline ?? ''} ${article.subhead ?? ''}`.trim()
  const signalUsername = article.source_tweet?.username ?? 'market-signal'

  if (!signalText) return null

  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  const userPrompt = `You are ${writer.name}, ${writer.title} at whatsthegrocerybill.com.
Writing style: ${writer.styleNote}

A market signal came in showing grocery prices are ${direction}. Write a fully SEO-optimized, in-depth article of 1500–1700 words. Every section must be substantive — no filler.

TWEET: "${signalText}"
SOURCE: @${signalUsername}
DATE: ${today}
DIRECTION: prices ${direction}`

  let raw = await callClaude(SYSTEM_PROMPT, userPrompt, 0.3)
  if (!raw) return null

  let parsed
  try { parsed = parseJSON(raw) } catch { return null }

  let wordCount = countWords(parsed.body ?? '')
  if (wordCount < MIN_WORDS) {
    console.log(`   [REPAIR] ${wordCount}w < ${MIN_WORDS} — running repair call`)
    const repairPrompt = `The article body was only ${wordCount} words — needs ${MIN_WORDS}+. Expand Historical Context, Category Breakdown, and What Shoppers Should Expect with more specific data. Do NOT pad — add genuinely new information. Return complete updated JSON.\n\n${raw}`
    const repairRaw = await callClaude(null, repairPrompt, 0.2)
    if (repairRaw) {
      try {
        const repairParsed = parseJSON(repairRaw)
        const repairCount = countWords(repairParsed.body ?? '')
        if (repairCount >= MIN_WORDS) { parsed = repairParsed; wordCount = repairCount }
        else { console.log(`   [SKIP] repair only produced ${repairCount}w`); return null }
      } catch { return null }
    }
  }

  if (isLowQuality(parsed.body ?? '')) { console.log('   [SKIP] fluff detected'); return null }

  const fingerprintTag = topicFingerprintTag(signalText)
  const tags = [...new Set([...(parsed.tags ?? []), fingerprintTag])]

  return {
    ...article,
    headline: parsed.headline ?? article.headline,
    subhead: parsed.subhead ?? article.subhead,
    body: parsed.body,
    faqs: parsed.faqs ?? [],
    sources: (parsed.sources ?? []).filter(s => s?.name && s?.url),
    tags,
    geo_tags: parsed.geo_tags ?? article.geo_tags ?? [],
    writer_id: writer.id,
    author: writer.name,
    generated_at: Date.now(),
    _wordCount: wordCount,
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  // Fetch all slugs from the WTGB index
  console.log('📥 Fetching article index from KV...')
  const allSlugs = await kvLrange('wtgb:articles:index', 0, -1)
  if (!allSlugs?.length) { console.log('No articles found in index.'); return }

  const slugs = [...new Set(allSlugs)]
  console.log(`   Found ${slugs.length} unique articles (${allSlugs.length} raw entries)\n`)

  let started = AFTER_SLUG === null
  let processed = 0, updated = 0, skipped = 0, errors = 0

  for (const slug of slugs) {
    if (!started) {
      if (slug === AFTER_SLUG) started = true
      continue
    }
    if (processed >= LIMIT) break

    processed++
    process.stdout.write(`[${processed}] ${slug} — `)

    // Fetch article from KV
    let article
    try {
      const raw = await kvGet(`wtgb:article:${slug}`)
      article = typeof raw === 'string' ? JSON.parse(raw) : raw
    } catch (e) {
      console.log(`ERROR fetching: ${e.message}`)
      errors++
      continue
    }

    if (!article) { console.log('not found in KV, skipping'); skipped++; continue }

    if (DRY_RUN) {
      console.log(`DRY RUN — would regenerate (current: ~${countWords(article.body ?? '')}w, direction: ${detectDirection(article)})`)
      continue
    }

    // Generate upgraded article
    let upgraded
    try {
      upgraded = await generateUpgradedArticle(article)
    } catch (e) {
      console.log(`ERROR generating: ${e.message}`)
      errors++
      await new Promise(r => setTimeout(r, RATE_LIMIT_MS))
      continue
    }

    if (!upgraded) { skipped++; continue }

    // Write back to KV
    try {
      const { _wordCount, ...toStore } = upgraded
      await kvSet(`wtgb:article:${slug}`, toStore, ARTICLE_TTL)
      console.log(`✅ ${_wordCount}w`)
      updated++
    } catch (e) {
      console.log(`ERROR writing to KV: ${e.message}`)
      errors++
    }

    await new Promise(r => setTimeout(r, RATE_LIMIT_MS))
  }

  console.log(`\n── Summary ──────────────────────────────`)
  console.log(`   Processed : ${processed}`)
  console.log(`   Updated   : ${updated}`)
  console.log(`   Skipped   : ${skipped}`)
  console.log(`   Errors    : ${errors}`)
  if (DRY_RUN) console.log('\n   (DRY RUN — no changes written to KV)')
}

main().catch(e => { console.error(e); process.exit(1) })
