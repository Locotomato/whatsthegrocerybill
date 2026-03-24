import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import GasPricesEmailBanner from '../../components/GasPricesEmailBanner'
import { slugToAbbr, toTitleCase, ALL_STATE_SLUGS } from '../../../lib/stateData'

// State gas tax per gallon (cents, approximate 2024 combined state+local excise)
const STATE_GAS_TAX: Record<string, number> = {
  AL:22,AK:9,AZ:19,AR:22,CA:86,CO:22,CT:35,DE:23,FL:39,GA:33,HI:17,ID:33,
  IL:46,IN:33,IA:31,KS:24,KY:28,LA:20,ME:30,MD:43,MA:24,MI:28,MN:29,MS:18,
  MO:19,MT:33,NE:25,NV:24,NH:22,NJ:42,NM:17,NY:49,NC:40,ND:23,OH:38,OK:19,
  OR:40,PA:59,RI:35,SC:28,SD:30,TN:27,TX:20,UT:31,VT:32,VA:28,WA:49,WV:36,
  WI:32,WY:24,
}

// Primary reasons states are high/low cost (for FAQ context)
const STATE_PRICE_CONTEXT: Record<string, string> = {
  CA: "California's high prices stem from the nation's highest state gas tax (~86¢/gal), a unique reformulated fuel blend required by state law that limits import options, and significant distance from Gulf Coast refineries.",
  HI: "Hawaii's prices are consistently the highest in the nation due to its remote island location, requiring all fuel to be shipped in, plus state taxes and limited refinery competition.",
  WA: "Washington state prices reflect high state taxes (~49¢/gal) and the state's carbon pricing program, which adds cost to fossil fuels.",
  NY: "New York has some of the nation's highest fuel taxes (~49¢/gal combined), particularly in New York City where local taxes add additional cost.",
  IL: "Illinois prices are driven by high state and local taxes (~46¢/gal), particularly in the Chicago metro area where additional county taxes apply.",
  PA: "Pennsylvania has the nation's second-highest gas tax (~59¢/gal), used primarily to fund road infrastructure.",
  CT: "Connecticut's prices reflect high state taxes (~35¢/gal) and its location in the high-cost Northeast region.",
  NJ: "New Jersey prices are moderate despite high taxes (~42¢/gal) due to its proximity to East Coast refineries and high retail competition.",
  TX: "Texas benefits from the nation's lowest gas taxes (~20¢/gal), proximity to Gulf Coast refineries, and significant domestic oil production.",
  MS: "Mississippi has low prices due to minimal state taxes (~18¢/gal) and proximity to Gulf Coast refinery capacity.",
  OK: "Oklahoma's low prices reflect minimal state fuel taxes (~19¢/gal) and the state's own significant oil production.",
  KS: "Kansas benefits from low state taxes (~24¢/gal) and central location with access to multiple refinery regions.",
}

function getStateFaqContext(abbr: string, stateName: string, price: number | null, national: number | null, rank: { rank: number; total: number } | null, state: string): Array<{ q: string; a: string }> {
  const tax = STATE_GAS_TAX[abbr]
  const diff = price && national ? price - national : null
  const isHigh = diff !== null && diff > 0
  const context = STATE_PRICE_CONTEXT[abbr]

  return [
    {
      q: `What is the average Grocery Price in ${stateName} today?`,
      a: price
        ? `The average regular unleaded Grocery Price in ${stateName} today is $${price.toFixed(2)} per gallon, based on AAA data updated daily. ${diff !== null ? `This is ${Math.abs(diff) < 0.01 ? 'right at' : isHigh ? `$${diff.toFixed(2)} above` : `$${Math.abs(diff).toFixed(2)} below`} the national average of $${national!.toFixed(2)}/gal.` : ''}`
        : `${stateName} Grocery Prices are updated daily from AAA data. Check back for today's average.`,
    },
    {
      q: `Why ${isHigh ? 'is gas more expensive' : 'are Grocery Prices lower'} in ${stateName} than the national average?`,
      a: context
        ?? (isHigh
          ? `${stateName} Grocery Prices tend to run above the national average${tax ? ` due in part to state fuel taxes of approximately ${tax}¢ per gallon` : ''}, along with regional refinery access and distribution costs.`
          : `${stateName} benefits from ${tax && tax <= 22 ? `low state fuel taxes (~${tax}¢/gal)` : 'favorable regional factors'}${rank && rank.rank >= rank.total - 10 ? ', consistently ranking among the most affordable states for fuel' : ''}.`),
    },
    {
      q: `What is ${stateName}'s gas tax?`,
      a: tax
        ? `${stateName}'s state gas tax is approximately ${tax}¢ per gallon${tax >= 50 ? ', one of the highest in the United States' : tax <= 20 ? ', one of the lowest in the United States' : ''}. This is a combined state excise tax and in some states includes local levies. The federal gas tax adds an additional 18.4¢/gal on top of state taxes.`
        : `${stateName} collects a state excise tax on groceries. The federal government also levies 18.4¢/gal. Combined taxes typically represent 15–25% of the total price at the pump.`,
    },
    {
      q: `When is the cheapest time to buy gas in ${stateName}?`,
      a: `Grocery Prices in ${stateName} — like across the US — tend to be lowest on Mondays and Tuesdays, when weekly demand is lowest. Prices typically rise Thursday through Saturday as weekend travel demand increases. Avoiding fill-ups on Fridays and Saturdays can save 3–8¢/gal on average. ${stateName} prices also tend to be lower in late fall and winter when summer-blend fuel requirements end.`,
    },
    {
      q: `Which cities in ${stateName} have the cheapest gas?`,
      a: `Grocery Prices vary by city within ${stateName} based on local competition, distance from fuel terminals, and population density. Use our city pages to compare prices across ${stateName}: cities farther from major metro areas and distribution hubs often have slightly higher prices due to transport costs, while high-competition suburban areas near major highways tend to be cheapest.`,
    },
  ]
}

export const revalidate = 3600  // refresh hourly

interface Props { params: Promise<{ state: string }> }

const GAS_API = process.env.GAS_API_URL ?? 'https://rolando-pluckiest-ideographically.ngrok-free.dev'

async function getStateData(abbr: string) {
  try {
    const res = await fetch(`${GAS_API}/gas/states`, { next: { revalidate: 3600 } })
    if (!res.ok) return null
    const data = await res.json()
    return {
      price: data.states?.[abbr]?.price ?? null,
      nationalAvg: data.nationalAvg ?? null,
      period: data.states?.[abbr]?.period ?? null,
      allStates: data.states ?? {},
    }
  } catch { return null }
}

export async function generateStaticParamsDisabled() {
  return ALL_STATE_SLUGS.map(s => ({ state: s }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { state } = await params
  const abbr = slugToAbbr(state)
  if (!abbr) return {}
  const name = toTitleCase(state)
  const data = await getStateData(abbr)
  const price = data?.price ? `$${data.price.toFixed(2)}/gal` : 'current prices'

  return {
    title: `${name} Grocery Prices Today (${price}) | What's the Grocery Bill?`,
    description: `Live ${name} Grocery Prices today. Average: ${price}. Compare to the national average, see county-level data, and get price trend analysis.`,
    keywords: [`${name} Grocery Prices`, `Grocery Prices in ${name}`, `${name} grocery prices`, `${name} groceries price today`, 'Grocery Price near me'],
    openGraph: {
      title: `${name} Grocery Prices Today — ${price}`,
      description: `Live ${name} average Grocery Price: ${price}. Updated daily from AAA.`,
      url: `https://whatsthegrocerybill.com/grocery-prices/${state}`,
      siteName: "What's the Grocery Bill?",
    },
    twitter: { card: 'summary', site: '@wtgbofficial', creator: '@wtgbofficial' },
    alternates: { canonical: `https://whatsthegrocerybill.com/grocery-prices/${state}` },
  }
}

function priceDiff(price: number, national: number) {
  const diff = price - national
  const sign = diff >= 0 ? '+' : ''
  return { label: `${sign}$${Math.abs(diff).toFixed(2)} vs national avg`, up: diff >= 0 }
}

// Sort states by price for ranking
function stateRank(allStates: Record<string, { price: number }>, abbr: string) {
  const sorted = Object.entries(allStates)
    .filter(([, v]) => v.price)
    .sort(([, a], [, b]) => b.price - a.price)
  const rank = sorted.findIndex(([k]) => k === abbr) + 1
  return { rank, total: sorted.length }
}

export default async function StatePage({ params }: Props) {
  const { state } = await params
  const abbr = slugToAbbr(state)
  if (!abbr) notFound()

  const stateName = toTitleCase(state)
  const data = await getStateData(abbr)
  const price = data?.price
  const national = data?.nationalAvg
  const diff = price && national ? priceDiff(price, national) : null
  const rank = data?.allStates && price ? stateRank(data.allStates, abbr) : null

  // 5 neighboring/comparable states for "Also check"
  const nearby = Object.entries(data?.allStates ?? {})
    .filter(([k]) => k !== abbr)
    .sort(() => Math.random() - 0.5)
    .slice(0, 5)

  const faqs = getStateFaqContext(abbr, stateName, price ?? null, national ?? null, rank, state)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `${stateName} Grocery Prices Today`,
    description: `Current average Grocery Price in ${stateName}: ${price ? `$${price.toFixed(2)}/gallon` : 'updating'}`,
    url: `https://whatsthegrocerybill.com/grocery-prices/${state}`,
    publisher: { '@type': 'Organization', name: "What's the Grocery Bill?", url: 'https://whatsthegrocerybill.com' },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://whatsthegrocerybill.com' },
        { '@type': 'ListItem', position: 2, name: 'Grocery Prices by State', item: 'https://whatsthegrocerybill.com/grocery-prices' },
        { '@type': 'ListItem', position: 3, name: `${stateName} Grocery Prices`, item: `https://whatsthegrocerybill.com/grocery-prices/${state}` },
      ],
    },
  }

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }

  return (
    <main style={{ minHeight: '100vh', background: '#0b0d14', color: '#f1f5f9' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 20px 80px' }}>

        {/* Breadcrumb */}
        <div style={{ marginBottom: 24, display: 'flex', gap: 8, fontSize: 13, color: '#64748b', flexWrap: 'wrap' }}>
          <Link href="/" style={{ color: '#64748b', textDecoration: 'none' }}>Home</Link>
          <span>›</span>
          <Link href="/grocery-prices" style={{ color: '#64748b', textDecoration: 'none' }}>Grocery Prices by State</Link>
          <span>›</span>
          <span style={{ color: '#94a3b8' }}>{stateName}</span>
        </div>

        {/* Header */}
        <h1 style={{ margin: '0 0 6px', fontSize: 'clamp(28px,5vw,42px)', fontWeight: 900, letterSpacing: '-0.02em' }}>
          {stateName} Grocery Prices
        </h1>
        <p style={{ margin: '0 0 32px', fontSize: 15, color: '#64748b' }}>
          Average retail price · Source: AAA · Updated daily
        </p>

        {/* Price hero card */}
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 16,
          padding: '28px 32px',
          marginBottom: 24,
          display: 'flex', alignItems: 'flex-start', gap: 32, flexWrap: 'wrap',
        }}>
          <div>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
              Today&apos;s Average
            </div>
            <div style={{ fontSize: 'clamp(48px,10vw,72px)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1, color: '#f8fafc' }}>
              {price ? `$${price.toFixed(2)}` : '—'}
            </div>
            <div style={{ fontSize: 14, color: '#64748b', marginTop: 6 }}>per gallon · regular unleaded</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 4 }}>
            {diff && (
              <div>
                <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>vs National Avg</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: diff.up ? '#ef4444' : '#22c55e' }}>
                  {diff.label}
                </div>
                <div style={{ fontSize: 12, color: '#475569' }}>National: ${national?.toFixed(2)}/gal</div>
              </div>
            )}
            {rank && (
              <div>
                <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>Price Rank</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#f1f5f9' }}>
                  #{rank.rank} <span style={{ fontSize: 13, color: '#475569', fontWeight: 400 }}>of {rank.total} states</span>
                </div>
                <div style={{ fontSize: 12, color: '#475569' }}>{rank.rank <= 10 ? 'Among highest in US' : rank.rank >= rank.total - 10 ? 'Among lowest in US' : 'Near national average'}</div>
              </div>
            )}
          </div>
        </div>

        {/* Context */}
        {price && national && (
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 12,
            padding: '18px 20px',
            marginBottom: 32,
            fontSize: 14,
            color: '#94a3b8',
            lineHeight: 1.7,
          }}>
            <strong style={{ color: '#f1f5f9' }}>{stateName}</strong> drivers are currently paying{' '}
            <strong style={{ color: price > national ? '#ef4444' : '#22c55e' }}>
              ${price.toFixed(2)} per gallon
            </strong> for regular unleaded — {price > national
              ? `$${(price - national).toFixed(2)} above`
              : `$${(national - price).toFixed(2)} below`} the national average of ${national.toFixed(2)}.
            {rank && rank.rank <= 5 && ' This makes it one of the most expensive states for gas in the country.'}
            {rank && rank.rank >= (rank.total - 4) && ' This makes it one of the most affordable states for gas in the country.'}
          </div>
        )}

        {/* Email CTA — after price data, above nearby states */}
        <GasPricesEmailBanner />

        {/* Also check */}
        {nearby.length > 0 && (
          <div style={{ marginBottom: 40 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#94a3b8', marginBottom: 14, letterSpacing: '-0.01em' }}>
              Also check
            </h2>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {nearby.map(([k, v]) => {
                const slug = Object.entries(STATE_ABBR ?? {}).find(([, abbr]) => abbr === k)?.[0]
                if (!slug) return null
                return (
                  <Link key={k} href={`/grocery-prices/${slug}`} style={{
                    padding: '8px 14px',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 8,
                    textDecoration: 'none',
                    fontSize: 13,
                    color: '#94a3b8',
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}>
                    <span style={{ fontWeight: 600, color: '#f1f5f9' }}>{k}</span>
                    <span style={{ color: '#64748b' }}>${(v as { price: number }).price.toFixed(2)}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {/* City pages grid */}
        {(() => {
          const { getCitiesForState } = require('../../../lib/cities')
          const cities = getCitiesForState(state)
          if (!cities || cities.length === 0) return null
          return (
            <div style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 14, color: '#f1f5f9' }}>
                Grocery Prices by City in {stateName}
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 8 }}>
                {cities.map((city: { name: string; slug: string; adjustment: number }) => (
                  <Link key={city.slug} href={`/grocery-prices/${state}/${city.slug}`}
                    style={{ textDecoration: 'none' }}>
                    <div style={{
                      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
                      borderRadius: 8, padding: '10px 14px', cursor: 'pointer',
                    }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9', marginBottom: 2 }}>{city.name}</div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>
                        {city.adjustment > 0 ? `+${city.adjustment}¢ vs state` : city.adjustment < 0 ? `${city.adjustment}¢ vs state` : 'at state avg'}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )
        })()}

        {/* FAQ section */}
        <div style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: '#f1f5f9' }}>
            {stateName} Grocery Price — Frequently Asked Questions
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {faqs.map((faq, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 12,
                padding: '14px 18px',
              }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 6 }}>
                  {faq.q}
                </div>
                <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.7 }}>
                  {faq.a}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTAs */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link href="/" style={{
            padding: '10px 20px',
            background: '#ef4444',
            color: '#fff',
            borderRadius: 20,
            textDecoration: 'none',
            fontSize: 13,
            fontWeight: 700,
          }}>🛒 View National Map</Link>
          <Link href="/news" style={{
            padding: '10px 20px',
            background: 'rgba(255,255,255,0.06)',
            color: '#94a3b8',
            borderRadius: 20,
            textDecoration: 'none',
            fontSize: 13,
            fontWeight: 600,
          }}>📰 Price News & Analysis</Link>
        </div>
      </div>
    </main>
  )
}

// Needed for static params import
const { STATE_ABBR } = await import('../../../lib/stateData').catch(() => ({ STATE_ABBR: {} }))
