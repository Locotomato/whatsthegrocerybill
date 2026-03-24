import Link from 'next/link'
import type { ClubData } from '../../lib/warehouseClubs'

const C = {
  bg: '#0b0d14', card: '#111827', border: 'rgba(255,255,255,0.07)',
  red: '#16a34a', text: '#f1f5f9', muted: '#64748b', stone: '#94a3b8',
  green: '#22c55e', orange: '#4ade80',
}
const F = "'Inter', system-ui, sans-serif"

// States where each brand operates — used for the "check other states" grid
export const BRAND_STATES: Record<string, string[]> = {
  'sams-club': [
    'alabama','arizona','arkansas','california','colorado','connecticut','delaware',
    'florida','georgia','hawaii','idaho','illinois','indiana','iowa','kansas',
    'kentucky','louisiana','maine','maryland','massachusetts','michigan','minnesota',
    'mississippi','missouri','montana','nebraska','nevada','new-hampshire','new-jersey',
    'new-mexico','new-york','north-carolina','north-dakota','ohio','oklahoma','oregon',
    'pennsylvania','rhode-island','south-carolina','south-dakota','tennessee','texas',
    'utah','vermont','virginia','washington','west-virginia','wisconsin','wyoming',
  ],
  'costco': [
    'alabama','alaska','arizona','arkansas','california','colorado','connecticut',
    'delaware','florida','georgia','hawaii','idaho','illinois','indiana','iowa',
    'kansas','kentucky','louisiana','maine','maryland','massachusetts','michigan',
    'minnesota','mississippi','missouri','montana','nebraska','nevada','new-hampshire',
    'new-jersey','new-mexico','new-york','north-carolina','ohio','oklahoma','oregon',
    'pennsylvania','rhode-island','south-carolina','tennessee','texas','utah','vermont',
    'virginia','washington','west-virginia','wisconsin','wyoming',
  ],
  'bjs': [
    'connecticut','delaware','florida','georgia','indiana','maine','maryland',
    'massachusetts','michigan','new-hampshire','new-jersey','new-york',
    'north-carolina','ohio','pennsylvania','rhode-island','south-carolina',
    'tennessee','virginia',
  ],
  'murphys': [
    'alabama','arkansas','colorado','florida','georgia','illinois','indiana',
    'iowa','kansas','kentucky','louisiana','michigan','mississippi','missouri',
    'nebraska','nevada','new-mexico','north-carolina','ohio','oklahoma',
    'south-carolina','tennessee','texas','utah','virginia','wisconsin',
  ],
  'wawa': [
    'delaware','florida','maryland','new-jersey','north-carolina','pennsylvania','virginia',
  ],
  'sheetz': [
    'indiana','kentucky','maryland','north-carolina','ohio','pennsylvania','south-carolina','virginia','west-virginia',
  ],
  'walmart': [
    'alabama','arizona','arkansas','california','colorado','connecticut','delaware',
    'florida','georgia','idaho','illinois','indiana','iowa','kansas','kentucky',
    'louisiana','maine','maryland','massachusetts','michigan','minnesota','mississippi',
    'missouri','montana','nebraska','nevada','new-hampshire','new-jersey','new-mexico',
    'new-york','north-carolina','north-dakota','ohio','oklahoma','oregon','pennsylvania',
    'rhode-island','south-carolina','south-dakota','tennessee','texas','utah','vermont',
    'virginia','washington','west-virginia','wisconsin','wyoming',
  ],
  'bucees': [
    'alabama','colorado','florida','georgia','indiana','kansas','kentucky','missouri',
    'nebraska','north-carolina','ohio','oklahoma','south-carolina','tennessee','texas','virginia','wyoming',
  ],
  'kroger': [
    'alabama','arizona','arkansas','california','colorado','delaware','florida','georgia',
    'idaho','illinois','indiana','kansas','kentucky','louisiana','maryland','michigan',
    'mississippi','missouri','montana','nebraska','nevada','new-mexico','new-york',
    'north-carolina','ohio','oklahoma','oregon','pennsylvania','south-carolina',
    'tennessee','texas','utah','virginia','washington','west-virginia','wisconsin','wyoming',
  ],
  'circle-k': [
    'alabama','arizona','arkansas','california','colorado','connecticut','delaware',
    'florida','georgia','idaho','illinois','indiana','iowa','kansas','kentucky',
    'louisiana','maine','maryland','massachusetts','michigan','minnesota','mississippi',
    'missouri','montana','nebraska','nevada','new-hampshire','new-jersey','new-mexico',
    'new-york','north-carolina','north-dakota','ohio','oklahoma','oregon','pennsylvania',
    'rhode-island','south-carolina','south-dakota','tennessee','texas','utah',
    'virginia','washington','west-virginia','wisconsin','wyoming',
  ],
}

// State gas tax data (¢/gal, approximate 2024)
const STATE_GAS_TAX: Record<string, number> = {
  AL:22,AK:9,AZ:19,AR:22,CA:86,CO:22,CT:35,DE:23,FL:39,GA:33,HI:17,ID:33,
  IL:46,IN:33,IA:31,KS:24,KY:28,LA:20,ME:30,MD:43,MA:24,MI:28,MN:29,MS:18,
  MO:19,MT:33,NE:25,NV:24,NH:22,NJ:42,NM:17,NY:49,NC:40,ND:23,OH:38,OK:19,
  OR:40,PA:59,RI:35,SC:28,SD:30,TN:27,TX:20,UT:31,VT:32,VA:28,WA:49,WV:36,
  WI:32,WY:24,
}

// Approx number of club locations per state for top brands
const SAM_STATE_LOCATIONS: Record<string, number> = {
  CA:24,TX:76,FL:46,NY:15,IL:18,OH:20,PA:15,MI:14,GA:18,NC:16,
  VA:13,TN:12,MO:11,IN:11,SC:10,AL:10,MS:8,KY:8,AR:7,OK:7,
}
const COSTCO_STATE_LOCATIONS: Record<string, number> = {
  CA:136,TX:36,WA:30,FL:28,NY:19,VA:17,IL:16,OR:14,NJ:12,PA:12,
  AZ:11,MA:11,OH:10,CO:10,GA:8,MI:8,MN:8,MD:8,NC:7,IN:7,
}

function getLocationCount(brand: string, abbr: string): number | null {
  if (brand === 'sams-club') return SAM_STATE_LOCATIONS[abbr] ?? null
  if (brand === 'costco') return COSTCO_STATE_LOCATIONS[abbr] ?? null
  return null
}

function toTitle(slug: string) {
  return slug.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ')
}

interface Props {
  club: ClubData
  stateSlug: string
  stateAbbr: string
  statePrice: number | null
  nationalAvg: number | null
}

export default function WarehouseClubStatePage({ club, stateSlug, stateAbbr, statePrice, nationalAvg }: Props) {
  const stateName = toTitle(stateSlug)
  const savingsMid = (club.savingsLow + club.savingsHigh) / 2
  const basePrice = statePrice ?? nationalAvg
  const estClubPrice = basePrice ? (basePrice - savingsMid / 100) : null
  const gasTax = STATE_GAS_TAX[stateAbbr] ?? null
  const locationCount = getLocationCount(club.slug, stateAbbr)

  const vsNational = statePrice && nationalAvg ? statePrice - nationalAvg : null
  const isHighTaxState = gasTax && gasTax >= 40

  const brandStates = BRAND_STATES[club.slug] ?? []
  const otherStates = brandStates.filter(s => s !== stateSlug).slice(0, 20)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `${club.name} Grocery Prices in ${stateName} Today`,
    description: `${club.name} Grocery Prices in ${stateName} today. Based on current ${stateName} avg of ${statePrice ? `$${statePrice.toFixed(2)}/gal` : 'local prices'}, members typically pay ${club.savingsLow}–${club.savingsHigh}¢ less per gallon.`,
    url: `https://whatsthegrocerybill.com/grocery-prices/${club.slug}/${stateSlug}`,
    publisher: { '@type': 'Organization', name: "What's the Grocery Bill?", url: 'https://whatsthegrocerybill.com' },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://whatsthegrocerybill.com' },
        { '@type': 'ListItem', position: 2, name: 'Grocery Prices by State', item: 'https://whatsthegrocerybill.com/grocery-prices' },
        { '@type': 'ListItem', position: 3, name: `${stateName} Grocery Prices`, item: `https://whatsthegrocerybill.com/grocery-prices/${stateSlug}` },
        { '@type': 'ListItem', position: 4, name: `${club.name} Gas in ${stateName}`, item: `https://whatsthegrocerybill.com/grocery-prices/${club.slug}/${stateSlug}` },
      ],
    },
  }

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `How much is gas at ${club.name} in ${stateName} today?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Based on today's ${stateName} average of ${statePrice ? `$${statePrice.toFixed(2)}/gal` : 'current local prices'}, ${club.name} in ${stateName} is estimated at around $${estClubPrice?.toFixed(2) ?? 'a few cents less'} per gallon. ${club.name} typically prices ${club.savingsLow}–${club.savingsHigh}¢ per gallon below the state average.`,
        },
      },
      {
        '@type': 'Question',
        name: `Is ${club.name} gas cheaper than regular gas stations in ${stateName}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Yes. ${club.name} gas in ${stateName} is typically ${club.savingsLow}–${club.savingsHigh}¢ per gallon cheaper than branded stations. ${isHighTaxState ? `${stateName} has relatively high state gas taxes (~${gasTax}¢/gal), which affects all stations equally — the ${club.shortName} discount still applies on top of that base.` : `At $${statePrice?.toFixed(2) ?? 'the current state average'}, that's a meaningful per-fill-up savings.`}`,
        },
      },
      {
        '@type': 'Question',
        name: `Do you need a membership for ${club.name} gas in ${stateName}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: club.requiresMembership
            ? `Yes. A valid ${club.membership} (${club.membershipCost}) is required to purchase fuel at any ${club.name} location, including those in ${stateName}.`
            : `No membership required. ${club.name} is open to all drivers in ${stateName}.`,
        },
      },
      {
        '@type': 'Question',
        name: `Why is gas more expensive in ${stateName} than the national average?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: vsNational !== null && vsNational > 0
            ? `${stateName} Grocery Prices are ${vsNational.toFixed(2)}/gal above the national average. Factors include: state gas taxes (~${gasTax ?? '?'}¢/gal), regional refinery capacity, distribution costs, and local market competition. ${isHighTaxState ? `${stateName} is among the higher-tax states for fuel.` : ''}`
            : `${stateName} Grocery Prices are currently ${vsNational !== null ? `$${Math.abs(vsNational).toFixed(2)}/gal below` : 'near'} the national average of $${nationalAvg?.toFixed(2) ?? '—'}. State gas tax is approximately ${gasTax ?? '?'}¢/gal.`,
        },
      },
    ],
  }

  return (
    <main style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: F }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '32px 20px 80px' }}>

        {/* Breadcrumb */}
        <div style={{ marginBottom: 24, display: 'flex', gap: 8, fontSize: 13, color: C.muted, flexWrap: 'wrap' }}>
          <Link href="/" style={{ color: C.muted, textDecoration: 'none' }}>Home</Link>
          <span>›</span>
          <Link href="/grocery-prices" style={{ color: C.muted, textDecoration: 'none' }}>Grocery Prices</Link>
          <span>›</span>
          <Link href={`/grocery-prices/${stateSlug}`} style={{ color: C.muted, textDecoration: 'none' }}>{stateName}</Link>
          <span>›</span>
          <Link href={`/grocery-prices/${club.slug}`} style={{ color: C.muted, textDecoration: 'none' }}>{club.name}</Link>
          <span>›</span>
          <span style={{ color: C.stone }}>{stateName}</span>
        </div>

        {/* Header */}
        <h1 style={{ margin: '0 0 6px', fontSize: 'clamp(24px,5vw,38px)', fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1.15 }}>
          🛒 {club.name} Grocery Prices in {stateName}
        </h1>
        <p style={{ margin: '0 0 28px', fontSize: 15, color: C.muted }}>
          Estimated today · Based on {stateName} AAA avg · Source: AAA + historical {club.shortName} savings data
        </p>

        {/* Price cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: 12,
          marginBottom: 12,
        }}>
          {/* State avg */}
          <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 14, padding: '20px 22px' }}>
            <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>
              {stateName} Avg Today
            </div>
            <div style={{ fontSize: 'clamp(36px,7vw,52px)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1 }}>
              {statePrice ? `$${statePrice.toFixed(2)}` : '—'}
            </div>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>per gallon · regular</div>
            {vsNational !== null && (
              <div style={{ marginTop: 6, fontSize: 12, color: vsNational > 0 ? C.red : C.green, fontWeight: 600 }}>
                {vsNational > 0 ? `+$${vsNational.toFixed(2)}` : `-$${Math.abs(vsNational).toFixed(2)}`} vs national avg
              </div>
            )}
          </div>

          {/* Estimated club price */}
          <div style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 14, padding: '20px 22px' }}>
            <div style={{ fontSize: 11, color: '#6ee7b7', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>
              Est. {club.shortName} Price
            </div>
            <div style={{ fontSize: 'clamp(36px,7vw,52px)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1, color: C.green }}>
              {estClubPrice ? `$${estClubPrice.toFixed(2)}` : '—'}
            </div>
            <div style={{ fontSize: 12, color: '#86efac', marginTop: 4 }}>
              ~{club.savingsLow}–{club.savingsHigh}¢ below state avg
            </div>
          </div>

          {/* National avg */}
          {nationalAvg && (
            <div style={{ background: '#fafafa', border: '1px solid var(--border)', borderRadius: 14, padding: '20px 22px' }}>
              <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>
                National Avg
              </div>
              <div style={{ fontSize: 'clamp(36px,7vw,52px)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1, color: C.stone }}>
                ${nationalAvg.toFixed(2)}
              </div>
              <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>per gallon · regular</div>
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <p style={{ margin: '0 0 28px', fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>
          ⚠️ {club.name} does not publish real-time prices. Estimated price uses today&apos;s {stateName} AAA average minus {club.shortName}&apos;s typical {club.savingsLow}–{club.savingsHigh}¢/gal savings. Actual prices vary by location.
        </p>

        {/* Savings snapshot */}
        {basePrice && (
          <div style={{ background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.15)', borderRadius: 14, padding: '20px 22px', marginBottom: 28 }}>
            <h2 style={{ margin: '0 0 14px', fontSize: 16, fontWeight: 800 }}>
              Your Savings in {stateName}
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12 }}>
              {[
                { label: 'Per gallon', value: `${savingsMid.toFixed(0)}¢` },
                { label: 'Per fill-up (13 gal)', value: `$${((savingsMid / 100) * 13).toFixed(2)}` },
                { label: 'Per year (52 fill-ups)', value: `$${((savingsMid / 100) * 13 * 52).toFixed(0)}` },
              ].map(({ label, value }) => (
                <div key={label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: '#6ee7b7', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: 24, fontWeight: 900, color: C.green }}>{value}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* State gas tax context */}
        {gasTax && (
          <div style={{ background: '#fafafa', border: '1px solid var(--border)', borderRadius: 12, padding: '18px 20px', marginBottom: 28 }}>
            <h2 style={{ margin: '0 0 10px', fontSize: 15, fontWeight: 700 }}>
              {stateName} Gas Tax Context
            </h2>
            <p style={{ margin: 0, fontSize: 14, color: C.stone, lineHeight: 1.75 }}>
              {stateName}&apos;s state gas tax is approximately <strong style={{ color: C.text }}>{gasTax}¢ per gallon</strong>{' '}
              {gasTax >= 50 ? '— one of the highest in the US.' : gasTax >= 35 ? '— above the national average.' : gasTax <= 20 ? '— one of the lowest in the US.' : '— near the national average.'}
              {' '}This tax applies equally to all stations including {club.shortName}, so the{' '}
              {club.savingsLow}–{club.savingsHigh}¢ membership discount is on top of the post-tax street price.
              {isHighTaxState && ` In high-tax states like ${stateName}, the absolute price at the pump is higher, but the relative savings from a ${club.shortName} membership remain the same.`}
            </p>
          </div>
        )}

        {/* Location count */}
        {locationCount && (
          <div style={{ background: '#fafafa', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 20px', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: 32 }}>📍</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>
                ~{locationCount} {club.name} locations in {stateName}
              </div>
              <div style={{ fontSize: 13, color: C.muted }}>
                Use the {club.name} app or website to find the nearest fuel center and confirm today&apos;s price.
              </div>
            </div>
          </div>
        )}

        {/* Membership reminder */}
        {club.requiresMembership && (
          <div style={{ background: 'rgba(255,165,0,0.06)', border: '1px solid rgba(255,165,0,0.2)', borderRadius: 12, padding: '16px 20px', marginBottom: 28 }}>
            <div style={{ fontSize: 13, color: '#fbbf24', fontWeight: 600, marginBottom: 4 }}>Membership required</div>
            <div style={{ fontSize: 13, color: C.stone, lineHeight: 1.6 }}>
              {club.name} fuel is available to members only. {club.membershipCost} · {club.membershipTiers?.[0] ?? club.membership}
            </div>
          </div>
        )}

        {/* FAQ */}
        <div style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16 }}>
            {club.name} Gas in {stateName} — FAQs
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {faqLd.mainEntity.map((item, i) => (
              <div key={i} style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 6 }}>{item.name}</div>
                <div style={{ fontSize: 13, color: C.stone, lineHeight: 1.7 }}>{item.acceptedAnswer.text}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Other states for this brand */}
        {otherStates.length > 0 && (
          <div style={{ marginBottom: 36 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, color: C.stone }}>
              {club.name} Grocery Prices — Other States
            </h2>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {otherStates.map(s => (
                <Link key={s} href={`/grocery-prices/${club.slug}/${s}`} style={{
                  padding: '7px 13px', background: '#fff', border: '1px solid var(--border)',
                  borderRadius: 8, textDecoration: 'none', fontSize: 12, color: C.stone,
                }}>
                  {toTitle(s)}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Nav links */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
          <Link href={`/grocery-prices/${club.slug}`} style={{ padding: '9px 18px', background: '#f8fafc', color: C.stone, borderRadius: 20, textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
            ← All {club.name} States
          </Link>
          <Link href={`/grocery-prices/${stateSlug}`} style={{ padding: '9px 18px', background: '#f8fafc', color: C.stone, borderRadius: 20, textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
            {stateName} Grocery Prices
          </Link>
          <Link href="/" style={{ padding: '9px 18px', background: C.red, color: '#fff', borderRadius: 20, textDecoration: 'none', fontSize: 13, fontWeight: 700 }}>
            🛒 National Map
          </Link>
        </div>

      </div>
    </main>
  )
}
