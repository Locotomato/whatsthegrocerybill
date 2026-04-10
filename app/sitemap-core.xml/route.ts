import { NextResponse } from 'next/server'

export const revalidate = 3600

const BASE = 'https://whatsthegrocerybill.com'

const STATIC_PAGES = [
  { url: `${BASE}/`,                                              priority: '1.0',  changefreq: 'hourly'  },
  { url: `${BASE}/near-me`,                                       priority: '0.95', changefreq: 'daily'   },
  { url: `${BASE}/news`,                                          priority: '0.9',  changefreq: 'hourly'  },
  { url: `${BASE}/guides`,                                        priority: '0.85', changefreq: 'weekly'  },
  { url: `${BASE}/guides/why-are-egg-prices-so-high`,             priority: '0.85', changefreq: 'monthly' },
  { url: `${BASE}/guides/how-to-save-money-on-groceries`,         priority: '0.85', changefreq: 'monthly' },
  { url: `${BASE}/guides/cheapest-grocery-stores-compared`,       priority: '0.85', changefreq: 'monthly' },
  { url: `${BASE}/guides/inflation-and-your-grocery-bill`,        priority: '0.85', changefreq: 'monthly' },
  { url: `${BASE}/guides/grocery-prices-by-state`,                priority: '0.85', changefreq: 'monthly' },
  { url: `${BASE}/guides/what-affects-grocery-prices`,            priority: '0.85', changefreq: 'monthly' },
  { url: `${BASE}/grocery-prices/sams-club`,                      priority: '0.9',  changefreq: 'daily'   },
  { url: `${BASE}/grocery-prices/costco`,                         priority: '0.9',  changefreq: 'daily'   },
  { url: `${BASE}/grocery-prices/bjs`,                            priority: '0.9',  changefreq: 'daily'   },
  { url: `${BASE}/grocery-prices/walmart`,                        priority: '0.9',  changefreq: 'daily'   },
  { url: `${BASE}/grocery-prices/kroger`,                         priority: '0.9',  changefreq: 'daily'   },
]

const now = new Date().toISOString()

function urlEntry(page: { url: string; priority: string; changefreq: string }) {
  return `  <url>
    <loc>${page.url}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
}

export async function GET() {
  const items = STATIC_PAGES.map(urlEntry).join('\n')
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${items}
</urlset>`
  return new NextResponse(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } })
}
