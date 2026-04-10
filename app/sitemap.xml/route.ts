import { NextResponse } from 'next/server'

export const revalidate = 3600

const BASE = 'https://whatsthegrocerybill.com'

export async function GET() {
  const now = new Date().toISOString()
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap><loc>${BASE}/sitemap-core.xml</loc><lastmod>${now}</lastmod></sitemap>
  <sitemap><loc>${BASE}/sitemap-states.xml</loc><lastmod>${now}</lastmod></sitemap>
  <sitemap><loc>${BASE}/sitemap-brands.xml</loc><lastmod>${now}</lastmod></sitemap>
  <sitemap><loc>${BASE}/sitemap-cities.xml</loc><lastmod>${now}</lastmod></sitemap>
  <sitemap><loc>${BASE}/sitemap-articles.xml</loc><lastmod>${now}</lastmod></sitemap>
  <sitemap><loc>${BASE}/sitemap-news.xml</loc><lastmod>${now}</lastmod></sitemap>
</sitemapindex>`
  return new NextResponse(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } })
}
