import { NextResponse } from 'next/server'
import { STATE_CITIES } from '../../lib/cities'

export const revalidate = 86400

const BASE = 'https://whatsthegrocerybill.com'

export async function GET() {
  const now = new Date().toISOString()
  const items: string[] = []

  for (const [stateSlug, cities] of Object.entries(STATE_CITIES)) {
    for (const city of cities) {
      items.push(`  <url>
    <loc>${BASE}/grocery-prices/${stateSlug}/${city.slug}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>`)
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${items.join('\n')}
</urlset>`
  return new NextResponse(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } })
}
