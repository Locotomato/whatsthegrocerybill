import { NextResponse } from 'next/server'

export const revalidate = 3600

const BASE = 'https://whatsthegrocerybill.com'

interface ArticleRecord {
  slug: string
  publishedAt?: string
  source_tweet?: { created_at?: string } | null
}

export async function GET() {
  let articles: ArticleRecord[] = []

  try {
    const res = await fetch(`${BASE}/api/articles?limit=500`, {
      next: { revalidate: 3600 },
    })
    if (res.ok) {
      const data = await res.json()
      articles = data.articles ?? []
    }
  } catch {
    /* best-effort — return empty sitemap if API is down */
  }

  const now = new Date().toISOString()
  const items = articles.map((a) => {
    const lastmod = a.publishedAt
      ? new Date(a.publishedAt).toISOString()
      : a.source_tweet?.created_at
        ? new Date(a.source_tweet.created_at).toISOString()
        : now
    return `  <url>
    <loc>${BASE}/news/${a.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`
  }).join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${items}
</urlset>`
  return new NextResponse(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } })
}
