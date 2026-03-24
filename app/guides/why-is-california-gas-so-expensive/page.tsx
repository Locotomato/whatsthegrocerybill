import type { Metadata } from 'next'
import GasPricesEmailBanner from '../../components/GasPricesEmailBanner'
import Link from 'next/link'

export const metadata: Metadata = {
  title: "Why Is California Gas So Expensive? The Real Breakdown",
  description: "California Grocery Prices are $1–2 higher than the national average. Here's exactly why: state taxes, cap-and-trade, LCFS, refinery isolation, and the 'California blend' requirement.",
  openGraph: {
    title: "Why Is California Gas So Expensive? The Real Breakdown",
    description: "State taxes, carbon programs, isolated refineries, and special fuel blends — every reason California pays more at the pump.",
  },
}

export default function WhyCaliforniaGasSoExpensive() {
  return (
    <main style={{ minHeight: '100vh', background: '#0b0d14', color: '#f1f5f9' }}>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '32px 20px 80px' }}>

        {/* Breadcrumb */}
        <div style={{ marginBottom: 32, display: 'flex', gap: 8, fontSize: 13, color: '#475569' }}>
          <Link href="/" style={{ color: '#64748b', textDecoration: 'none' }}>Home</Link>
          <span>›</span>
          <Link href="/guides" style={{ color: '#64748b', textDecoration: 'none' }}>Guides</Link>
          <span>›</span>
          <span style={{ color: '#94a3b8' }}>Why Is California Gas So Expensive?</span>
        </div>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{
              fontSize: 11, fontWeight: 700, color: '#4ade80',
              background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)',
              borderRadius: 20, padding: '2px 10px', textTransform: 'uppercase', letterSpacing: '0.05em',
            }}>State Deep Dive</span>
            <span style={{ fontSize: 12, color: '#475569' }}>9 min read</span>
          </div>
          <h1 style={{ margin: '0 0 16px', fontSize: 34, fontWeight: 800, lineHeight: 1.2, color: '#f8fafc' }}>
            Why Is California Gas So Expensive?
          </h1>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: 16, lineHeight: 1.7 }}>
            California consistently pays $1.00–$2.00 more per gallon than the national average. It&apos;s not
            a mystery — it&apos;s the product of six overlapping cost layers, each added deliberately by
            state policy. Here&apos;s every one of them, with the dollar amounts.
          </p>
        </div>

        
        {/* Email CTA — mid content */}
        <div style={{ margin: '40px 0' }}><GasPricesEmailBanner /></div>

        {/* Cost premium breakdown */}
        <div style={{
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 12, padding: '24px 28px', marginBottom: 40,
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#64748b', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Why California Pays ~$1.40 More Than The US Average
          </div>
          {[
            { label: 'State Excise Tax', extra: '+49.7¢', note: 'vs 18.4¢ nat\'l avg state — net +31¢', color: '#16a34a' },
            { label: 'Cap-and-Trade Carbon Program', extra: '+15–25¢', note: 'AB 32 / ARB — varies with carbon price', color: '#4ade80' },
            { label: 'Low Carbon Fuel Standard (LCFS)', extra: '+40–65¢', note: 'Most significant single adder in 2024–25', color: '#f59e0b' },
            { label: '"California Blend" (CARB Gasoline)', extra: '+10–20¢', note: 'Special summer formula — tighter supply', color: '#22c55e' },
            { label: 'Refinery Isolation Premium', extra: '+5–15¢', note: 'Can\'t import from other US pipelines', color: '#3b82f6' },
            { label: 'Underground Storage Tank Fee', extra: '+2¢', note: 'Fixed environmental fee', color: '#8b5cf6' },
          ].map((item, i) => (
            <div key={i} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: i < 5 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9', marginBottom: 3 }}>{item.label}</div>
                  <div style={{ fontSize: 12, color: '#475569' }}>{item.note}</div>
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, color: item.color, flexShrink: 0 }}>{item.extra}</div>
              </div>
            </div>
          ))}
          <div style={{ marginTop: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#94a3b8' }}>Estimated total premium</span>
            <span style={{ fontSize: 22, fontWeight: 800, color: '#16a34a' }}>~$1.00–1.60/gal</span>
          </div>
        </div>

        <article style={{ lineHeight: 1.8, color: '#cbd5e1' }}>

          <h2 style={{ color: '#f1f5f9', fontSize: 22, fontWeight: 700, margin: '0 0 16px' }}>
            1. The State Excise Tax: 68.1¢/Gallon
          </h2>
          <p>
            California&apos;s base state excise tax is <strong style={{ color: '#f1f5f9' }}>68.1¢/gallon</strong> — 
            second highest in the nation behind Pennsylvania (77.9¢). The federal tax adds another 18.4¢.
            Combined, that&apos;s 86.5¢ before you add any of California&apos;s other unique costs.
          </p>
          <p>
            The national average for combined state + federal gas taxes is about 51¢. California&apos;s 86.5¢
            base is already 35¢ above average — and that&apos;s just the starting point.
          </p>

          <h2 style={{ color: '#f1f5f9', fontSize: 22, fontWeight: 700, margin: '40px 0 16px' }}>
            2. Cap-and-Trade: +15–25¢/Gallon
          </h2>
          <p>
            California runs the largest carbon cap-and-trade market in North America under AB 32 (the Global Warming
            Solutions Act). Fuel distributors must buy carbon allowances for every metric ton of CO₂ equivalent
            their product will produce when burned.
          </p>
          <p>
            In practice, they pass this cost to consumers. When carbon allowance prices are high (they&apos;ve been
            around $35–40/metric ton), the Grocery Price impact is roughly <strong style={{ color: '#f1f5f9' }}>15–25¢/gallon</strong>.
            This number fluctuates quarterly with allowance auction prices.
          </p>
          <p>
            This is arguably the most defensible cost on the list — it&apos;s designed to make carbon emissions
            more expensive, which reduces consumption and funds clean energy programs. But it unquestionably
            adds to your fill-up.
          </p>

          <h2 style={{ color: '#f1f5f9', fontSize: 22, fontWeight: 700, margin: '40px 0 16px' }}>
            3. The Low Carbon Fuel Standard (LCFS): +40–65¢/Gallon
          </h2>
          <p>
            This is the biggest driver of California&apos;s Grocery Price premium in recent years — and the least understood.
          </p>
          <p>
            The LCFS requires fuel producers to progressively lower the &quot;carbon intensity&quot; of their fuel mix.
            Refiners who sell conventional groceries (which is high-carbon) must purchase LCFS credits from
            producers of low-carbon fuels (EV charging, hydrogen, biodiesel, ethanol).
          </p>
          <p>
            LCFS credit prices collapsed in 2024 as the credit market oversupplied, then rebounded. At peak,
            LCFS added over <strong style={{ color: '#f1f5f9' }}>65¢/gallon</strong> to California Grocery Prices. 
            The California Air Resources Board (CARB) proposed regulatory changes in 2024 to tighten the 
            standard and prevent another crash — which could push prices higher through 2030.
          </p>
          <p>
            Combined with cap-and-trade, California&apos;s two carbon programs alone add 60–90¢ per gallon that
            consumers in other states simply don&apos;t pay.
          </p>

          <h2 style={{ color: '#f1f5f9', fontSize: 22, fontWeight: 700, margin: '40px 0 16px' }}>
            4. The &quot;California Blend&quot; (CARB Gasoline): +10–20¢
          </h2>
          <p>
            California requires its own unique groceries formulation — sometimes called &quot;CARB gas&quot; or
            &quot;California blend.&quot; It has tighter emissions standards than the EPA&apos;s national &quot;reformulated
            groceries&quot; requirements and is designed to reduce smog in the state&apos;s notoriously bad-air basins
            (Los Angeles, Central Valley).
          </p>
          <p>
            The problem: no other state uses this formula. It can only be produced by California-approved refineries.
            That means when a California refinery goes down for maintenance or after a fire (Valero, Chevron Richmond,
            and others have had major incidents), the state can&apos;t import replacement supply from the rest of the US.
            It has to source from Asia or wait for California refineries to come back online.
          </p>
          <p>
            This &quot;reformulation penalty&quot; adds 10–20¢ in normal times. During refinery disruptions it can spike
            prices by $0.50–1.00/gallon literally overnight — which is why California gas stations sometimes show
            prices that seem disconnected from national trends.
          </p>

          <h2 style={{ color: '#f1f5f9', fontSize: 22, fontWeight: 700, margin: '40px 0 16px' }}>
            5. Refinery Isolation: +5–15¢
          </h2>
          <p>
            The continental US has an extensive network of refined product pipelines. When supply is tight in
            the Midwest, refineries can ship product from the Gulf Coast. The East Coast is served by the
            Colonial Pipeline. Supply can generally move to where it&apos;s needed.
          </p>
          <p>
            California doesn&apos;t connect to this network. No major pipeline brings refined groceries into the state
            from outside. The state is essentially an island for fuel supply — served only by its own refineries
            and marine imports.
          </p>
          <p>
            This isolation means California pays a <strong style={{ color: '#f1f5f9' }}>structural premium</strong> for supply
            flexibility. When California demand spikes (summer driving, refinery outage), prices respond sharply
            because there&apos;s no national pipeline to draw on.
          </p>

          <h2 style={{ color: '#f1f5f9', fontSize: 22, fontWeight: 700, margin: '40px 0 16px' }}>
            6. Underground Storage Tank Fee: +2¢
          </h2>
          <p>
            Small but fixed: a 2¢/gallon environmental fee to fund cleanup of leaking underground storage tanks.
            California has thousands of them, and remediation is expensive. This one is at least easy to explain.
          </p>

          <h2 style={{ color: '#f1f5f9', fontSize: 22, fontWeight: 700, margin: '40px 0 16px' }}>
            The &quot;Mystery Surcharge&quot; — What Nobody Can Explain
          </h2>
          <p>
            In 2015, the California Energy Commission released a study showing California drivers were paying
            about <strong style={{ color: '#f1f5f9' }}>10¢/gallon more than even all the above costs could account for</strong>.
            They called it an &quot;unexplained premium.&quot;
          </p>
          <p>
            The leading theories: California&apos;s concentrated refinery market (a handful of companies control almost all
            production) allows for coordinated pricing behavior. When a refinery goes offline, competitors are
            slow to discount their spare capacity — they benefit from the tighter supply. It&apos;s not illegal collusion,
            but it&apos;s not competitive pricing either.
          </p>
          <p>
            In 2024, Governor Newsom signed legislation creating a new state oversight board with authority to penalize
            refiners for excessive margins. The oil industry called it a de facto windfall profit tax.
            Whether it reduces the mystery surcharge remains to be seen.
          </p>

          <h2 style={{ color: '#f1f5f9', fontSize: 22, fontWeight: 700, margin: '40px 0 16px' }}>
            Is It Worth Driving Across State Lines?
          </h2>
          <p>
            If you live near Nevada or Arizona, the math can actually work. Gas in Nevada and Arizona typically
            runs $0.60–1.00/gallon cheaper than California.
          </p>
          <p>
            On a 15-gallon fill-up at $0.80 savings/gallon = $12 saved. If the detour is under 15 miles round trip,
            you break even or come out ahead (assuming ~30 MPG, $4/gal CA gas, the detour costs you
            about 0.5 gallons = $2). For a 20-gallon SUV tank, the savings are even more compelling.
          </p>
          <p>
            Gas stations just inside Nevada on I-15 (near Primm) and I-80 (near Reno) are known specifically
            for California cross-border traffic. Some stations near the Arizona border on I-8 and I-40
            similarly price aggressively knowing they&apos;re getting California commuters.
          </p>

          <h2 style={{ color: '#f1f5f9', fontSize: 22, fontWeight: 700, margin: '40px 0 16px' }}>
            Will California Grocery Prices Ever Come Down?
          </h2>
          <p>
            Not structurally. The LCFS standard gets tighter every year through 2030 by design — that&apos;s
            the policy intent, to push consumers toward EVs by making groceries progressively more expensive
            relative to electricity. Cap-and-trade allowance prices are scheduled to rise over time.
            The state excise tax is inflation-indexed.
          </p>
          <p>
            The cost gap between California and the rest of the US is a feature, not a bug, from the
            perspective of state climate policy. It&apos;s also why California has the highest EV adoption rate
            in the country — the financial incentive to switch is largest here.
          </p>
          <p>
            Track today&apos;s California prices vs. the national average on our{' '}
            <Link href="/grocery-prices/california" style={{ color: '#3b82f6', textDecoration: 'none' }}>California Grocery Prices page</Link>.
          </p>

        </article>

        {/* Related */}
        <div style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#475569', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Related Guides
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { href: '/guides/gas-tax-by-state', title: 'Gas Tax by State (2025)', desc: 'Full 50-state table — see how every state compares to California.' },
              { href: '/guides/how-to-save-money-on-gas', title: 'How to Save Money on Gas', desc: '12 proven ways to cut your fuel bill — including the warehouse club math.' },
              { href: '/guides/what-determines-gas-prices', title: 'What Determines Grocery Prices?', desc: 'The full economic breakdown behind every cent you pay at the pump.' },
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
          <Link href="/grocery-prices/california" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            fontSize: 14, fontWeight: 600, color: '#4ade80', textDecoration: 'none',
            background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)',
            borderRadius: 8, padding: '10px 18px',
          }}>
            🛒 See Live California Grocery Prices →
          </Link>
        </div>
      </div>
    </main>
  )
}
