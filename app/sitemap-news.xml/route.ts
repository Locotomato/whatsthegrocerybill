/**
 * /sitemap-news.xml — Google News Sitemap
 * Includes articles published in the last 2 days (Google News requires < 2 days)
 */
import { NextResponse } from 'next/server'
import type { Article } from '../../lib/articleUtils'

export const revalidate = 3600 // 1h

const BASE_URL = 'https://whatsthegrocerybill.com'
const SITE_NAME = "What's The Grocery Bill"

function parseArticle(a: unknown): Article | null {
  if (!a) return null
  try {
    const art = typeof a === 'string' ? JSON.parse(a) : a
    if (art?.slug && art?.headline) return art as Article
  } catch { /* */ }
  return null
}

export async function GET() {
  const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000
  const cutoff = Date.now() - TWO_DAYS_MS

  let articles: Article[] = []
  try {
    const { kv } = await import('@vercel/kv')
    const slugs = await kv.lrange<string>('wtgb:articles:index', 0, 99)
    const raws = await Promise.all((slugs ?? []).map(s => kv.get(`wtgb:article:${s}`)))
    articles = raws
      .map(parseArticle)
      .filter((a): a is Article => {
        if (!a) return false
        const pub = a.publishedAt
          ? new Date(a.publishedAt).getTime()
          : a.source_tweet?.created_at
            ? new Date(a.source_tweet.created_at).getTime()
            : 0
        return pub > cutoff
      })
  } catch { /* return empty sitemap on KV failure */ }

  const items = articles.map(a => {
    const pub = a.publishedAt
      ? new Date(a.publishedAt).toISOString()
      : a.source_tweet?.created_at
        ? new Date(a.source_tweet.created_at).toISOString()
        : new Date().toISOString()
    const title = a.headline
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
    return `  <url>
    <loc>${BASE_URL}/news/${a.slug}</loc>
    <news:news>
      <news:publication>
        <news:name>${SITE_NAME}</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${pub}</news:publication_date>
      <news:title>${title}</news:title>
    </news:news>
  </url>`
  }).join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${items}
</urlset>`

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
