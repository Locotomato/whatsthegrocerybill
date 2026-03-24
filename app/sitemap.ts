import type { MetadataRoute } from 'next'
import { STATE_CITIES } from '../lib/cities'
import { BRAND_STATES } from './components/WarehouseClubStatePage'

const BASE = 'https://whatsthegrocerybill.com'

const US_STATES = [
  'alabama','alaska','arizona','arkansas','california','colorado','connecticut',
  'delaware','florida','georgia','hawaii','idaho','illinois','indiana','iowa',
  'kansas','kentucky','louisiana','maine','maryland','massachusetts','michigan',
  'minnesota','mississippi','missouri','montana','nebraska','nevada',
  'new-hampshire','new-jersey','new-mexico','new-york','north-carolina',
  'north-dakota','ohio','oklahoma','oregon','pennsylvania','rhode-island',
  'south-carolina','south-dakota','tennessee','texas','utah','vermont',
  'virginia','washington','west-virginia','wisconsin','wyoming',
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  // Static pages
  const statics: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: now, changeFrequency: 'hourly', priority: 1 },
    { url: `${BASE}/news`, lastModified: now, changeFrequency: 'hourly', priority: 0.9 },
    { url: `${BASE}/guides`, lastModified: now, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${BASE}/guides/why-are-egg-prices-so-high`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/guides/how-to-save-money-on-groceries`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/guides/cheapest-grocery-stores-compared`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/guides/inflation-and-your-grocery-bill`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/guides/grocery-prices-by-state`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/guides/what-affects-grocery-prices`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/grocery-prices/sams-club`, lastModified: now, changeFrequency: 'daily', priority: 0.85 },
    { url: `${BASE}/grocery-prices/costco`, lastModified: now, changeFrequency: 'daily', priority: 0.85 },
    { url: `${BASE}/grocery-prices/bjs`, lastModified: now, changeFrequency: 'daily', priority: 0.85 },
    
    
    
    { url: `${BASE}/grocery-prices/walmart`, lastModified: now, changeFrequency: 'daily', priority: 0.85 },
    
    { url: `${BASE}/grocery-prices/kroger`, lastModified: now, changeFrequency: 'daily', priority: 0.85 },
    
  ]

  // State pages
  const statePages: MetadataRoute.Sitemap = US_STATES.map(s => ({
    url: `${BASE}/grocery-prices/${s}`,
    lastModified: now,
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }))

  // Latest articles (best-effort — don't block sitemap if API is down)
  let articlePages: MetadataRoute.Sitemap = []
  try {
    const res = await fetch(`${BASE}/api/articles`, { next: { revalidate: 7200 } })
    if (res.ok) {
      const data = await res.json()
      articlePages = (data.articles ?? []).map((a: { slug: string; source_tweet: { created_at: string } }) => ({
        url: `${BASE}/news/${a.slug}`,
        lastModified: new Date(a.source_tweet.created_at),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }))
    }
  } catch { /* sitemap works fine without articles */ }

  // City pages (~400 pages)
  const cityPages: MetadataRoute.Sitemap = []
  for (const [stateSlug, cities] of Object.entries(STATE_CITIES)) {
    for (const city of cities) {
      cityPages.push({
        url: `${BASE}/grocery-prices/${stateSlug}/${city.slug}`,
        lastModified: now,
        changeFrequency: 'daily' as const,
        priority: 0.75,
      })
    }
  }

  // Warehouse club state pages (~215 pages)
  const clubStatePages: MetadataRoute.Sitemap = []
  const brands = ['sams-club', 'costco', 'bjs', 'walmart', 'kroger']
  for (const brand of brands) {
    for (const stateSlug of (BRAND_STATES[brand] ?? [])) {
      clubStatePages.push({
        url: `${BASE}/grocery-prices/${brand}/${stateSlug}`,
        lastModified: now,
        changeFrequency: 'daily' as const,
        priority: 0.8,
      })
    }
  }

  return [...statics, ...statePages, ...cityPages, ...clubStatePages, ...articlePages]
}
