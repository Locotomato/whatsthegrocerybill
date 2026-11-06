/**
 * Shared article utilities — slug generation, tweet fetching, article generation.
 * Used by both /api/articles and /news/[slug]/page.tsx
 */

import { pickAuthor } from './authors'
import { writeCheckedDraft, type Source } from './sourcedDraft'

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

export type NewsItem = { id: string; title: string; link: string; feed: string; pubDate: Date }

/** Writes an article from the publisher's own text. Returns null if anything fails. */
export async function generateSourcedArticle(item: NewsItem, source: Source): Promise<Omit<Article, 'slug'> | null> {
  // Google News titles end with " - Publisher".
  const publisher = item.title.match(/ - ([^-]+)$/)?.[1]?.trim() || item.feed
  const publishedOn = item.pubDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
  const result = await writeCheckedDraft({ title: item.title, publisher, publishedOn, source })
  if (!result.ok) {
    console.warn(`[generate] Rejected "${item.title}": ${result.reason}`)
    return null
  }

  const draft = result.value
  const now = new Date().toISOString()
  return {
    id: item.id,
    headline: draft.headline.trim(),
    subhead: draft.subhead.trim(),
    body: `${draft.body.trim()}\n\nBased on reporting by ${publisher}, published ${publishedOn}. Grocery prices vary by store and region.`,
    faqs: draft.faqs.slice(0, 5),
    sources: [{ name: publisher, url: source.url }],
    tags: draft.tags.slice(0, 10),
    geo_tags: draft.geo_tags,
    source_tweet: { id: item.id, text: item.title, author: publisher, username: '', url: source.url, created_at: now },
    author: pickAuthor().name,
    generated_at: Date.now(),
    publishedAt: now,
  }
}
