import Link from 'next/link'
import type { ClubData } from '../../lib/warehouseClubs'

const C = {
  bg: '#0b0d14', card: '#111827', border: 'rgba(255,255,255,0.07)',
  red: '#16a34a', text: '#f1f5f9', muted: '#64748b', stone: '#94a3b8',
  green: '#22c55e', orange: '#4ade80',
}
const F = "'Inter', system-ui, sans-serif"

const US_STATES = [
  ['Alabama','alabama'],['Alaska','alaska'],['Arizona','arizona'],['Arkansas','arkansas'],
  ['California','california'],['Colorado','colorado'],['Connecticut','connecticut'],
  ['Delaware','delaware'],['Florida','florida'],['Georgia','georgia'],['Hawaii','hawaii'],
  ['Idaho','idaho'],['Illinois','illinois'],['Indiana','indiana'],['Iowa','iowa'],
  ['Kansas','kansas'],['Kentucky','kentucky'],['Louisiana','louisiana'],['Maine','maine'],
  ['Maryland','maryland'],['Massachusetts','massachusetts'],['Michigan','michigan'],
  ['Minnesota','minnesota'],['Mississippi','mississippi'],['Missouri','missouri'],
  ['Montana','montana'],['Nebraska','nebraska'],['Nevada','nevada'],
  ['New Hampshire','new-hampshire'],['New Jersey','new-jersey'],['New Mexico','new-mexico'],
  ['New York','new-york'],['North Carolina','north-carolina'],['North Dakota','north-dakota'],
  ['Ohio','ohio'],['Oklahoma','oklahoma'],['Oregon','oregon'],['Pennsylvania','pennsylvania'],
  ['Rhode Island','rhode-island'],['South Carolina','south-carolina'],
  ['South Dakota','south-dakota'],['Tennessee','tennessee'],['Texas','texas'],
  ['Utah','utah'],['Vermont','vermont'],['Virginia','virginia'],['Washington','washington'],
  ['West Virginia','west-virginia'],['Wisconsin','wisconsin'],['Wyoming','wyoming'],
]

interface Props {
  club: ClubData
  nationalAvg: number | null
}

export default function WarehouseClubPage({ club, nationalAvg }: Props) {
  const savingsMid = (club.savingsLow + club.savingsHigh) / 2
  const annualSavings = nationalAvg
    ? ((savingsMid / 100) * club.tankSize * club.fillsPerYear).toFixed(0)
    : null
  const estPrice = nationalAvg ? (nationalAvg - savingsMid / 100) : null

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `${club.name} Grocery Prices Today`,
    description: club.metaDescription,
    url: `https://whatsthegrocerybill.com/grocery-prices/${club.slug}`,
    publisher: { '@type': 'Organization', name: "What's the Grocery Bill?", url: 'https://whatsthegrocerybill.com' },
  }

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: club.faqs.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
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
          <Link href="/grocery-prices" style={{ color: C.muted, textDecoration: 'none' }}>Grocery Prices by State</Link>
          <span>›</span>
          <span style={{ color: C.stone }}>{club.name} Grocery Prices</span>
        </div>

        {/* Header */}
        <h1 style={{ margin: '0 0 6px', fontSize: 'clamp(26px,5vw,40px)', fontWeight: 900, letterSpacing: '-0.02em' }}>
          🛒 {club.name} Grocery Prices Today
        </h1>
        <p style={{ margin: '0 0 32px', fontSize: 15, color: C.muted, lineHeight: 1.6 }}>
          {club.requiresMembership ? 'Member-only pricing' : 'No membership required'} ·{' '}
          {club.stationCount} · {club.statesAvailable}
        </p>

        {/* Price hero */}
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 16,
          padding: '28px 28px',
          marginBottom: 16,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 24,
        }}>
          <div>
            <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>
              National Average Today
            </div>
            <div style={{ fontSize: 'clamp(40px,8vw,60px)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1 }}>
              {nationalAvg ? `$${nationalAvg.toFixed(2)}` : '—'}
            </div>
            <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>per gallon · regular unleaded</div>
          </div>

          <div>
            <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>
              Estimated {club.shortName} Price
            </div>
            <div style={{ fontSize: 'clamp(40px,8vw,60px)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1, color: C.green }}>
              {estPrice ? `$${estPrice.toFixed(2)}` : '—'}
            </div>
            <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>
              avg {club.savingsLow}–{club.savingsHigh}¢ below national avg
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <p style={{ margin: '0 0 28px', fontSize: 12, color: '#475569', lineHeight: 1.5 }}>
          ⚠️ {club.name} does not publish real-time Grocery Prices online. The estimated price above is based on historical savings data and today&apos;s national average from AAA. Actual prices vary by location.
        </p>

        {/* Savings calculator card */}
        {annualSavings && (
          <div style={{
            background: 'rgba(34,197,94,0.06)',
            border: '1px solid rgba(34,197,94,0.2)',
            borderRadius: 14,
            padding: '22px 24px',
            marginBottom: 28,
          }}>
            <h2 style={{ margin: '0 0 14px', fontSize: 17, fontWeight: 800, color: C.text }}>
              💰 How Much Would You Save?
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 14 }}>
              {[
                { label: 'Per fill-up', value: `$${((savingsMid / 100) * club.tankSize).toFixed(2)}` },
                { label: 'Per month (4 fills)', value: `$${((savingsMid / 100) * club.tankSize * 4).toFixed(2)}` },
                { label: 'Per year (52 fills)', value: `$${annualSavings}` },
              ].map(({ label, value }) => (
                <div key={label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: '#6ee7b7', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: 26, fontWeight: 900, color: C.green }}>{value}</div>
                </div>
              ))}
            </div>
            <p style={{ margin: '14px 0 0', fontSize: 12, color: '#86efac' }}>
              Based on {club.savingsLow}–{club.savingsHigh}¢/gal avg savings, {club.tankSize}-gal fill-ups, weekly fill-ups.
              {club.requiresMembership && ` Membership costs ${club.membershipCost}.`}
            </p>
            {club.requiresMembership && (
              <p style={{ margin: '8px 0 0', fontSize: 13, color: C.stone }}>
                <strong style={{ color: C.text }}>Break-even:</strong>{' '}
                {club.membershipCost.includes('–')
                  ? `At the base membership price and avg ${savingsMid}¢/gal savings, you recoup the cost after roughly ${Math.ceil(parseFloat(club.membershipCost.replace('$','').split('–')[0]) / ((savingsMid / 100) * club.tankSize))} fill-ups.`
                  : `You recoup the membership cost after roughly ${Math.ceil(parseFloat(club.membershipCost.replace(/[^0-9]/g,'')) / ((savingsMid / 100) * club.tankSize))} fill-ups.`
                }
              </p>
            )}
          </div>
        )}

        {/* Why cheaper */}
        <div style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 12,
          padding: '20px 22px',
          marginBottom: 28,
        }}>
          <h2 style={{ margin: '0 0 10px', fontSize: 16, fontWeight: 800 }}>
            Why Is {club.name} Gas Cheaper?
          </h2>
          <p style={{ margin: 0, fontSize: 14, color: C.stone, lineHeight: 1.75 }}>
            {club.whyCheaper}
          </p>
        </div>

        {/* Membership tiers */}
        {club.membershipTiers && (
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 12,
            padding: '20px 22px',
            marginBottom: 28,
          }}>
            <h2 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 800 }}>
              Membership Options
            </h2>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
              {club.membershipTiers.map((tier, i) => (
                <li key={i} style={{ fontSize: 14, color: C.stone, padding: '6px 0', borderBottom: i < club.membershipTiers!.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <span style={{ color: C.green, marginTop: 1 }}>✓</span>
                  <span>{tier}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Notes */}
        <div style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 12,
          padding: '20px 22px',
          marginBottom: 36,
        }}>
          <h2 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 800 }}>
            What to Know Before You Go
          </h2>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
            {club.notes.map((note, i) => (
              <li key={i} style={{ fontSize: 14, color: C.stone, padding: '6px 0', borderBottom: i < club.notes.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', display: 'flex', gap: 8 }}>
                <span style={{ color: C.orange }}>→</span>
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* FAQ */}
        <div style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 18 }}>
            {club.name} Gas — Frequently Asked Questions
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {club.faqs.map((faq, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 12,
                padding: '16px 18px',
              }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 8 }}>
                  {faq.q}
                </div>
                <div style={{ fontSize: 13, color: C.stone, lineHeight: 1.7 }}>
                  {faq.a}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* State grid */}
        <div style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>
            Grocery Prices Near You
          </h2>
          <p style={{ margin: '0 0 16px', fontSize: 14, color: C.muted }}>
            Select your state to see today&apos;s average Grocery Price, city-level breakdowns, and how you compare to the national average.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 6 }}>
            {US_STATES.map(([name, slug]) => (
              <Link key={slug} href={`/grocery-prices/${slug}`} style={{ textDecoration: 'none' }}>
                <div style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 8,
                  padding: '8px 12px',
                  fontSize: 13,
                  color: C.stone,
                  transition: 'all 0.15s',
                }}>
                  {name}
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Compare clubs CTA */}
        <div style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 12,
          padding: '18px 22px',
          marginBottom: 24,
        }}>
          <h2 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 700, color: C.stone }}>
            Compare Warehouse Club Grocery Prices
          </h2>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[
              { name: "Sam's Club", slug: 'sams-club' },
              { name: 'Costco', slug: 'costco' },
              { name: "BJ's", slug: 'bjs' },
              { name: 'Murphy USA', slug: 'murphys' },
              { name: 'Wawa', slug: 'wawa' },
            ].filter(c => c.slug !== club.slug).map(c => (
              <Link key={c.slug} href={`/grocery-prices/${c.slug}`} style={{
                padding: '7px 14px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 8,
                textDecoration: 'none',
                fontSize: 13,
                color: C.stone,
                fontWeight: 500,
              }}>
                {c.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Main CTA */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link href="/" style={{ padding: '10px 20px', background: C.red, color: '#fff', borderRadius: 20, textDecoration: 'none', fontSize: 13, fontWeight: 700 }}>
            🛒 National Grocery Price Map
          </Link>
          <Link href="/news" style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.06)', color: C.stone, borderRadius: 20, textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
            📰 Grocery Price News
          </Link>
        </div>

      </div>
    </main>
  )
}
