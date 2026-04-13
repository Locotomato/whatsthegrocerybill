import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { STATE_CITIES, getCitiesForState } from '../../../../lib/cities'
import { STATE_ABBR, toTitleCase } from '../../../../lib/stateData'
import NavHeader from '../../../components/NavHeader'

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
  const cityPrice  = statePrice ? ((statePrice * 100 + city.adjustment) / 100).toFixed(3) : null
  const priceStr   = cityPrice ? `$${cityPrice}/gal` : 'Live data'
  const today      = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'America/New_York' })

  const title = `${city.name}, ${stateAbbr} Grocery Prices Today — ${priceStr} (${today})`
  const desc  = `Current Grocery Prices in ${city.name}, ${stateName}. Regular unleaded averages ${priceStr} today. Compare to the ${stateName} state average and national average at the pump.`

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
    },
    twitter: { card: 'summary', title, description: desc, site: '@wtgbofficial' },
  }
}

export default async function CityGasPricePage({ params }: Props) {
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
  const diffLabel = priceDiff > 0 ? `${priceDiff}¢ above` : priceDiff < 0 ? `${Math.abs(priceDiff)}¢ below` : 'at'

  const siteUrl = `https://whatsthegrocerybill.com/grocery-prices/${stateSlug}/${citySlug}`

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': siteUrl,
        url: siteUrl,
        name: `${city.name} Grocery Prices Today`,
        description: `Current Grocery Prices in ${city.name}, ${stateName}`,
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
            name: `What is the average Grocery Price in ${city.name} today?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: cityPrice
                ? `The average regular unleaded Grocery Price in ${city.name}, ${stateName} is approximately $${cityPrice.toFixed(3)} per gallon as of ${today}. Prices at individual stations may vary by 5–15 cents.`
                : `Grocery Prices in ${city.name} are updated daily. Check back for the latest figures.`,
            },
          },
          {
            '@type': 'Question',
            name: `How does ${city.name} compare to the ${stateName} state average?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: statePrice
                ? `${city.name} Grocery Prices are typically ${diffLabel} the ${stateName} state average of $${statePrice.toFixed(3)}/gal. Urban areas generally run higher due to higher operating costs and local taxes.`
                : `${city.name} prices generally track the ${stateName} statewide average closely.`,
            },
          },
          {
            '@type': 'Question',
            name: `Why are Grocery Prices in ${city.name} higher or lower than nearby cities?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `Grocery Prices vary by city due to local taxes, proximity to fuel terminals, station competition density, and operating costs. ${city.name} has ${priceDiff > 0 ? 'higher' : priceDiff < 0 ? 'lower' : 'similar'} prices compared to the ${stateName} average.`,
            },
          },
        ],
      },
    ],
  }

  const C = {
    bg: '#0b0d14', card: '#111827', border: 'rgba(255,255,255,0.07)',
    red: '#ef4444', blue: '#3b82f6', text: '#f1f5f9', muted: '#64748b',
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
            Updated {today} · AAA data · Regular unleaded
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
              {city.name} Avg · Regular
            </div>
            <div style={{ fontSize: 52, fontWeight: 900, color: C.red, lineHeight: 1 }}>
              {cityPrice ? `$${cityPrice.toFixed(3)}` : '—'}
            </div>
            <div style={{ fontSize: 14, color: C.muted, marginTop: 6 }}>per gallon</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {statePrice && (
              <div style={{ background: '#fff', borderRadius: 10, padding: '12px 18px' }}>
                <div style={{ fontSize: 11, color: C.muted, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>
                  {stateName} State Avg
                </div>
                <div style={{ fontSize: 22, fontWeight: 700, color: C.stone }}>
                  ${statePrice.toFixed(3)}
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
            Grocery Prices in {city.name} reflect a mix of local taxes, distance to fuel distribution terminals,
            station density, and real estate costs. {priceDiff > 0
              ? `As an urban market, ${city.name} typically runs ${priceDiff}¢ above the ${stateName} statewide average.`
              : priceDiff < 0
              ? `${city.name} benefits from lower operating costs, typically running ${Math.abs(priceDiff)}¢ below the ${stateName} state average.`
              : `${city.name} prices closely track the ${stateName} state average.`}
          </p>
          <p style={{ margin: 0, fontSize: 14, color: C.stone, lineHeight: 1.7 }}>
            Prices at individual stations can vary by 5–15 cents within the same city depending on
            brand, location, and local competition. Use apps like Instacart to find the cheapest
            station near you in {city.name}.
          </p>
        </div>

        {/* FAQ */}
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>
            Frequently Asked Questions
          </h2>
          {[
            {
              q: `What is the Grocery Price in ${city.name} right now?`,
              a: cityPrice
                ? `The average regular unleaded price in ${city.name}, ${stateName} is $${cityPrice.toFixed(3)}/gal as of ${today}. Station prices vary — expect a range of roughly $${(cityPrice - 0.10).toFixed(3)} to $${(cityPrice + 0.12).toFixed(3)} across the metro area.`
                : `Grocery Prices in ${city.name} are updated daily. The area tracks the ${stateName} state average closely.`,
            },
            {
              q: `Is gas cheaper in ${city.name} or the suburbs?`,
              a: `Generally, suburban areas outside ${city.name} have slightly lower Grocery Prices due to lower operating costs and property taxes. If you're near a highway interchange or warehouse district, you may find lower prices than the city center.`,
            },
            {
              q: `When is the cheapest day to buy gas in ${city.name}?`,
              a: `Nationwide data shows Monday and Tuesday tend to have slightly lower Grocery Prices before weekly demand picks up. Avoid buying gas Thursday through Saturday when prices are typically higher.`,
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
                      <div style={{ fontSize: 18, fontWeight: 700, color: C.red }}>
                        {ncPrice ? `$${ncPrice.toFixed(3)}` : '—'}
                      </div>
                      <div style={{ fontSize: 11, color: C.muted }}>per gallon</div>
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
              See all cities and the full state breakdown
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
            Get daily Grocery Price alerts
          </div>
          <div style={{ fontSize: 13, color: C.muted, marginBottom: 12 }}>
            Follow @wtgbofficial for price spikes, market analysis, and state-by-state updates.
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
