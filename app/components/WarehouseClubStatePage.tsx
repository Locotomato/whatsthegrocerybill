import type { ClubData } from '../../lib/warehouseClubs'
import Link from 'next/link'
import NavHeader from './NavHeader'

const C = { bg: '#f8f9fa', card: '#ffffff', border: '#e5e7eb', red: '#dc2626', navy: '#1e3a5f', text: '#1f2937', muted: '#6b7280', green: '#16a34a', light: '#fef2f2' }
const F = "'Inter', system-ui, sans-serif"

// States available per brand (subset that have dedicated pages)
export const BRAND_STATES: Record<string, string[]> = {
  'sams-club': [
    'alabama','arizona','arkansas','california','colorado','connecticut','delaware','florida','georgia',
    'idaho','illinois','indiana','iowa','kansas','kentucky','louisiana','maine','maryland','massachusetts',
    'michigan','minnesota','mississippi','missouri','nebraska','nevada','new-hampshire','new-jersey','new-mexico',
    'new-york','north-carolina','north-dakota','ohio','oklahoma','oregon','pennsylvania','rhode-island',
    'south-carolina','south-dakota','tennessee','texas','utah','virginia','west-virginia','wisconsin',
  ],
  'costco': [
    'alabama','alaska','arizona','arkansas','california','colorado','connecticut','delaware','florida','georgia',
    'idaho','illinois','indiana','iowa','kansas','kentucky','louisiana','maine','maryland','massachusetts',
    'michigan','minnesota','mississippi','missouri','montana','nebraska','nevada','new-hampshire','new-jersey','new-mexico',
    'new-york','north-carolina','north-dakota','ohio','oklahoma','oregon','pennsylvania','rhode-island',
    'south-carolina','south-dakota','tennessee','texas','utah','vermont','virginia','washington','west-virginia','wisconsin','wyoming',
  ],
  'bjs': [
    'connecticut','delaware','florida','georgia','indiana','kentucky','maine','maryland','massachusetts',
    'michigan','new-hampshire','new-jersey','new-york','north-carolina','ohio','pennsylvania','rhode-island',
    'south-carolina','virginia',
  ],
  'walmart': [
    'alabama','alaska','arizona','arkansas','california','colorado','connecticut','delaware','florida','georgia',
    'idaho','illinois','indiana','iowa','kansas','kentucky','louisiana','maine','maryland','massachusetts',
    'michigan','minnesota','mississippi','missouri','montana','nebraska','nevada','new-hampshire','new-jersey','new-mexico',
    'new-york','north-carolina','north-dakota','ohio','oklahoma','oregon','pennsylvania','rhode-island',
    'south-carolina','south-dakota','tennessee','texas','utah','vermont','virginia','washington','west-virginia','wisconsin','wyoming',
  ],
  'kroger': [
    'alabama','arizona','arkansas','california','colorado','delaware','florida','georgia','idaho','illinois',
    'indiana','kansas','kentucky','louisiana','maryland','michigan','mississippi','missouri','montana','nebraska',
    'nevada','new-mexico','north-carolina','ohio','oklahoma','oregon','south-carolina','tennessee','texas',
    'utah','virginia','washington','west-virginia','wyoming',
  ],
}

// Regional grocery cost index — rough multiplier vs national average
const STATE_GROCERY_INDEX: Record<string, number> = {
  HI: 1.32, AK: 1.28, CT: 1.14, NY: 1.13, NJ: 1.11, MA: 1.10, CA: 1.10,
  MD: 1.07, WA: 1.06, CO: 1.05, OR: 1.04, VT: 1.04, NH: 1.03, RI: 1.02,
  IL: 1.01, MN: 1.00, FL: 0.99, TX: 0.98, GA: 0.97, NC: 0.97, OH: 0.96,
  IN: 0.96, MI: 0.96, PA: 0.97, VA: 0.98, TN: 0.96, KY: 0.95, SC: 0.95,
  AL: 0.94, AR: 0.93, MS: 0.93, LA: 0.94, MO: 0.95, IA: 0.95, KS: 0.95,
  NE: 0.95, SD: 0.96, ND: 0.96, OK: 0.94, WV: 0.93, MT: 0.97, WY: 0.97,
  ID: 0.96, UT: 0.97, NM: 0.96, NV: 1.00, AZ: 0.98, ME: 1.01, DE: 1.01,
  WI: 0.96,
}

function toTitleCase(s: string) {
  return s.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

interface Props {
  club: ClubData
  stateSlug: string
  stateAbbr: string
  statePrice?: number | null
  nationalAvg?: number | null
}

export default function WarehouseClubStatePage({ club, stateSlug, stateAbbr }: Props) {
  const stateName  = toTitleCase(stateSlug)
  const groceryIdx = STATE_GROCERY_INDEX[stateAbbr] ?? 1.0
  const isHighCost = groceryIdx >= 1.08
  const isLowCost  = groceryIdx <= 0.94
  const pctVsNational = ((groceryIdx - 1) * 100).toFixed(0)
  const sign = groceryIdx >= 1 ? '+' : ''

  const savingsMid = Math.round((club.savingsLow + club.savingsHigh) / 2)
  const weeklyCartBase = 150
  const weeklyCartState = (weeklyCartBase * groceryIdx).toFixed(0)
  const weeklySavings = (weeklyCartBase * groceryIdx * savingsMid / 100).toFixed(2)
  const annualSavings = (parseFloat(weeklySavings) * 52).toFixed(0)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://whatsthegrocerybill.com' },
          { '@type': 'ListItem', position: 2, name: 'Grocery Prices', item: 'https://whatsthegrocerybill.com/grocery-prices' },
          { '@type': 'ListItem', position: 3, name: club.name, item: `https://whatsthegrocerybill.com/grocery-prices/${club.slug}` },
          { '@type': 'ListItem', position: 4, name: `${club.name} in ${stateName}`, item: `https://whatsthegrocerybill.com/grocery-prices/${club.slug}/${stateSlug}` },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: `How much do groceries cost at ${club.name} in ${stateName}?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `${stateName} grocery prices are approximately ${sign}${pctVsNational}% vs the national average. At ${club.name}, members typically save ${club.savingsLow}–${club.savingsHigh}% on staple groceries vs traditional supermarkets in ${stateName}. On a typical $${weeklyCartState} weekly cart, that's about $${weeklySavings} in savings.`,
            },
          },
          {
            '@type': 'Question',
            name: `Is ${club.name} cheaper than other grocery stores in ${stateName}?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `Yes. ${club.name} is typically ${club.savingsLow}–${club.savingsHigh}% cheaper than traditional supermarkets in ${stateName}. ${isHighCost ? `${stateName} has above-average grocery costs, making the savings from ${club.shortName} even more impactful.` : isLowCost ? `${stateName} has below-average grocery costs overall, but ${club.shortName} still offers meaningful savings on most staple items.` : `The savings are consistent across most grocery categories.`}`,
            },
          },
          {
            '@type': 'Question',
            name: `What groceries are cheapest at ${club.name} in ${stateName}?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `${club.name} offers the best savings on: ${club.keyItems.slice(0, 5).join(', ')}. These items are typically ${club.savingsLow}–${club.savingsHigh}% below what you'd pay at traditional ${stateName} grocery stores.`,
            },
          },
        ],
      },
    ],
  }

  return (
    <main style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: F }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <NavHeader active="grocery-prices" />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 16px 80px' }}>
        {/* Breadcrumb */}
        <div style={{ fontSize: 13, color: C.muted, marginBottom: 24 }}>
          <Link href="/" style={{ color: C.muted, textDecoration: 'none' }}>Home</Link>
          {' / '}
          <Link href="/grocery-prices" style={{ color: C.muted, textDecoration: 'none' }}>Grocery Prices</Link>
          {' / '}
          <Link href={`/grocery-prices/${club.slug}`} style={{ color: C.muted, textDecoration: 'none' }}>{club.name}</Link>
          {' / '}
          <span style={{ color: C.text }}>{stateName}</span>
        </div>

        {/* Hero */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '28px 24px', marginBottom: 24 }}>
          <h1 style={{ margin: '0 0 8px', fontSize: 26, fontWeight: 800, color: C.navy }}>
            {club.name} Grocery Prices in {stateName}
          </h1>
          <p style={{ margin: '0 0 20px', color: C.muted, fontSize: 15 }}>
            {stateName} grocery prices are <strong style={{ color: groceryIdx >= 1 ? C.red : C.green }}>
              {sign}{pctVsNational}% {groceryIdx >= 1 ? 'above' : 'below'} the national average.
            </strong>{' '}
            {club.name} members save an additional {club.savingsLow}–{club.savingsHigh}% on top of that.
          </p>

          {/* Stats */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: '16px 20px', flex: 1, minWidth: 130 }}>
              <div style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}>{stateName} cost of groceries</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: groceryIdx >= 1.05 ? C.red : C.green }}>
                {sign}{pctVsNational}% vs national avg
              </div>
            </div>
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: '16px 20px', flex: 1, minWidth: 130 }}>
              <div style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}>{club.shortName} savings vs supermarket</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: C.navy }}>{club.savingsLow}–{club.savingsHigh}%</div>
            </div>
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: '16px 20px', flex: 1, minWidth: 130 }}>
              <div style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}>Est. weekly savings in {stateName}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: C.green }}>${weeklySavings}</div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>on a ~${weeklyCartState} cart</div>
            </div>
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: '16px 20px', flex: 1, minWidth: 130 }}>
              <div style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}>Est. annual savings</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: C.green }}>${annualSavings}</div>
            </div>
          </div>
        </div>

        {/* Regional context */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '24px', marginBottom: 24 }}>
          <h2 style={{ margin: '0 0 12px', fontSize: 18, fontWeight: 700, color: C.navy }}>
            {stateName} Grocery Cost Context
          </h2>
          <p style={{ margin: 0, color: C.text, lineHeight: 1.65, fontSize: 15 }}>
            {isHighCost
              ? `${stateName} is a high grocery cost state — prices run about ${pctVsNational}% above the national average. Factors include higher cost of living, regional distribution costs, and local labor rates. Warehouse clubs like ${club.name} offer especially meaningful savings here — the ${club.savingsLow}–${club.savingsHigh}% discount off already-elevated prices adds up quickly.`
              : isLowCost
              ? `${stateName} has below-average grocery costs — about ${Math.abs(parseFloat(pctVsNational))}% below the national average. Even so, ${club.name} offers an additional ${club.savingsLow}–${club.savingsHigh}% savings on top of those already competitive local prices, particularly on bulk staples.`
              : `${stateName} grocery prices are close to the national average. ${club.name} members in ${stateName} save ${club.savingsLow}–${club.savingsHigh}% on staple groceries vs traditional supermarkets, with the biggest savings on bulk items, meat, and dairy.`
            }
          </p>
        </div>

        {/* Best items */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '24px', marginBottom: 24 }}>
          <h2 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 700, color: C.navy }}>
            Best {club.name} Deals in {stateName}
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {club.keyItems.map((item, i) => (
              <span key={i} style={{
                background: C.light, color: C.red, border: `1px solid #fecaca`,
                borderRadius: 20, padding: '6px 14px', fontSize: 13, fontWeight: 500
              }}>
                {item}
              </span>
            ))}
          </div>
          <p style={{ margin: '16px 0 0', color: C.muted, fontSize: 13 }}>
            ⚠️ {club.name} does not publish real-time prices. Savings estimates are based on {club.shortName}&apos;s typical {club.savingsLow}–{club.savingsHigh}% discount vs {stateName} supermarket averages. Actual prices vary by location.
          </p>
        </div>

        {/* Membership / loyalty */}
        {club.membershipTiers && (
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '24px', marginBottom: 24 }}>
            <h2 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 700, color: C.navy }}>
              {club.requiresMembership ? `${club.name} Membership in ${stateName}` : 'Loyalty Program'}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {club.membershipTiers.map((tier, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <span style={{ color: C.green, fontSize: 16, marginTop: 1 }}>✓</span>
                  <span style={{ fontSize: 14, color: C.text }}>{tier}</span>
                </div>
              ))}
            </div>
            {club.requiresMembership && (
              <p style={{ margin: '16px 0 0', color: C.muted, fontSize: 13 }}>
                At ~${weeklySavings}/week in grocery savings, the {club.membershipCost} membership pays for itself in roughly {Math.ceil(parseInt(club.membershipCost.replace(/[^0-9]/g, '').slice(0, 3)) / (parseFloat(weeklySavings) * 4.3))} months of regular shopping in {stateName}.
              </p>
            )}
          </div>
        )}

        {/* FAQs */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '24px', marginBottom: 24 }}>
          <h2 style={{ margin: '0 0 20px', fontSize: 18, fontWeight: 700, color: C.navy }}>
            {club.name} Grocery Prices in {stateName} — FAQs
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {club.faqs.slice(0, 3).map((faq, i) => (
              <div key={i} style={{ borderTop: i > 0 ? `1px solid ${C.border}` : 'none', paddingTop: i > 0 ? 20 : 0 }}>
                <div style={{ fontWeight: 600, color: C.navy, marginBottom: 8, fontSize: 15 }}>{faq.q}</div>
                <div style={{ color: C.text, lineHeight: 1.65, fontSize: 14 }}>{faq.a}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Back link */}
        <div style={{ textAlign: 'center' }}>
          <Link href={`/grocery-prices/${club.slug}`} style={{ color: C.navy, fontSize: 14 }}>
            ← All {club.name} Grocery Prices
          </Link>
        </div>
      </div>
    </main>
  )
}
