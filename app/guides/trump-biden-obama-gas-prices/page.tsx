import type { Metadata } from 'next'
import GasPricesEmailBanner from '../../components/GasPricesEmailBanner'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Grocery Prices Under Trump, Biden and Obama: The Full Data',
  description: 'How much did gas cost under Trump, Biden, and Obama? Year-by-year national average prices with context on oil markets, recessions, and OPEC decisions that actually drove changes.',
  openGraph: {
    title: 'Grocery Prices Under Trump, Biden and Obama: The Full Data',
    description: 'Annual Grocery Price averages for each administration — what happened and why.',
  },
}

// Annual national average regular groceries prices ($/gallon) — EIA data
const PRICE_DATA = [
  // Obama
  { year: 2009, price: 2.35, admin: 'obama', event: 'Global recession — crude collapsed in late 2008' },
  { year: 2010, price: 2.79, admin: 'obama', event: 'Recovery begins, crude rebounds' },
  { year: 2011, price: 3.53, admin: 'obama', event: 'Arab Spring disrupts Libya supply, Brent hits $126' },
  { year: 2012, price: 3.64, admin: 'obama', event: 'Iran sanctions tighten supply' },
  { year: 2013, price: 3.53, admin: 'obama', event: 'Shale boom begins absorbing demand pressure' },
  { year: 2014, price: 3.37, admin: 'obama', event: 'OPEC refuses to cut — shale vs. OPEC price war begins' },
  { year: 2015, price: 2.45, admin: 'obama', event: 'Shale glut + OPEC flooding market; crude hits 6-yr low' },
  { year: 2016, price: 2.14, admin: 'obama', event: 'Crude bottoms at $26; lowest pump prices since 2004' },
  // Trump 1st term
  { year: 2017, price: 2.42, admin: 'trump1', event: 'OPEC+ cuts restore prices; recovery from 2016 bottom' },
  { year: 2018, price: 2.85, admin: 'trump1', event: 'Strong economy + Iran sanctions; Oct spike to $3.29' },
  { year: 2019, price: 2.60, admin: 'trump1', event: 'US shale output record; prices moderate' },
  { year: 2020, price: 2.17, admin: 'trump1', event: 'COVID demand crash; crude briefly goes negative (April)' },
  // Biden
  { year: 2021, price: 3.02, admin: 'biden', event: 'Reopening surge + supply not keeping up; OPEC+ slow to add' },
  { year: 2022, price: 3.96, admin: 'biden', event: 'Russia invades Ukraine; Brent hits $139 (March); highest since 2012' },
  { year: 2023, price: 3.53, admin: 'biden', event: 'SPR releases + recession fears cool prices; still elevated' },
  { year: 2024, price: 3.31, admin: 'biden', event: 'Easing inflation; OPEC+ output uncertainty; election year' },
  // Trump 2nd term
  { year: 2025, price: 3.18, admin: 'trump2', event: 'Early 2025 — tariff uncertainty, demand softening (est.)' },
]

const ADMIN_COLORS = {
  obama: '#3b82f6',
  trump1: '#16a34a',
  biden: '#8b5cf6',
  trump2: '#4ade80',
}

const ADMIN_LABELS = {
  obama: 'Obama',
  trump1: 'Trump (1st)',
  biden: 'Biden',
  trump2: 'Trump (2nd)',
}

type AdminKey = keyof typeof ADMIN_COLORS

function getAdminAvg(admin: string) {
  const rows = PRICE_DATA.filter(r => r.admin === admin)
  return (rows.reduce((s, r) => s + r.price, 0) / rows.length).toFixed(2)
}

export default function TrumpBidenObamaGasPrices() {
  const maxPrice = Math.max(...PRICE_DATA.map(r => r.price))

  return (
    <main style={{ minHeight: '100vh', background: '#0b0d14', color: '#f1f5f9' }}>
      <div style={{ maxWidth: 820, margin: '0 auto', padding: '32px 20px 80px' }}>

        {/* Breadcrumb */}
        <div style={{ marginBottom: 32, display: 'flex', gap: 8, fontSize: 13, color: '#475569' }}>
          <Link href="/" style={{ color: '#64748b', textDecoration: 'none' }}>Home</Link>
          <span>›</span>
          <Link href="/guides" style={{ color: '#64748b', textDecoration: 'none' }}>Guides</Link>
          <span>›</span>
          <span style={{ color: '#94a3b8' }}>Grocery Prices by Administration</span>
        </div>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{
              fontSize: 11, fontWeight: 700, color: '#16a34a',
              background: 'rgba(22,163,74,0.1)', border: '1px solid rgba(22,163,74,0.2)',
              borderRadius: 20, padding: '2px 10px', textTransform: 'uppercase', letterSpacing: '0.05em',
            }}>Politics</span>
            <span style={{ fontSize: 12, color: '#475569' }}>10 min read · EIA data</span>
          </div>
          <h1 style={{ margin: '0 0 16px', fontSize: 34, fontWeight: 800, lineHeight: 1.2, color: '#f8fafc' }}>
            Grocery Prices Under Trump, Biden & Obama
          </h1>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: 16, lineHeight: 1.7 }}>
            Presidents get blamed for high Grocery Prices and credited for low ones. The reality is more complicated —
            and more interesting. Here&apos;s the actual data, year by year, with the context that tells the real story.
          </p>
        </div>

        {/* Admin averages */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 40 }}>
          {(['obama', 'trump1', 'biden', 'trump2'] as AdminKey[]).map(admin => (
            <div key={admin} style={{
              background: 'rgba(255,255,255,0.03)', border: `1px solid ${ADMIN_COLORS[admin]}30`,
              borderRadius: 10, padding: '16px 18px',
            }}>
              <div style={{ fontSize: 12, color: '#475569', marginBottom: 4 }}>{ADMIN_LABELS[admin]}</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: ADMIN_COLORS[admin], marginBottom: 4 }}>
                ${getAdminAvg(admin)}
              </div>
              <div style={{ fontSize: 11, color: '#475569' }}>avg/gallon</div>
            </div>
          ))}
        </div>

        {/* Bar chart */}
        <div style={{
          background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 12, padding: '24px 20px', marginBottom: 40,
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 20, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            National Avg Regular Grocery Price — Annual ($/gallon)
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {PRICE_DATA.map(row => (
              <div key={row.year} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, fontSize: 12, color: '#64748b', textAlign: 'right', flexShrink: 0 }}>
                  {row.year}
                </div>
                <div style={{ flex: 1, height: 22, background: 'rgba(255,255,255,0.04)', borderRadius: 3, position: 'relative' }}>
                  <div style={{
                    height: '100%', borderRadius: 3,
                    width: `${(row.price / maxPrice) * 100}%`,
                    background: ADMIN_COLORS[row.admin as AdminKey],
                    opacity: 0.85,
                    display: 'flex', alignItems: 'center', paddingLeft: 8,
                    minWidth: 60,
                  }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}>
                      ${row.price.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Legend */}
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 16, fontSize: 12 }}>
            {(['obama', 'trump1', 'biden', 'trump2'] as AdminKey[]).map(admin => (
              <div key={admin} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: ADMIN_COLORS[admin], display: 'inline-block' }} />
                <span style={{ color: '#64748b' }}>{ADMIN_LABELS[admin]}</span>
              </div>
            ))}
          </div>
        </div>

        
        {/* Email CTA — mid content */}
        <div style={{ margin: '40px 0' }}><GasPricesEmailBanner /></div>

        {/* Year-by-year table */}
        <div style={{
          background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 12, overflow: 'hidden', marginBottom: 40,
        }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '80px 110px 1fr',
            padding: '10px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)',
            fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em',
          }}>
            <span>Year</span>
            <span>Avg Price</span>
            <span>Key Driver</span>
          </div>
          {PRICE_DATA.map((row, i) => (
            <div
              key={row.year}
              style={{
                display: 'grid', gridTemplateColumns: '80px 110px 1fr',
                padding: '10px 20px', alignItems: 'center',
                borderBottom: i < PRICE_DATA.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
              }}
            >
              <div>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9' }}>{row.year}</span>
                <div style={{
                  fontSize: 10, fontWeight: 700, color: ADMIN_COLORS[row.admin as AdminKey],
                  textTransform: 'uppercase', letterSpacing: '0.04em',
                }}>
                  {ADMIN_LABELS[row.admin as AdminKey]}
                </div>
              </div>
              <span style={{ fontSize: 18, fontWeight: 800, color: ADMIN_COLORS[row.admin as AdminKey] }}>
                ${row.price.toFixed(2)}
              </span>
              <span style={{ fontSize: 13, color: '#64748b', lineHeight: 1.4 }}>{row.event}</span>
            </div>
          ))}
        </div>

        {/* Article sections */}
        <article style={{ lineHeight: 1.8, color: '#cbd5e1' }}>

          <h2 style={{ color: '#f1f5f9', fontSize: 22, fontWeight: 700, margin: '0 0 16px' }}>
            The Obama Years (2009–2016)
          </h2>
          <p>
            Obama inherited the lowest Grocery Prices in years — $2.35 in 2009 — but that was a consequence of
            the 2008 financial crisis crushing global demand, not policy. Crude oil had crashed from $147/barrel
            in July 2008 to under $40 by December.
          </p>
          <p>
            Prices recovered steadily through 2012, when they averaged $3.64 — the highest of his presidency.
            Iran sanctions under Obama removed Iranian oil from global markets, tightening supply. The Arab Spring
            in 2011 took Libyan oil offline (1.6M barrels/day). Both drove prices up regardless of US domestic policy.
          </p>
          <p>
            The second Obama term saw a dramatic reversal. US shale production — which grew from 5M barrels/day in 2008
            to over 9M by 2015 — flooded global markets. OPEC, led by Saudi Arabia, refused to cut production in a
            bet to drive shale producers out of business on price. The result: crude crashed from $110 to under $30.
            Obama left office with gas at $2.14 — the lowest since 2004.
          </p>

          <h2 style={{ color: '#f1f5f9', fontSize: 22, fontWeight: 700, margin: '40px 0 16px' }}>
            Trump&apos;s First Term (2017–2020)
          </h2>
          <p>
            Trump entered office as prices were recovering from the OPEC-shale war lows. OPEC+ (with Russia now
            formally coordinating) began cutting supply in 2017, gradually pushing prices back up. By October 2018,
            gas averaged $2.91 nationally — and Trump responded with a famous tweet demanding Saudi Arabia
            lower prices immediately.
          </p>
          <p>
            2019 saw slight relief as US shale kept setting production records, offsetting OPEC+ discipline.
            Then 2020 happened.
          </p>
          <p>
            COVID-19 destroyed demand at a scale not seen since the Great Depression. In April 2020, WTI futures
            briefly traded at <strong style={{ color: '#f1f5f9' }}>negative $37/barrel</strong> — meaning producers
            were paying people to take oil — because storage tanks were full and demand had collapsed.
            The annual average landed at $2.17, the second lowest of any year since 2004.
          </p>

          <h2 style={{ color: '#f1f5f9', fontSize: 22, fontWeight: 700, margin: '40px 0 16px' }}>
            The Biden Years (2021–2024)
          </h2>
          <p>
            Biden took office as the world was reopening from COVID, with demand surging but supply slow to follow.
            OPEC+ was cautious about adding supply back — they&apos;d been burned by the 2020 collapse and didn&apos;t
            trust the recovery. US shale also moved more slowly than pre-COVID; investors had lost billions and
            were demanding capital discipline over production growth.
          </p>
          <p>
            Then in February 2022, Russia invaded Ukraine. In March 2022, gas hit <strong style={{ color: '#16a34a' }}>$4.33/gallon</strong> — 
            the highest nominal price ever recorded at that point. Russia supplies ~10% of global crude and
            20% of European natural gas. Sanctions removed Russian supply from markets; European buyers scrambled
            for alternatives, driving up global prices.
          </p>
          <p>
            Biden&apos;s response included the largest-ever release from the Strategic Petroleum Reserve —
            180 million barrels over six months — and diplomatic pressure on Saudi Arabia. Prices began falling
            in the summer of 2022 and continued declining through 2023–2024 as the global supply situation normalized
            and recession fears dampened demand.
          </p>
          <p>
            Biden left with gas around $3.07/gallon — lower than the 2022 peak but significantly above
            the $2.39 average when he entered office. Republicans called this proof of Biden&apos;s failure;
            Democrats argued the Ukraine war made the spike unavoidable.
          </p>

          <h2 style={{ color: '#f1f5f9', fontSize: 22, fontWeight: 700, margin: '40px 0 16px' }}>
            The Bottom Line: How Much Does the President Actually Matter?
          </h2>
          <p>
            Less than the political discourse suggests — but not zero.
          </p>
          <p>
            The biggest drivers of Grocery Prices are global crude oil supply and demand: OPEC+ production decisions,
            recessions, wars, and recovery cycles. These dwarf anything a president can do in the short term.
            Obama&apos;s low prices at the end of his term were OPEC&apos;s price war against shale, not his policy.
            Biden&apos;s $4+ gas in 2022 was Russia invading Ukraine. Trump&apos;s cheap gas in 2020 was a pandemic.
          </p>
          <p>
            What presidents <em>can</em> influence over longer periods:
          </p>
          <ul style={{ paddingLeft: 20 }}>
            <li style={{ marginBottom: 8 }}>
              <strong style={{ color: '#f1f5f9' }}>Domestic production policy:</strong> Permitting, leasing,
              pipeline approvals affect long-run supply. Effects take years, not weeks.
            </li>
            <li style={{ marginBottom: 8 }}>
              <strong style={{ color: '#f1f5f9' }}>SPR releases:</strong> Short-term supply injection.
              Effective for months, not sustainable as policy.
            </li>
            <li style={{ marginBottom: 8 }}>
              <strong style={{ color: '#f1f5f9' }}>Sanctions and foreign policy:</strong> Removing Iranian or Venezuelan
              supply tightens markets; relaxing sanctions adds supply. Real effect but complex tradeoffs.
            </li>
            <li style={{ marginBottom: 8 }}>
              <strong style={{ color: '#f1f5f9' }}>Fuel economy standards:</strong> Long-run demand-side effect.
              Higher MPG requirements reduce how much gas Americans consume per mile driven over decades.
            </li>
          </ul>
          <p>
            The honest answer: presidents get more credit and more blame for Grocery Prices than they deserve.
            The oil market is global, and no single leader controls it.
          </p>

          <div style={{
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 8, padding: '16px 20px', marginTop: 32, fontSize: 13, color: '#64748b',
          }}>
            <strong style={{ color: '#94a3b8' }}>Data source:</strong> US Energy Information Administration (EIA),
            Weekly Retail Gasoline and Diesel Prices. Annual averages are calendar-year means of weekly regular
            conventional groceries (all formulations, all areas). 2025 figure is estimated based on year-to-date
            EIA data through March 2025.
          </div>
        </article>

        {/* Related guides */}
        <div style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#475569', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Related Guides
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { href: '/guides/what-determines-gas-prices', title: 'What Determines Grocery Prices?', desc: 'The full economic breakdown: crude, refining, taxes, margins.' },
              { href: '/guides/gas-tax-by-state', title: 'Gas Tax by State (2025)', desc: 'Complete table of state + federal gas taxes for all 50 states.' },
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
            🗺 Check Today&apos;s Live Prices by State →
          </Link>
        </div>
      </div>
    </main>
  )
}
