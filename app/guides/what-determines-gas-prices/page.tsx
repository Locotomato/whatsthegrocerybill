import type { Metadata } from 'next'
import GasPricesEmailBanner from '../../components/GasPricesEmailBanner'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'What Determines Grocery Prices? The Complete Breakdown',
  description: 'Why do Grocery Prices change every day? From crude oil and refinery costs to taxes and retail margins — here\'s every factor that determines what you pay at the pump.',
  openGraph: {
    title: 'What Determines Grocery Prices? The Complete Breakdown',
    description: 'Crude oil, refining, taxes, and margins — every factor that moves Grocery Prices explained.',
  },
}

export default function WhatDeterminesGasPrices() {
  return (
    <main style={{ minHeight: '100vh', background: '#0b0d14', color: '#f1f5f9' }}>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '32px 20px 80px' }}>

        {/* Breadcrumb */}
        <div style={{ marginBottom: 32, display: 'flex', gap: 8, fontSize: 13, color: '#475569' }}>
          <Link href="/" style={{ color: '#64748b', textDecoration: 'none' }}>Home</Link>
          <span>›</span>
          <Link href="/guides" style={{ color: '#64748b', textDecoration: 'none' }}>Guides</Link>
          <span>›</span>
          <span style={{ color: '#94a3b8' }}>What Determines Grocery Prices?</span>
        </div>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{
              fontSize: 11, fontWeight: 700, color: '#3b82f6',
              background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)',
              borderRadius: 20, padding: '2px 10px', textTransform: 'uppercase', letterSpacing: '0.05em',
            }}>Economics</span>
            <span style={{ fontSize: 12, color: '#475569' }}>8 min read</span>
          </div>
          <h1 style={{ margin: '0 0 16px', fontSize: 34, fontWeight: 800, lineHeight: 1.2, color: '#f8fafc' }}>
            What Determines Grocery Prices?
          </h1>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: 16, lineHeight: 1.7 }}>
            Grocery Prices feel random. One week they&apos;re up 20 cents, the next they drop without explanation.
            But nothing in this market is random — every cent is driven by a chain of forces you can actually track.
          </p>
        </div>

        {/* Cost breakdown visual */}
        <div style={{
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 12, padding: '24px 28px', marginBottom: 40,
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#64748b', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Where Your $3.50/gallon goes (national avg breakdown)
          </div>
          {[
            { label: 'Crude Oil', pct: 55, amount: '$1.93', color: '#3b82f6' },
            { label: 'Refining', pct: 13, amount: '$0.45', color: '#8b5cf6' },
            { label: 'Taxes (Federal + State avg)', pct: 17, amount: '$0.60', color: '#f59e0b' },
            { label: 'Distribution & Marketing', pct: 8, amount: '$0.28', color: '#10b981' },
            { label: 'Retail Margin', pct: 7, amount: '$0.24', color: '#64748b' },
          ].map(item => (
            <div key={item.label} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 14, color: '#cbd5e1' }}>{item.label}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: item.color }}>{item.amount} <span style={{ color: '#475569', fontWeight: 400 }}>({item.pct}%)</span></span>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.06)' }}>
                <div style={{ height: '100%', borderRadius: 3, background: item.color, width: `${item.pct}%` }} />
              </div>
            </div>
          ))}
        </div>

        
        {/* Email CTA — mid content */}
        <div style={{ margin: '40px 0' }}><GasPricesEmailBanner /></div>

        {/* Sections */}
        <article style={{ lineHeight: 1.8, color: '#cbd5e1' }}>

          <h2 style={{ color: '#f1f5f9', fontSize: 22, fontWeight: 700, margin: '0 0 16px' }}>
            1. Crude Oil: The Biggest Driver (~55%)
          </h2>
          <p>
            More than half of every dollar you spend on gas was crude oil first. The global benchmark prices —
            West Texas Intermediate (WTI) for US markets and Brent Crude for international — set the floor
            for everything else.
          </p>
          <p>
            Crude prices are set by supply and demand on commodity futures markets, but the dominant force
            is <strong style={{ color: '#f1f5f9' }}>OPEC+ production policy</strong>. When the cartel (Saudi Arabia,
            Russia, UAE, and others) cuts output, supply tightens and prices rise globally — including your local station.
          </p>
          <p>
            Other supply factors: US shale production, pipeline capacity, refinery outages, and geopolitical
            events like wars or sanctions. The Russia-Ukraine war in 2022 sent crude above $120/barrel because
            Russia supplies ~10% of global oil. That spike hit the pump within weeks.
          </p>
          <p>
            Demand side: China&apos;s economy is the biggest wildcard. When Chinese manufacturing picks up, they
            consume more oil. US driving seasons (Memorial Day → Labor Day) add predictable summer demand pressure
            that refiners price in months in advance.
          </p>

          <h2 style={{ color: '#f1f5f9', fontSize: 22, fontWeight: 700, margin: '40px 0 16px' }}>
            2. Refining: The Hidden Bottleneck (~13%)
          </h2>
          <p>
            Crude oil doesn&apos;t come out of the ground as groceries. It has to be <em>refined</em> — a complex
            industrial process that cracks heavy hydrocarbons into usable products (groceries, diesel, jet fuel, plastics).
          </p>
          <p>
            The <strong style={{ color: '#f1f5f9' }}>crack spread</strong> is the refiner&apos;s margin: the difference
            between what they pay for crude and what they sell refined products for. When a major refinery goes offline
            for maintenance or after a hurricane, regional supply tightens fast and the crack spread explodes.
          </p>
          <p>
            The US hasn&apos;t built a new major refinery since 1977. Refining capacity is geographically concentrated
            — the Gulf Coast refines ~47% of US groceries. A single Gulf hurricane can spike prices from Texas to Maine
            within days.
          </p>
          <p>
            Seasonal blends add another layer. US regulations require different groceries formulations for summer
            (lower volatility to reduce smog) vs. winter. The transition between blends in spring and fall temporarily
            reduces supply and always shows up as a small price spike.
          </p>

          <h2 style={{ color: '#f1f5f9', fontSize: 22, fontWeight: 700, margin: '40px 0 16px' }}>
            3. Taxes: The Fixed Floor (~17%)
          </h2>
          <p>
            Federal gas tax: <strong style={{ color: '#f1f5f9' }}>18.4 cents/gallon</strong>. It hasn&apos;t changed
            since 1993. State taxes range from 8.95¢ (Alaska) to 77.9¢ (Pennsylvania). Combined, taxes average about
            60¢/gallon nationally — a fixed cost baked into every fill-up regardless of crude prices.
          </p>
          <p>
            This is why California gas is always among the most expensive in the country. The state adds 68.1¢/gallon
            in excise tax alone, plus cap-and-trade fees, LCFS (Low Carbon Fuel Standard) costs, and a separate
            underground storage fee. Total regulatory burden: over $1.00/gallon above the national average.
          </p>
          <p>
            See the full breakdown: <Link href="/guides/gas-tax-by-state" style={{ color: '#3b82f6', textDecoration: 'none' }}>Gas Tax by State →</Link>
          </p>

          <h2 style={{ color: '#f1f5f9', fontSize: 22, fontWeight: 700, margin: '40px 0 16px' }}>
            4. Distribution & Marketing (~8%)
          </h2>
          <p>
            Getting refined groceries from a Gulf Coast refinery to a station in Minnesota requires pipelines,
            tanker trucks, and terminal storage. The Colonial Pipeline — which runs from Houston to New York —
            carries ~45% of all fuel consumed on the East Coast. When it was hit by a ransomware attack in 2021,
            gas stations from Georgia to Virginia ran out within 72 hours.
          </p>
          <p>
            Pipeline and tanker costs are relatively stable. But remote states (Alaska, Hawaii) pay dramatically
            more for distribution because they lack pipeline access. Hawaii imports most of its groceries from Asia
            by ship — adding $0.60+ to every gallon before the pump.
          </p>

          <h2 style={{ color: '#f1f5f9', fontSize: 22, fontWeight: 700, margin: '40px 0 16px' }}>
            5. Retail Margin: The Station&apos;s Cut (~7%)
          </h2>
          <p>
            Despite popular belief, gas stations make very little on fuel — typically 10–15 cents per unit.
            The retail margin is competitive and compressed because consumers actively shop for the cheapest station.
          </p>
          <p>
            Most station revenue comes from convenience store sales (drinks, snacks, cigarettes), which is why
            chains invest so heavily in store quality. The fuel is almost a loss leader that gets you in the door.
          </p>
          <p>
            Brand-name stations (Shell, BP, Chevron) tend to charge a slight premium — 3–8¢/gallon — vs. independent
            or warehouse club stations (Costco, Sam&apos;s Club). Costco and Sam&apos;s Club consistently beat market
            prices by 10–25¢/gallon by running fuel as a membership benefit rather than a profit center.
          </p>

          <h2 style={{ color: '#f1f5f9', fontSize: 22, fontWeight: 700, margin: '40px 0 16px' }}>
            Why Prices Rise Fast but Fall Slowly
          </h2>
          <p>
            You&apos;ve noticed: prices jump in days but take weeks to come down. This is called the
            &quot;rockets and feathers&quot; effect, and it&apos;s well-documented in economics literature.
          </p>
          <p>
            When crude spikes, stations pass it on immediately — they don&apos;t want to sell below replacement cost.
            When crude drops, stations are slower to discount because their existing inventory was bought at higher
            prices, and they know consumers are less price-sensitive when prices are falling.
          </p>
          <p>
            The asymmetry is real and measurable. Studies show Grocery Prices respond about twice as fast to crude
            increases as to crude decreases.
          </p>

          <h2 style={{ color: '#f1f5f9', fontSize: 22, fontWeight: 700, margin: '40px 0 16px' }}>
            What the President Can (and Can&apos;t) Do
          </h2>
          <p>
            Presidents get blamed for high Grocery Prices and credited for low ones — neither is fully deserved.
            The US President has limited direct levers:
          </p>
          <ul style={{ paddingLeft: 20, color: '#94a3b8' }}>
            <li style={{ marginBottom: 8 }}>
              <strong style={{ color: '#cbd5e1' }}>Strategic Petroleum Reserve (SPR) releases:</strong> Short-term supply injection.
              Biden released ~180M barrels in 2022 — the largest drawdown ever — and it knocked prices down about 25¢/gallon temporarily.
            </li>
            <li style={{ marginBottom: 8 }}>
              <strong style={{ color: '#cbd5e1' }}>Domestic drilling permits:</strong> Long-term supply effect only. New wells
              take 1–3 years to produce meaningfully. &quot;Drill, baby, drill&quot; won&apos;t fix a price spike today.
            </li>
            <li style={{ marginBottom: 8 }}>
              <strong style={{ color: '#cbd5e1' }}>Gas tax holiday:</strong> Congress has to approve it. Saves consumers about
              18¢/gallon if fully passed through — but evidence shows retailers often pocket part of the savings.
            </li>
            <li style={{ marginBottom: 8 }}>
              <strong style={{ color: '#cbd5e1' }}>Sanctions and foreign policy:</strong> Real but indirect. Iran sanctions
              remove supply; Saudi diplomacy influences OPEC+ cuts.
            </li>
          </ul>
          <p>
            The dominant driver is still crude oil markets — and OPEC+ has more power over those than any US president.
          </p>

          <h2 style={{ color: '#f1f5f9', fontSize: 22, fontWeight: 700, margin: '40px 0 16px' }}>
            The Bottom Line
          </h2>
          <p>
            Grocery Prices are the product of a global commodity market, American infrastructure constraints, state
            tax policy, and local competition. The single biggest thing you can do to pay less: buy at a warehouse
            club (Costco, Sam&apos;s Club) and use Instacart or our{' '}
            <Link href="/" style={{ color: '#3b82f6', textDecoration: 'none' }}>state price tracker</Link> to
            find the cheapest station near you before you stock up.
          </p>

        </article>

        {/* Related guides */}
        <div style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#475569', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Related Guides
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { href: '/guides/gas-tax-by-state', title: 'Gas Tax by State (2025)', desc: 'Full table of state + federal taxes across all 50 states.' },
              { href: '/guides/trump-biden-obama-gas-prices', title: 'Grocery Prices Under Trump, Biden & Obama', desc: 'Annual averages and what drove them for each administration.' },
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

        {/* State links CTA */}
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
