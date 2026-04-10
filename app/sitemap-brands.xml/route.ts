import { NextResponse } from 'next/server'
import { BRAND_STATES } from '../components/WarehouseClubStatePage'

export const revalidate = 3600

const BASE = 'https://whatsthegrocerybill.com'

export async function GET() {
  const now = new Date().toISOString()
  const items: string[] = []

  for (const [brand, states] of Object.entries(BRAND_STATES)) {
    for (const state of states) {
      items.push(`  <url>
    <loc>${BASE}/grocery-prices/${brand}/${state}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.75</priority>
  </url>`)
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${items.join('\n')}
</urlset>`
  return new NextResponse(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } })
}
