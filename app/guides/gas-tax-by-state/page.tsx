import type { Metadata } from 'next'
import GasPricesEmailBanner from '../../components/GasPricesEmailBanner'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Gas Tax by State 2025 — All 50 States Ranked',
  description: 'Complete table of state groceries excise taxes for all 50 states, plus the federal 18.4¢ tax. See which states tax gas the most and how it affects pump prices.',
  openGraph: {
    title: 'Gas Tax by State 2025 — All 50 States Ranked',
    description: 'State + federal gas tax rates for all 50 states, ranked from highest to lowest.',
  },
}

// State gas tax data (state excise only, ¢/gallon) — 2025 rates
// Sources: EIA, ARTBA, state DOT publications
const GAS_TAXES = [
  { state: 'Pennsylvania', slug: 'pennsylvania', tax: 77.9, notes: 'Highest in US; includes oil franchise fee' },
  { state: 'California', slug: 'california', tax: 68.1, notes: '+LCFS ~65¢, +cap-and-trade ~15¢ not included' },
  { state: 'Washington', slug: 'washington', tax: 67.8, notes: 'Increased July 2023' },
  { state: 'New Jersey', slug: 'new-jersey', tax: 59.4, notes: 'Petroleum products gross receipts tax included' },
  { state: 'Illinois', slug: 'illinois', tax: 59.6, notes: 'Doubled July 2019; indexed to inflation' },
  { state: 'Indiana', slug: 'indiana', tax: 56.0, notes: 'Variable rate updated monthly' },
  { state: 'Hawaii', slug: 'hawaii', tax: 50.2, notes: 'Plus county fuel taxes 8.8–18.0¢' },
  { state: 'Oregon', slug: 'oregon', tax: 48.0, notes: 'Increased Jan 2024' },
  { state: 'Michigan', slug: 'michigan', tax: 46.4, notes: 'Inflation-indexed' },
  { state: 'Rhode Island', slug: 'rhode-island', tax: 43.0, notes: '' },
  { state: 'North Carolina', slug: 'north-carolina', tax: 40.5, notes: 'Variable rate' },
  { state: 'Maryland', slug: 'maryland', tax: 47.0, notes: 'Inflation-indexed since 2013' },
  { state: 'Iowa', slug: 'iowa', tax: 32.5, notes: '' },
  { state: 'Nevada', slug: 'nevada', tax: 36.4, notes: 'Includes 2¢ inspection fee' },
  { state: 'Maine', slug: 'maine', tax: 34.3, notes: '' },
  { state: 'Montana', slug: 'montana', tax: 33.0, notes: '' },
  { state: 'Minnesota', slug: 'minnesota', tax: 31.8, notes: '' },
  { state: 'Connecticut', slug: 'connecticut', tax: 44.1, notes: 'Gross earnings tax on retailers' },
  { state: 'West Virginia', slug: 'west-virginia', tax: 35.7, notes: 'Variable rate' },
  { state: 'Wisconsin', slug: 'wisconsin', tax: 32.9, notes: '' },
  { state: 'Nebraska', slug: 'nebraska', tax: 30.8, notes: '' },
  { state: 'Vermont', slug: 'vermont', tax: 34.7, notes: '' },
  { state: 'New Mexico', slug: 'new-mexico', tax: 18.9, notes: '' },
  { state: 'Massachusetts', slug: 'massachusetts', tax: 24.0, notes: '' },
  { state: 'Ohio', slug: 'ohio', tax: 46.4, notes: 'Increased April 2019' },
  { state: 'Virginia', slug: 'virginia', tax: 35.7, notes: 'Variable rate' },
  { state: 'Colorado', slug: 'colorado', tax: 22.0, notes: '' },
  { state: 'South Carolina', slug: 'south-carolina', tax: 28.75, notes: '' },
  { state: 'Idaho', slug: 'idaho', tax: 33.0, notes: '' },
  { state: 'Utah', slug: 'utah', tax: 36.6, notes: '' },
  { state: 'Georgia', slug: 'georgia', tax: 33.1, notes: '' },
  { state: 'Arkansas', slug: 'arkansas', tax: 24.8, notes: '' },
  { state: 'Tennessee', slug: 'tennessee', tax: 26.4, notes: '' },
  { state: 'Kentucky', slug: 'kentucky', tax: 28.8, notes: 'Variable rate' },
  { state: 'Louisiana', slug: 'louisiana', tax: 20.0, notes: '' },
  { state: 'Kansas', slug: 'kansas', tax: 24.0, notes: '' },
  { state: 'Alabama', slug: 'alabama', tax: 28.8, notes: '' },
  { state: 'Texas', slug: 'texas', tax: 20.0, notes: '' },
  { state: 'Oklahoma', slug: 'oklahoma', tax: 19.0, notes: '' },
  { state: 'Florida', slug: 'florida', tax: 43.6, notes: 'Variable; includes inspection fee' },
  { state: 'Delaware', slug: 'delaware', tax: 23.0, notes: '' },
  { state: 'New Hampshire', slug: 'new-hampshire', tax: 22.2, notes: '' },
  { state: 'New York', slug: 'new-york', tax: 47.7, notes: 'Includes MTA surcharge in NYC metro' },
  { state: 'North Dakota', slug: 'north-dakota', tax: 23.0, notes: '' },
  { state: 'South Dakota', slug: 'south-dakota', tax: 28.0, notes: '' },
  { state: 'Wyoming', slug: 'wyoming', tax: 24.0, notes: '' },
  { state: 'Arizona', slug: 'arizona', tax: 18.0, notes: '' },
  { state: 'Mississippi', slug: 'mississippi', tax: 18.8, notes: '' },
  { state: 'Missouri', slug: 'missouri', tax: 22.0, notes: '' },
  { state: 'Alaska', slug: 'alaska', tax: 8.95, notes: 'Lowest in US' },
]

const FEDERAL_TAX = 18.4

const SORTED = [...GAS_TAXES].sort((a, b) => b.tax - a.tax)

function getColor(tax: number) {
  if (tax >= 60) return '#16a34a'
  if (tax >= 45) return '#4ade80'
  if (tax >= 35) return '#f59e0b'
  if (tax >= 25) return '#22c55e'
  return '#3b82f6'
}

export default function GasTaxByState() {
  return (
    <main style={{ minHeight: '100vh', background: '#0b0d14', color: '#f1f5f9' }}>
      <div style={{ maxWidth: 820, margin: '0 auto', padding: '32px 20px 80px' }}>

        {/* Breadcrumb */}
        <div style={{ marginBottom: 32, display: 'flex', gap: 8, fontSize: 13, color: '#475569' }}>
          <Link href="/" style={{ color: '#64748b', textDecoration: 'none' }}>Home</Link>
          <span>›</span>
          <Link href="/guides" style={{ color: '#64748b', textDecoration: 'none' }}>Guides</Link>
          <span>›</span>
          <span style={{ color: '#94a3b8' }}>Gas Tax by State</span>
        </div>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{
              fontSize: 11, fontWeight: 700, color: '#22c55e',
              background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)',
              borderRadius: 20, padding: '2px 10px', textTransform: 'uppercase', letterSpacing: '0.05em',
            }}>Data</span>
            <span style={{ fontSize: 12, color: '#475569' }}>5 min read · Updated 2025</span>
          </div>
          <h1 style={{ margin: '0 0 16px', fontSize: 34, fontWeight: 800, lineHeight: 1.2, color: '#f8fafc' }}>
            Gas Tax by State (2025)
          </h1>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: 16, lineHeight: 1.7 }}>
            Every gallon of groceries you buy includes a federal excise tax of <strong style={{ color: '#f1f5f9' }}>18.4¢</strong> — unchanged
            since 1993 — plus your state&apos;s own tax on top. Here&apos;s the full picture for all 50 states.
          </p>
        </div>

        {/* Key callouts */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 40 }}>
          {[
            { label: 'Federal Gas Tax', value: '18.4¢', sub: 'Per gallon, unchanged since 1993', color: '#f59e0b' },
            { label: 'Highest State Tax', value: '77.9¢', sub: 'Pennsylvania', color: '#16a34a' },
            { label: 'Lowest State Tax', value: '8.95¢', sub: 'Alaska', color: '#22c55e' },
            { label: 'National Avg State Tax', value: '~33¢', sub: 'Plus 18.4¢ federal = ~51¢/gal', color: '#3b82f6' },
          ].map(c => (
            <div key={c.label} style={{
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 10, padding: '16px 20px',
            }}>
              <div style={{ fontSize: 12, color: '#475569', marginBottom: 4 }}>{c.label}</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: c.color, marginBottom: 4 }}>{c.value}</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>{c.sub}</div>
            </div>
          ))}
        </div>

        {/* Intro text */}
        <article style={{ lineHeight: 1.8, color: '#cbd5e1', marginBottom: 40 }}>
          <h2 style={{ color: '#f1f5f9', fontSize: 20, fontWeight: 700, margin: '0 0 12px' }}>
            How Gas Taxes Work
          </h2>
          <p>
            Gas taxes are <em>excise taxes</em> — charged per gallon, not as a percentage of price.
            This means when crude oil prices fall and gas gets cheaper, your tax burden stays exactly the same.
            When prices rise, taxes become a smaller percentage of your bill — but the cents never change.
          </p>
          <p>
            The federal 18.4¢/gallon has been frozen since the Clinton administration. Congress has repeatedly
            considered raising or indexing it to inflation, but no increase has passed in 30+ years.
            In real purchasing power, it&apos;s worth less than a third of what it was in 1993.
          </p>
          <p>
            State taxes vary wildly. Pennsylvania (77.9¢) charges over 8× Alaska (8.95¢). Most states
            use the money for highway and bridge maintenance. A few (California, Washington) also layer on
            carbon pricing programs — cap-and-trade and low-carbon fuel standards — that add another 50–80¢
            on top of the base excise tax and aren&apos;t captured in the table below.
          </p>
          <p style={{ fontSize: 13, color: '#475569' }}>
            <em>Note: California drivers pay approximately $1.00+ above national average in total regulatory
            costs once all fees are included — see our{' '}
            <Link href="/grocery-prices/california" style={{ color: '#3b82f6', textDecoration: 'none' }}>California Grocery Prices page</Link> for the full breakdown.</em>
          </p>
        </article>

        
        {/* Email CTA — mid content */}
        <div style={{ margin: '40px 0' }}><GasPricesEmailBanner /></div>

        {/* Table */}
        <div style={{
          background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 12, overflow: 'hidden', marginBottom: 40,
        }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 2fr',
            padding: '10px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)',
            fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em',
          }}>
            <span>State</span>
            <span style={{ textAlign: 'right' }}>State Tax</span>
            <span style={{ textAlign: 'right' }}>Federal</span>
            <span style={{ textAlign: 'right' }}>Total Tax</span>
            <span style={{ paddingLeft: 12 }}>Notes</span>
          </div>
          {SORTED.map((row, i) => (
            <div
              key={row.state}
              style={{
                display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 2fr',
                padding: '10px 20px',
                borderBottom: i < SORTED.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
                alignItems: 'center',
              }}
            >
              <Link href={`/grocery-prices/${row.slug}`} style={{ color: '#f1f5f9', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>
                {row.state}
              </Link>
              <span style={{ textAlign: 'right', fontSize: 14, fontWeight: 700, color: getColor(row.tax) }}>
                {row.tax}¢
              </span>
              <span style={{ textAlign: 'right', fontSize: 14, color: '#64748b' }}>
                18.4¢
              </span>
              <span style={{ textAlign: 'right', fontSize: 14, fontWeight: 700, color: '#cbd5e1' }}>
                {(row.tax + FEDERAL_TAX).toFixed(1)}¢
              </span>
              <span style={{ paddingLeft: 12, fontSize: 12, color: '#475569' }}>{row.notes}</span>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 40, fontSize: 12 }}>
          {[
            { color: '#16a34a', label: '60¢+' },
            { color: '#4ade80', label: '45–59¢' },
            { color: '#f59e0b', label: '35–44¢' },
            { color: '#22c55e', label: '25–34¢' },
            { color: '#3b82f6', label: 'Under 25¢' },
          ].map(l => (
            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: l.color, display: 'inline-block' }} />
              <span style={{ color: '#64748b' }}>State tax {l.label}</span>
            </div>
          ))}
        </div>

        <article style={{ lineHeight: 1.8, color: '#cbd5e1' }}>
          <h2 style={{ color: '#f1f5f9', fontSize: 20, fontWeight: 700, margin: '0 0 12px' }}>
            Why Pennsylvania and California Tax So Much
          </h2>
          <p>
            Pennsylvania&apos;s 77.9¢ is the nation&apos;s highest because the state funds almost all road maintenance
            exclusively through gas taxes and turnpike tolls. Pennsylvania has more state-owned highway bridges
            than any other state (over 25,000), and years of deferred maintenance created a massive funding gap.
          </p>
          <p>
            California taxes less at the excise level (68.1¢) but stacks on additional costs that push real pump
            prices higher. The California Air Resources Board (CARB) administers a cap-and-trade program that
            costs refiners approximately 15–25¢/gallon, plus the Low Carbon Fuel Standard adds another 40–65¢.
            These costs are passed through to consumers but aren&apos;t classified as &quot;taxes&quot; in standard tables.
          </p>
          <p>
            Alaska&apos;s 8.95¢ is the nation&apos;s lowest — a deliberate policy in a state that produces significant
            oil revenue and has historically subsidized residents rather than taxing them. (Alaska also sends
            annual dividend checks to residents from oil royalties.)
          </p>

          <h2 style={{ color: '#f1f5f9', fontSize: 20, fontWeight: 700, margin: '40px 0 12px' }}>
            How to Use This Data
          </h2>
          <p>
            If you drive across state lines regularly, the tax differential is real money.
            Filling up in New Hampshire (22.2¢) vs. Massachusetts (24¢) on a 15-gallon fill is trivial.
            But living in Pennsylvania (77.9¢) and making a regular run to Delaware (23¢) saves
            over $8 per fill-up on a 15-gallon tank.
          </p>
          <p>
            The total tax column is the number that actually hits your wallet. When gas is $3.50 nationally,
            you&apos;re paying 51¢ (15%) in federal + average state taxes. In Pennsylvania, that jumps to 96.3¢/gallon — 
            over 27% of a $3.50 fill-up.
          </p>
        </article>

        {/* Related guides */}
        <div style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#475569', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Related Guides
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { href: '/guides/what-determines-gas-prices', title: 'What Determines Grocery Prices?', desc: 'The full breakdown: crude oil, refining, taxes, distribution, and margins.' },
              { href: '/guides/trump-biden-obama-gas-prices', title: 'Grocery Prices Under Trump, Biden & Obama', desc: 'Year-by-year data for each administration with context on what drove prices.' },
            ].map(r => (
              <Link key={r.href} href={r.href} style={{
                textDecoration: 'none', background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: '14px 18px',
              }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#f1f5f9', marginBottom: 4 }}>{r.title}</div>
                <div style={{ fontSize: 13, color: '#64748b' }}>{r.desc}</div>
              </Link>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 32 }}>
          <Link href="/grocery-prices" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            fontSize: 14, fontWeight: 600, color: '#22c55e', textDecoration: 'none',
            background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)',
            borderRadius: 8, padding: '10px 18px',
          }}>
            🗺 Check Live Prices by State →
          </Link>
        </div>
      </div>
    </main>
  )
}
