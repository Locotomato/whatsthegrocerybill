import type { Metadata } from 'next'
import Link from 'next/link'
import { ALL_STATE_SLUGS, STATE_ABBR, toTitleCase } from '../../lib/stateData'
import GasPricesEmailBanner from '../components/GasPricesEmailBanner'

export const revalidate = 3600

export const metadata: Metadata = {
  title: "Grocery Prices by State — All 50 States Today | whatsthegrocerybill.com",
  description: "Current average Grocery Prices for all 50 US states. Compare regular unleaded prices state by state, updated daily from AAA data.",
  alternates: { canonical: 'https://whatsthegrocerybill.com/grocery-prices' },
  openGraph: {
    title: "Grocery Prices by State — All 50 States Today",
    description: "Live Grocery Price averages for every US state. Updated daily.",
    url: 'https://whatsthegrocerybill.com/grocery-prices',
    siteName: "What's the Grocery Bill?",
  },
  twitter: { card: 'summary', title: "Grocery Prices by State — All 50 States", site: '@wtgbofficial' },
}

async function getAllStatePrices(): Promise<Record<string, number>> {
  try {
    const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://whatsthegrocerybill.com'
    const res = await fetch(`${base}/api/grocery-prices`, { next: { revalidate: 3600 } })
    if (!res.ok) return {}
    const data = await res.json()
    const out: Record<string, number> = {}
    for (const [abbr, val] of Object.entries(data.states ?? {})) {
      out[abbr] = (val as any).price
    }
    return out
  } catch { return {} }
}

const REGION_ORDER: Record<string, string[]> = {
  'Northeast': ['maine','new-hampshire','vermont','massachusetts','rhode-island','connecticut','new-york','new-jersey','pennsylvania'],
  'South':     ['delaware','maryland','virginia','west-virginia','north-carolina','south-carolina','georgia','florida','kentucky','tennessee','alabama','mississippi','arkansas','louisiana','oklahoma','texas'],
  'Midwest':   ['ohio','indiana','illinois','michigan','wisconsin','minnesota','iowa','missouri','north-dakota','south-dakota','nebraska','kansas'],
  'West':      ['montana','idaho','wyoming','colorado','new-mexico','arizona','utah','nevada','california','oregon','washington','alaska','hawaii'],
}

export default async function GasPricesIndex() {
  const prices = await getAllStatePrices()

  const allPrices = Object.values(prices).filter(Boolean)
  const nationalAvg = allPrices.length ? allPrices.reduce((a, b) => a + b, 0) / allPrices.length : null
  const sortedPrices = [...allPrices].sort((a, b) => a - b)
  const cheapest = sortedPrices[0]
  const priciest = sortedPrices[sortedPrices.length - 1]

  const C = { bg: '#0b0d14', card: '#111827', border: 'rgba(255,255,255,0.07)', red: '#ef4444', text: '#f1f5f9', muted: '#64748b', stone: '#94a3b8' }
  const F = "'Inter', system-ui, sans-serif"

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Grocery Prices by State',
    description: 'Current average Grocery Prices for all 50 US states',
    url: 'https://whatsthegrocerybill.com/grocery-prices',
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://whatsthegrocerybill.com' },
        { '@type': 'ListItem', position: 2, name: 'Grocery Prices by State', item: 'https://whatsthegrocerybill.com/grocery-prices' },
      ],
    },
  }

  return (
    <main style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: F }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 16px 80px' }}>

        {/* Breadcrumb */}
        <div style={{ fontSize: 13, color: C.muted, marginBottom: 24 }}>
          <Link href="/" style={{ color: C.muted, textDecoration: 'none' }}>Home</Link>
          <span style={{ margin: '0 6px' }}>/</span>
          <span style={{ color: C.stone }}>Grocery Prices by State</span>
        </div>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ margin: '0 0 8px', fontSize: 30, fontWeight: 900 }}>
            🛒 Grocery Prices by State
          </h1>
          <p style={{ margin: 0, color: C.muted, fontSize: 15 }}>
            Average regular unleaded prices for all 50 states · Updated daily · Source: AAA
          </p>
        </div>

        {/* Summary cards */}
        {nationalAvg && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 36 }}>
            {[
              { label: 'National Average', value: `$${nationalAvg.toFixed(3)}`, color: C.text },
              { label: 'Cheapest State',   value: `$${cheapest?.toFixed(3)}`,   color: '#22c55e' },
              { label: 'Most Expensive',   value: `$${priciest?.toFixed(3)}`,   color: C.red },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '16px 18px', textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>{label}</div>
                <div style={{ fontSize: 26, fontWeight: 800, color }}>{value ?? '—'}</div>
              </div>
            ))}
          </div>
        )}

        {/* Email CTA — after price cards, high intent */}
        <GasPricesEmailBanner />

        {/* States by region */}
        {Object.entries(REGION_ORDER).map(([region, slugs]) => (
          <div key={region} style={{ marginBottom: 36 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: C.stone, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
              {region}
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 8 }}>
              {slugs.map(slug => {
                const abbr  = STATE_ABBR[slug]
                const name  = toTitleCase(slug)
                const price = abbr ? prices[abbr] : null
                const vsAvg = nationalAvg && price ? price - nationalAvg : null

                return (
                  <Link key={slug} href={`/grocery-prices/${slug}`} style={{ textDecoration: 'none' }}>
                    <div style={{
                      background: C.card,
                      border: `1px solid ${C.border}`,
                      borderRadius: 10,
                      padding: '12px 14px',
                      cursor: 'pointer',
                    }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 4 }}>{name}</div>
                      <div style={{ fontSize: 20, fontWeight: 800, color: C.red }}>
                        {price ? `$${price.toFixed(3)}` : '—'}
                      </div>
                      {vsAvg !== null && (
                        <div style={{ fontSize: 11, color: vsAvg > 0 ? '#f97316' : '#22c55e', marginTop: 2 }}>
                          {vsAvg > 0 ? `+${vsAvg.toFixed(2)}¢` : `${vsAvg.toFixed(2)}¢`} vs avg
                        </div>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}

        {/* Grocery Prices by Brand */}
        <div id="brands" style={{ marginTop: 8, marginBottom: 36 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: C.stone, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
            Grocery Prices by Brand
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 8 }}>
            {[
              { slug: 'costco',    label: 'Costco',    icon: '🏪', note: '10–25¢ below avg' },
              { slug: 'sams-club', label: "Sam's Club", icon: '🏪', note: '10–25¢ below avg' },
              { slug: 'bjs',       label: "BJ's",       icon: '🏪', note: '8–20¢ below avg'  },
              { slug: 'kroger',    label: 'Kroger',     icon: '🛒', note: 'Up to 35¢ off w/ rewards' },
              { slug: 'walmart',   label: 'Walmart',    icon: '🛒', note: '5–15¢ below avg'  },
              { slug: 'sheetz',    label: 'Sheetz',     icon: '🛒', note: '5–15¢ below avg'  },
              { slug: 'bucees',    label: "Buc-ee's",   icon: '🛒', note: '5–20¢ below avg'  },
              { slug: 'circle-k',  label: 'Circle K',   icon: '🛒', note: '0–8¢ below avg'   },
              { slug: 'murphys',   label: "Murphy's",   icon: '🛒', note: '5–15¢ below avg'  },
              { slug: 'wawa',      label: 'Wawa',       icon: '🛒', note: '3–10¢ below avg'  },
            ].map(({ slug, label, icon, note }) => (
              <Link key={slug} href={`/grocery-prices/${slug}`} style={{ textDecoration: 'none' }}>
                <div style={{
                  background: C.card,
                  border: `1px solid ${C.border}`,
                  borderRadius: 10,
                  padding: '12px 14px',
                  cursor: 'pointer',
                  height: '100%',
                }}>
                  <div style={{ fontSize: 18, marginBottom: 4 }}>{icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: 11, color: '#22c55e' }}>{note}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Email CTA — after brands */}
        <GasPricesEmailBanner />
      </div>
    </main>
  )
}
