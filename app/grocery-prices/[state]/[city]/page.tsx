import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { STATE_CITIES, getCitiesForState } from '../../../../lib/cities'
import { STATE_ABBR, toTitleCase } from '../../../../lib/stateData'
import NavHeader from '../../../components/NavHeader'
import RadUnit from '../../../../components/RadUnit'

// Helper maps derived from stateData
const STATE_NAMES: Record<string, string> = Object.fromEntries(
  Object.keys(STATE_ABBR).map(slug => [slug, toTitleCase(slug)])
)
const STATE_ABBRS = STATE_ABBR

export const dynamic = 'force-dynamic'
export const revalidate = 3600 // refresh prices every hour

interface Props {
  params: Promise<{ state: string; city: string }>
}

// Static params for all ~400 city pages
export async function generateStaticParamsDisabled() {
  const params: { state: string; city: string }[] = []
  for (const [stateSlug, cities] of Object.entries(STATE_CITIES)) {
    for (const city of cities) {
      params.push({ state: stateSlug, city: city.slug })
    }
  }
  return params
}

async function getStatePrice(stateAbbr: string): Promise<number | null> {
  try {
    const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://whatsthegrocerybill.com'
    const res  = await fetch(`${base}/api/grocery-prices`, { next: { revalidate: 3600 } })
    if (!res.ok) return null
    const data = await res.json()
    return data.states?.[stateAbbr]?.price ?? null
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { state: stateSlug, city: citySlug } = await params
  const cities = getCitiesForState(stateSlug)
  const city   = cities.find(c => c.slug === citySlug)
  if (!city) return { title: 'Not Found' }

  const stateName = STATE_NAMES[stateSlug] ?? stateSlug
  const stateAbbr = STATE_ABBRS[stateSlug] ?? ''
  const statePrice = await getStatePrice(stateAbbr)
  const cityPrice  = statePrice ? ((statePrice * 100 + city.adjustment) / 100).toFixed(2) : null
  const priceStr   = cityPrice ? `$${cityPrice}/wk` : 'Live data'
  const today      = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'America/New_York' })

  const title = `Grocery Prices in ${city.name}, ${stateAbbr} — ${priceStr} (${today})`
  const desc  = `How much does a week of groceries cost in ${city.name}, ${stateName}? The average weekly grocery basket is ${priceStr} today. Compare to the ${stateName} state average and find the cheapest stores near you.`

  return {
    title,
    description: desc,
    alternates: { canonical: `https://whatsthegrocerybill.com/grocery-prices/${stateSlug}/${citySlug}` },
    openGraph: {
      title,
      description: desc,
      url: `https://whatsthegrocerybill.com/grocery-prices/${stateSlug}/${citySlug}`,
      siteName: "What's the Grocery Bill?",
      type: 'website',
      images: [{ url: 'https://whatsthegrocerybill.com/og/grocery-prices.png', width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: desc,
      site: '@wtgbofficial',
      images: ['https://whatsthegrocerybill.com/og/grocery-prices.png'],
    },
  }
}

export default async function CityGroceryPricePage({ params }: Props) {
  const { state: stateSlug, city: citySlug } = await params
  const cities    = getCitiesForState(stateSlug)
  const city      = cities.find(c => c.slug === citySlug)
  if (!city) notFound()

  const stateName  = STATE_NAMES[stateSlug] ?? stateSlug
  const stateAbbr  = STATE_ABBRS[stateSlug] ?? ''
  const statePrice = await getStatePrice(stateAbbr)
  const cityPrice  = statePrice ? Math.round((statePrice * 100 + city.adjustment)) / 100 : null
  const today      = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'America/New_York' })

  // Sort nearby cities (exclude current)
  const nearbyCities = cities.filter(c => c.slug !== citySlug).slice(0, 4)

  // Determine price direction vs state avg
  const priceDiff = city.adjustment
  const diffLabel = priceDiff > 0 ? `$${(priceDiff / 100).toFixed(2)} above` : priceDiff < 0 ? `$${(Math.abs(priceDiff) / 100).toFixed(2)} below` : 'at'

  const siteUrl = `https://whatsthegrocerybill.com/grocery-prices/${stateSlug}/${citySlug}`

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': siteUrl,
        url: siteUrl,
        name: `Grocery Prices in ${city.name}, ${stateAbbr}`,
        description: `How much does a week of groceries cost in ${city.name}, ${stateName}? Current grocery basket prices and store comparisons.`,
        breadcrumb: {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://whatsthegrocerybill.com' },
            { '@type': 'ListItem', position: 2, name: 'Grocery Prices by State', item: 'https://whatsthegrocerybill.com/grocery-prices' },
            { '@type': 'ListItem', position: 3, name: `${stateName} Grocery Prices`, item: `https://whatsthegrocerybill.com/grocery-prices/${stateSlug}` },
            { '@type': 'ListItem', position: 4, name: `${city.name} Grocery Prices`, item: siteUrl },
          ],
        },
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: `How much does a week of groceries cost in ${city.name}?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: cityPrice
                ? `The estimated weekly grocery basket in ${city.name}, ${stateName} is approximately $${cityPrice.toFixed(2)} as of ${today}. This reflects a standard basket of staples including eggs, milk, bread, beef, chicken, and produce.`
                : `Grocery prices in ${city.name} are updated regularly. Check back for the latest figures.`,
            },
          },
          {
            '@type': 'Question',
            name: `How do ${city.name} grocery prices compare to the ${stateName} average?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: statePrice
                ? `${city.name} grocery prices are typically ${diffLabel} the ${stateName} state average of $${statePrice.toFixed(2)}/wk. Urban areas generally run higher due to higher operating costs, real estate, and distribution expenses.`
                : `${city.name} prices generally track the ${stateName} statewide average closely.`,
            },
          },
          {
            '@type': 'Question',
            name: `What are the cheapest grocery stores in ${city.name}?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `Studies consistently rank Aldi and Lidl as the cheapest major grocery chains in most markets, typically 15–25% below average. Walmart Neighborhood Market and Walmart Supercenter are also consistently low-priced options in ${city.name}. Warehouse clubs like Costco and Sam's Club offer the best per-unit prices on bulk staples.`,
            },
          },
        ],
      },
    ],
  }

  const C = {
    bg: '#0b0d14', card: '#111827', border: 'rgba(255,255,255,0.07)',
    green: '#22c55e', blue: '#3b82f6', text: '#f1f5f9', muted: '#64748b',
    stone: '#94a3b8',
  }
  const F = "'Inter', system-ui, sans-serif"

  return (
    <main style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: F }}>
      <NavHeader active="prices" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 20px 80px' }}>

        {/* Breadcrumb */}
        <div style={{ fontSize: 13, color: C.muted, marginBottom: 24, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <Link href="/" style={{ color: C.muted, textDecoration: 'none' }}>Home</Link>
          <span>/</span>
          <Link href="/grocery-prices" style={{ color: C.muted, textDecoration: 'none' }}>Grocery Prices</Link>
          <span>/</span>
          <Link href={`/grocery-prices/${stateSlug}`} style={{ color: C.muted, textDecoration: 'none' }}>{stateName}</Link>
          <span>/</span>
          <span style={{ color: C.stone }}>{city.name}</span>
        </div>

        {/* Hero */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span style={{ fontSize: 28 }}>🛒</span>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 900, lineHeight: 1.2 }}>
              Grocery Prices in {city.name}, {stateAbbr}
            </h1>
          </div>
          <p style={{ margin: 0, color: C.muted, fontSize: 15 }}>
            Updated {today} · BLS CPI data · Weekly basket estimate
          </p>
        </div>

        {/* Price card */}
        <div style={{
          background: C.card, border: `1px solid ${C.border}`,
          borderRadius: 16, padding: '28px 32px', marginBottom: 24,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20,
        }}>
          <div>
            <div style={{ fontSize: 13, color: C.muted, marginBottom: 6, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              {city.name} · Weekly Basket
            </div>
            <div style={{ fontSize: 52, fontWeight: 900, color: C.green, lineHeight: 1 }}>
              {cityPrice ? `$${cityPrice.toFixed(2)}` : '—'}
            </div>
            <div style={{ fontSize: 14, color: C.muted, marginTop: 6 }}>estimated weekly groceries</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {statePrice && (
              <div style={{ background: '#fff', borderRadius: 10, padding: '12px 18px' }}>
                <div style={{ fontSize: 11, color: C.muted, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>
                  {stateName} State Avg
                </div>
                <div style={{ fontSize: 22, fontWeight: 700, color: C.stone }}>
                  ${statePrice.toFixed(2)}/wk
                </div>
                <div style={{ fontSize: 12, color: priceDiff > 0 ? '#f97316' : priceDiff < 0 ? '#22c55e' : C.muted, marginTop: 2 }}>
                  {city.name} is {diffLabel} state avg
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Context */}
        <div style={{
          background: C.card, border: `1px solid ${C.border}`,
          borderRadius: 12, padding: '20px 24px', marginBottom: 24,
        }}>
          <h2 style={{ margin: '0 0 12px', fontSize: 17, fontWeight: 700 }}>
            Why Grocery Prices in {city.name} Vary
          </h2>
          <p style={{ margin: '0 0 10px', fontSize: 14, color: C.stone, lineHeight: 1.7 }}>
            Grocery prices in {city.name} are shaped by local labor costs, store density and competition,
            regional distribution distances, and the mix of national chains versus local grocers operating
            in the area. {priceDiff > 0
              ? `As a larger market, ${city.name} grocery prices run slightly above the ${stateName} statewide average — urban real estate and operating costs are the primary drivers.`
              : priceDiff < 0
              ? `${city.name} benefits from strong retail competition and lower operating costs, keeping prices slightly below the ${stateName} state average.`
              : `${city.name} prices closely track the ${stateName} state average.`}
          </p>
          <p style={{ margin: 0, fontSize: 14, color: C.stone, lineHeight: 1.7 }}>
            The store you choose matters as much as geography — Aldi and Walmart consistently
            undercut traditional supermarkets by 15–25%, which can swing your weekly bill
            significantly regardless of where you live in {city.name}.
          </p>
        </div>

        {/* Widget */}
        <RadUnit />

        {/* FAQ */}
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>
            Frequently Asked Questions
          </h2>
          {[
            {
              q: `How much does a week of groceries cost in ${city.name}?`,
              a: cityPrice
                ? `The estimated weekly grocery basket in ${city.name}, ${stateName} is $${cityPrice.toFixed(2)} as of ${today}. This covers a standard household basket of staples — eggs, milk, bread, beef, chicken, butter, and fresh produce. Individual costs vary based on household size and store choice.`
                : `Grocery prices in ${city.name} track the ${stateName} state average closely. Check the state page for the latest figures.`,
            },
            {
              q: `What are the cheapest grocery stores in ${city.name}?`,
              a: `Aldi and Walmart Neighborhood Market consistently rank as the lowest-cost options in most ${stateName} markets, including ${city.name}. For bulk staples, Costco and Sam's Club offer strong per-unit value. Traditional chains like Kroger, Publix, and regional grocers typically run 10–20% higher on everyday items.`,
            },
            {
              q: `How do ${city.name} grocery prices compare to the national average?`,
              a: statePrice
                ? `${city.name} grocery prices are ${diffLabel} the ${stateName} state average of $${statePrice.toFixed(2)}/wk. ${stateName} itself sits ${priceDiff > 0 ? 'above' : priceDiff < 0 ? 'below' : 'near'} the national average. Use our state comparison page for a full breakdown against all 50 states.`
                : `${city.name} generally tracks the ${stateName} state average, which you can compare to all 50 states on our main grocery prices page.`,
            },
          ].map(({ q, a }) => (
            <div key={q} style={{
              borderBottom: `1px solid ${C.border}`, paddingBottom: 16, marginBottom: 16,
            }}>
              <h3 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 700, color: C.text }}>{q}</h3>
              <p style={{ margin: 0, fontSize: 14, color: C.stone, lineHeight: 1.7 }}>{a}</p>
            </div>
          ))}
        </div>

        {/* Nearby cities */}
        {nearbyCities.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>
              Grocery Prices in Nearby {stateName} Cities
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
              {nearbyCities.map(nc => {
                const ncPrice = statePrice ? Math.round((statePrice * 100 + nc.adjustment)) / 100 : null
                return (
                  <Link key={nc.slug} href={`/grocery-prices/${stateSlug}/${nc.slug}`} style={{ textDecoration: 'none' }}>
                    <div style={{
                      background: C.card, border: `1px solid ${C.border}`, borderRadius: 10,
                      padding: '14px 16px', cursor: 'pointer',
                      transition: 'border-color 0.15s',
                    }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 3 }}>{nc.name}</div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: C.green }}>
                        {ncPrice ? `$${ncPrice.toFixed(2)}` : '—'}
                      </div>
                      <div style={{ fontSize: 11, color: C.muted }}>est. weekly basket</div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {/* State link */}
        <div style={{
          background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)',
          borderRadius: 12, padding: '18px 22px', marginBottom: 24,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
        }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 3 }}>
              {stateName} Statewide Average
            </div>
            <div style={{ fontSize: 13, color: C.muted }}>
              See all cities and the full state grocery breakdown
            </div>
          </div>
          <Link href={`/grocery-prices/${stateSlug}`} style={{
            background: C.blue, color: '#fff', padding: '8px 18px', borderRadius: 8,
            textDecoration: 'none', fontSize: 13, fontWeight: 700,
          }}>
            View {stateAbbr} Prices →
          </Link>
        </div>

        {/* Follow CTA */}
        <div style={{
          background: 'rgba(29,155,240,0.06)', border: '1px solid rgba(29,155,240,0.15)',
          borderRadius: 12, padding: '18px 22px', textAlign: 'center',
        }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 4 }}>
            Get daily grocery price updates
          </div>
          <div style={{ fontSize: 13, color: C.muted, marginBottom: 12 }}>
            Follow @wtgbofficial for price spikes, store deals, and state-by-state grocery trends.
          </div>
          <a href="https://twitter.com/intent/follow?screen_name=wtgbofficial"
            target="_blank" rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              background: '#1d9bf0', color: '#fff', padding: '9px 20px', borderRadius: 20,
              textDecoration: 'none', fontSize: 13, fontWeight: 700,
            }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.63L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/>
            </svg>
            Follow @wtgbofficial
          </a>
        </div>

      </div>
    </main>
  )
}
