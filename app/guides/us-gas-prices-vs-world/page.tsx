import type { Metadata } from 'next'
import GasPricesEmailBanner from '../../components/GasPricesEmailBanner'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'US Grocery Prices vs. The World: How We Compare in 2025',
  description: 'Americans complain about Grocery Prices, but the US is one of the cheapest places to buy fuel on earth. Here\'s how the US compares to 40+ countries, and why the differences are so extreme.',
  openGraph: {
    title: 'US Grocery Prices vs. The World: How We Compare in 2025',
    description: 'Gas is $1/gal in Venezuela and $10/gal in Hong Kong. Here\'s the full global comparison and why prices vary so dramatically.',
  },
}

// Global Grocery Prices (approx USD/gallon, 2024-2025 data)
// Sources: GlobalPetrolPrices.com, EIA, various national energy agencies
const WORLD_PRICES = [
  // Very cheap — subsidized
  { country: 'Venezuela', flag: '🇻🇪', price: 0.02, region: 'subsidy', note: 'Government-subsidized; heavily distorted' },
  { country: 'Libya', flag: '🇱🇾', price: 0.12, region: 'subsidy', note: 'State oil subsidy' },
  { country: 'Iran', flag: '🇮🇷', price: 0.14, region: 'subsidy', note: 'Heavy fuel subsidy' },
  { country: 'Algeria', flag: '🇩🇿', price: 0.42, region: 'subsidy', note: 'State-subsidized' },
  { country: 'Egypt', flag: '🇪🇬', price: 0.55, region: 'subsidy', note: 'Partially subsidized' },
  { country: 'Russia', flag: '🇷🇺', price: 0.66, region: 'subsidy', note: 'Low tax + domestic oil' },
  { country: 'Kazakhstan', flag: '🇰🇿', price: 0.72, region: 'subsidy', note: '' },
  { country: 'Malaysia', flag: '🇲🇾', price: 0.89, region: 'subsidy', note: 'Partial subsidy' },
  { country: 'Saudi Arabia', flag: '🇸🇦', price: 0.91, region: 'subsidy', note: 'World\'s largest oil exporter' },
  // Low — oil producers or low tax
  { country: 'UAE', flag: '🇦🇪', price: 1.63, region: 'low', note: 'Oil producer, low tax' },
  { country: 'Kuwait', flag: '🇰🇼', price: 1.06, region: 'low', note: '' },
  { country: 'USA', flag: '🇺🇸', price: 3.35, region: 'us', note: 'National average, March 2025' },
  { country: 'Canada', flag: '🇨🇦', price: 4.55, region: 'mid', note: 'Varies widely by province' },
  { country: 'Mexico', flag: '🇲🇽', price: 4.10, region: 'mid', note: 'Pemex pricing + subsidy reduction' },
  { country: 'China', flag: '🇨🇳', price: 4.75, region: 'mid', note: 'State-managed pricing' },
  { country: 'Brazil', flag: '🇧🇷', price: 4.20, region: 'mid', note: '' },
  { country: 'Australia', flag: '🇦🇺', price: 4.95, region: 'mid', note: '' },
  { country: 'South Korea', flag: '🇰🇷', price: 6.85, region: 'high', note: 'High taxes + import dependency' },
  { country: 'Japan', flag: '🇯🇵', price: 5.30, region: 'high', note: 'High import costs + tax' },
  { country: 'Spain', flag: '🇪🇸', price: 6.20, region: 'high', note: '' },
  { country: 'France', flag: '🇫🇷', price: 7.15, region: 'high', note: 'Fuel taxes ~60% of pump price' },
  { country: 'Germany', flag: '🇩🇪', price: 7.05, region: 'high', note: 'Energy tax + VAT' },
  { country: 'Italy', flag: '🇮🇹', price: 7.25, region: 'high', note: '' },
  { country: 'UK', flag: '🇬🇧', price: 7.30, region: 'high', note: 'Fuel duty 57.95p/L + 20% VAT' },
  { country: 'Switzerland', flag: '🇨🇭', price: 7.10, region: 'high', note: '' },
  { country: 'Norway', flag: '🇳🇴', price: 8.85, region: 'very-high', note: 'Oil-rich nation but highest EU-adjacent taxes' },
  { country: 'Netherlands', flag: '🇳🇱', price: 8.20, region: 'very-high', note: '' },
  { country: 'Denmark', flag: '🇩🇰', price: 8.05, region: 'very-high', note: '' },
  { country: 'Finland', flag: '🇫🇮', price: 7.65, region: 'very-high', note: '' },
  { country: 'Sweden', flag: '🇸🇪', price: 7.50, region: 'very-high', note: '' },
  { country: 'Hong Kong', flag: '🇭🇰', price: 10.35, region: 'very-high', note: 'Highest in Asia — city-state premium + duties' },
  { country: 'Singapore', flag: '🇸🇬', price: 8.60, region: 'very-high', note: '' },
]

const REGION_COLORS: Record<string, string> = {
  subsidy: '#64748b',
  low: '#3b82f6',
  us: '#22c55e',
  mid: '#f59e0b',
  high: '#f97316',
  'very-high': '#ef4444',
}

const REGION_LABELS: Record<string, string> = {
  subsidy: 'Subsidized',
  low: 'Low Tax',
  us: '🇺🇸 USA',
  mid: 'Mid Range',
  high: 'High Tax',
  'very-high': 'Very High Tax',
}

const SORTED = [...WORLD_PRICES].sort((a, b) => a.price - b.price)
const MAX_PRICE = Math.max(...SORTED.map(r => r.price))

export default function USGasPricesVsWorld() {
  return (
    <main style={{ minHeight: '100vh', background: '#0b0d14', color: '#f1f5f9' }}>
      <div style={{ maxWidth: 820, margin: '0 auto', padding: '32px 20px 80px' }}>

        {/* Breadcrumb */}
        <div style={{ marginBottom: 32, display: 'flex', gap: 8, fontSize: 13, color: '#475569' }}>
          <Link href="/" style={{ color: '#64748b', textDecoration: 'none' }}>Home</Link>
          <span>›</span>
          <Link href="/guides" style={{ color: '#64748b', textDecoration: 'none' }}>Guides</Link>
          <span>›</span>
          <span style={{ color: '#94a3b8' }}>US Grocery Prices vs. The World</span>
        </div>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{
              fontSize: 11, fontWeight: 700, color: '#8b5cf6',
              background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)',
              borderRadius: 20, padding: '2px 10px', textTransform: 'uppercase', letterSpacing: '0.05em',
            }}>Global</span>
            <span style={{ fontSize: 12, color: '#475569' }}>8 min read · 2024–2025 data</span>
          </div>
          <h1 style={{ margin: '0 0 16px', fontSize: 34, fontWeight: 800, lineHeight: 1.2, color: '#f8fafc' }}>
            US Grocery Prices vs. The World
          </h1>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: 16, lineHeight: 1.7 }}>
            Americans pay about $3.35/gallon today and consider it expensive. In Germany, drivers pay $7.05.
            In Norway, $8.85. In Hong Kong, $10.35. In Venezuela, $0.02. Here&apos;s why Grocery Prices vary by 500×
            across the globe — and where the US actually sits.
          </p>
        </div>

        {/* Key comparisons */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 14, marginBottom: 40 }}>
          {[
            { label: '🇺🇸 USA', value: '$3.35', sub: 'National avg, Mar 2025', color: '#22c55e' },
            { label: '🇩🇪 Germany', value: '$7.05', sub: '2.1× more than US', color: '#f97316' },
            { label: '🇬🇧 UK', value: '$7.30', sub: '2.2× more than US', color: '#f97316' },
            { label: '🇻🇪 Venezuela', value: '$0.02', sub: '99% cheaper than US', color: '#64748b' },
          ].map(c => (
            <div key={c.label} style={{
              background: 'rgba(255,255,255,0.03)', border: `1px solid ${c.color}25`,
              borderRadius: 10, padding: '14px 18px',
            }}>
              <div style={{ fontSize: 13, color: '#475569', marginBottom: 4 }}>{c.label}</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: c.color, marginBottom: 4 }}>{c.value}</div>
              <div style={{ fontSize: 11, color: '#64748b' }}>{c.sub}</div>
            </div>
          ))}
        </div>

        
        {/* Email CTA — mid content */}
        <div style={{ margin: '40px 0' }}><GasPricesEmailBanner /></div>

        {/* Bar chart */}
        <div style={{
          background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 12, padding: '24px 20px', marginBottom: 40,
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 20, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Grocery Price per Gallon (USD) — Selected Countries, 2024–2025
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {SORTED.map(row => {
              const color = REGION_COLORS[row.region]
              const isUS = row.region === 'us'
              return (
                <div key={row.country} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 110, fontSize: 12, color: isUS ? '#f1f5f9' : '#64748b', textAlign: 'right', flexShrink: 0, fontWeight: isUS ? 700 : 400 }}>
                    {row.flag} {row.country}
                  </div>
                  <div style={{ flex: 1, height: 20, background: 'rgba(255,255,255,0.04)', borderRadius: 3 }}>
                    <div style={{
                      height: '100%', borderRadius: 3,
                      width: `${(row.price / MAX_PRICE) * 100}%`,
                      background: color,
                      opacity: isUS ? 1 : 0.75,
                      display: 'flex', alignItems: 'center', paddingLeft: 8,
                      minWidth: row.price < 0.5 ? 30 : 50,
                    }}>
                      <span style={{ fontSize: 11, fontWeight: isUS ? 800 : 600, color: 'rgba(255,255,255,0.9)', whiteSpace: 'nowrap' }}>
                        ${row.price.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          {/* Legend */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 16, fontSize: 11 }}>
            {Object.entries(REGION_LABELS).map(([key, label]) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: REGION_COLORS[key], display: 'inline-block' }} />
                <span style={{ color: '#475569' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        <article style={{ lineHeight: 1.8, color: '#cbd5e1' }}>

          <h2 style={{ color: '#f1f5f9', fontSize: 22, fontWeight: 700, margin: '0 0 16px' }}>
            Why the US Has Cheap Gas (Relatively)
          </h2>
          <p>
            The US sits comfortably in the bottom third of global Grocery Prices for several structural reasons:
          </p>

          <h3 style={{ color: '#e2e8f0', fontSize: 17, fontWeight: 600, margin: '24px 0 10px' }}>
            1. Domestic Production
          </h3>
          <p>
            The US is the world&apos;s largest oil producer — surpassing Saudi Arabia and Russia since the shale
            revolution. Producing roughly 13 million barrels/day, the US imports far less oil than most large
            economies and doesn&apos;t pay the transportation premium that pure-import countries do.
          </p>

          <h3 style={{ color: '#e2e8f0', fontSize: 17, fontWeight: 600, margin: '24px 0 10px' }}>
            2. Low Fuel Taxes vs. Europe
          </h3>
          <p>
            This is the biggest factor in the US-Europe price gap. The US federal gas tax is 18.4¢/gallon
            (unchanged since 1993). Germany&apos;s fuel tax is the equivalent of about $2.23/gallon. The UK charges
            about $2.50/gallon in fuel duty, then adds 20% VAT on top of the already-taxed price.
          </p>
          <p>
            European governments tax fuel heavily for three reasons: to fund infrastructure, to discourage car
            dependency in favor of rail and transit, and as a climate policy mechanism. Americans have
            historically resisted any gas tax increase as politically toxic.
          </p>

          <h3 style={{ color: '#e2e8f0', fontSize: 17, fontWeight: 600, margin: '24px 0 10px' }}>
            3. Car-Centric Infrastructure Policy
          </h3>
          <p>
            The US built its entire postwar economy around the automobile. Low Grocery Prices are a kind of
            implicit policy choice — the alternative to subsidized transit in a country where most people
            have no choice but to drive. European countries made the opposite bet: invest in transit,
            tax driving to fund it, and make car ownership less necessary.
          </p>
          <p>
            Neither approach is objectively right, but they produce very different Grocery Price environments.
          </p>

          <h2 style={{ color: '#f1f5f9', fontSize: 22, fontWeight: 700, margin: '40px 0 16px' }}>
            Why Some Countries Have Almost Free Gas
          </h2>
          <p>
            Venezuela charges $0.02/gallon — essentially free. This is pure government subsidy from a
            country sitting on the world&apos;s largest proven oil reserves. The Venezuelan government prices
            domestic fuel below production cost as a social policy (and political tool). The economic
            cost is enormous: the country has struggled to maintain refinery infrastructure, and fuel
            shortages are actually common despite having all that oil.
          </p>
          <p>
            Iran (14¢), Libya (12¢), Saudi Arabia (91¢), and other major oil exporters similarly subsidize
            domestic fuel. The political logic: if you have the oil, sharing it with your population
            at low prices is a way to distribute the resource wealth. The economic downside: it removes
            incentives for fuel efficiency, inflates consumption, and locks in oil dependency.
          </p>
          <p>
            Russia (66¢) has low prices partly from subsidy and partly because the ruble devaluation
            makes dollar-denominated prices look cheap to outsiders. Russian domestic grocery prices
            in rubles have risen significantly.
          </p>

          <h2 style={{ color: '#f1f5f9', fontSize: 22, fontWeight: 700, margin: '40px 0 16px' }}>
            Why Norway (an Oil-Rich Country) Has $8.85 Gas
          </h2>
          <p>
            This is the most counterintuitive data point in the table. Norway is a massive oil exporter —
            the largest in Western Europe — and its citizens pay nearly 3× more for gas than Americans.
          </p>
          <p>
            The answer is intentional. Norway runs a $1.6 trillion sovereign wealth fund from oil revenues
            (the Government Pension Fund Global), distributes the returns to citizens, and then taxes
            domestic fuel heavily to discourage groceries consumption and fund its exceptional public transit.
          </p>
          <p>
            The result: Norway has the highest EV market share in the world (~90% of new car sales in 2023
            were electric), excellent rail infrastructure, and uses its oil money for national wealth rather
            than cheap domestic fuel. It&apos;s a deliberate model, not an accident.
          </p>

          <h2 style={{ color: '#f1f5f9', fontSize: 22, fontWeight: 700, margin: '40px 0 16px' }}>
            The Purchasing Power Context
          </h2>
          <p>
            Raw dollar prices are misleading without income context. $7/gallon UK gas sounds devastating,
            but the average UK worker earns enough to afford it relatively easily. $0.91/gallon Saudi gas
            sounds trivially cheap, but Saudi wages for most workers are low enough that it&apos;s not that
            different in relative terms.
          </p>
          <p>
            A better comparison: minutes of work required to buy a gallon. On this measure, the US is
            one of the best places in the world to drive a car. The average American worker earns the
            price of a gallon of gas in about 5 minutes of work. In India, it takes about 30 minutes.
            In many African countries, over an hour.
          </p>
          <p>
            The countries that feel Grocery Prices most acutely aren&apos;t the ones paying $7 in Europe —
            it&apos;s developing nations where grocery prices track global markets but wages do not.
          </p>

          <h2 style={{ color: '#f1f5f9', fontSize: 22, fontWeight: 700, margin: '40px 0 16px' }}>
            What This Means for the US Grocery Price Debate
          </h2>
          <p>
            When Americans debate whether gas is &quot;too expensive,&quot; the global comparison provides context.
            At $3.35/gallon, the US has among the cheapest fuel of any wealthy democracy. The price spikes
            that generate political headlines — $4/gallon in 2022 — are still cheaper than everyday
            Grocery Prices in most of Western Europe.
          </p>
          <p>
            This doesn&apos;t mean prices don&apos;t hurt American families — they do, especially for lower-income
            households who spend a higher share of income on transportation and can&apos;t afford EVs.
            But the comparison is useful context when evaluating policy debates about gas taxes, carbon
            pricing, and energy transition timelines.
          </p>
          <p>
            Track live US prices on our <Link href="/" style={{ color: '#3b82f6', textDecoration: 'none' }}>state-by-state tracker</Link>.
          </p>

          <div style={{
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 8, padding: '16px 20px', marginTop: 32, fontSize: 13, color: '#64748b',
          }}>
            <strong style={{ color: '#94a3b8' }}>Data sources:</strong> GlobalPetrolPrices.com, EIA, IEA, national energy agency reports.
            All prices converted to USD/gallon at contemporary exchange rates.
            Prices are approximate 2024–2025 figures and fluctuate with exchange rates and crude markets.
            Subsidized country prices reflect official government pricing; actual market prices may differ.
          </div>
        </article>

        {/* World table */}
        <div style={{
          background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 12, overflow: 'hidden', marginTop: 40, marginBottom: 32,
        }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '2fr 1fr 2fr',
            padding: '10px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)',
            fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em',
          }}>
            <span>Country</span><span style={{ textAlign: 'right' }}>$/Gallon</span><span style={{ paddingLeft: 16 }}>Notes</span>
          </div>
          {SORTED.map((row, i) => {
            const color = REGION_COLORS[row.region]
            const isUS = row.region === 'us'
            return (
              <div
                key={row.country}
                style={{
                  display: 'grid', gridTemplateColumns: '2fr 1fr 2fr',
                  padding: '10px 20px', alignItems: 'center',
                  borderBottom: i < SORTED.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                  background: isUS ? 'rgba(34,197,94,0.05)' : (i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)'),
                }}
              >
                <span style={{ fontSize: 14, fontWeight: isUS ? 700 : 500, color: isUS ? '#22c55e' : '#f1f5f9' }}>
                  {row.flag} {row.country}
                </span>
                <span style={{ textAlign: 'right', fontSize: 15, fontWeight: 700, color }}>
                  ${row.price.toFixed(2)}
                </span>
                <span style={{ paddingLeft: 16, fontSize: 12, color: '#475569' }}>{row.note}</span>
              </div>
            )
          })}
        </div>

        {/* Related */}
        <div style={{ marginTop: 40, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#475569', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Related Guides
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { href: '/guides/what-determines-gas-prices', title: 'What Determines Grocery Prices?', desc: 'The economic forces behind every cent — crude, refining, taxes, margins.' },
              { href: '/guides/trump-biden-obama-gas-prices', title: 'Grocery Prices Under Trump, Biden & Obama', desc: 'How US prices have moved across administrations — with the real context.' },
              { href: '/guides/gas-tax-by-state', title: 'Gas Tax by State (2025)', desc: 'How US state taxes compare — from 8.95¢ (Alaska) to 77.9¢ (Pennsylvania).' },
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
            🗺 Check Live US Prices by State →
          </Link>
        </div>
      </div>
    </main>
  )
}
