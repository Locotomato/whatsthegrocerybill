import LocoEmbed from '@/app/components/LocoEmbed'
import type { Metadata } from 'next'
import Link from 'next/link'
import NavHeader from '../../components/NavHeader'

export const metadata: Metadata = {
  title: 'Why Are Egg Prices So High in 2025? | What\'s the Grocery Bill?',
  description: 'Egg prices have hit record highs. Here\'s why — avian flu, supply chain issues, feed costs — and when prices might come back down.',
  openGraph: {
    title: 'Why Are Egg Prices So High in 2025?',
    description: 'Egg prices have hit record highs. Here\'s the full breakdown.',
  },
}

export default function WhyAreEggPricesSoHigh() {
  return (
    <main style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--text)' }}>
      <NavHeader active="guides" />
      <div style={{ maxWidth: 780, margin: '0 auto', padding: '40px 20px' }}>

        <div style={{ marginBottom: 16 }}>
          <Link href="/guides" style={{ color: 'var(--red)', fontSize: 13, textDecoration: 'none' }}>
            ← Back to Guides
          </Link>
        </div>

        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--red)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
          Grocery Price Guide
        </div>

        <h1 style={{ fontSize: 32, fontWeight: 900, lineHeight: 1.2, marginBottom: 12, color: 'var(--text)' }}>
          Why Are Egg Prices So High Right Now?
        </h1>

        <p style={{ color: 'var(--subtle)', fontSize: 15, marginBottom: 32, lineHeight: 1.6 }}>
          The average dozen eggs now costs <strong style={{ color: '#fbbf24' }}>over $4.80</strong> — nearly triple what they cost in 2021. Here's the full breakdown of what's driving record egg prices, which states are hit hardest, and whether relief is coming.
        </p>

        <LocoEmbed />

        <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', marginTop: 36, marginBottom: 12 }}>
          🦠 The Avian Flu Epidemic
        </h2>
        <p style={{ color: '#d1d5db', lineHeight: 1.7, marginBottom: 16 }}>
          The biggest driver is the ongoing H5N1 avian flu (bird flu) outbreak — the worst in US history. Since 2022, over <strong>100 million egg-laying hens</strong> have been culled to prevent spread. That's roughly one in every four commercial egg-laying chickens in America.
        </p>
        <p style={{ color: '#d1d5db', lineHeight: 1.7, marginBottom: 16 }}>
          When a flock tests positive, the entire farm is depopulated — sometimes tens of millions of birds at once. Restocking takes 6–12 months minimum. Supply has never fully recovered between outbreaks.
        </p>

        <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', marginTop: 36, marginBottom: 12 }}>
          📈 Feed and Energy Costs
        </h2>
        <p style={{ color: '#d1d5db', lineHeight: 1.7, marginBottom: 16 }}>
          Even farms unaffected by avian flu are paying significantly more to operate. Corn and soybean meal — the primary components of chicken feed — surged after Russia's invasion of Ukraine disrupted global grain supplies. Feed costs represent roughly <strong>60–70% of the total cost</strong> of producing an egg.
        </p>
        <p style={{ color: '#d1d5db', lineHeight: 1.7, marginBottom: 16 }}>
          Energy costs for climate-controlled laying facilities have also risen. These input costs don't disappear even when egg prices briefly dip.
        </p>

        <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', marginTop: 36, marginBottom: 12 }}>
          🗺 Which States Are Hit Hardest?
        </h2>
        <p style={{ color: '#d1d5db', lineHeight: 1.7, marginBottom: 16 }}>
          Egg prices vary significantly by state. Urban coastal states — California, New York, and Massachusetts — consistently see the highest prices due to additional regulations (California's Prop 12 cage-free mandate adds 30–40% to production costs alone).
        </p>
        <p style={{ color: '#d1d5db', lineHeight: 1.7, marginBottom: 16 }}>
          Midwest states close to major egg-producing farms — Iowa, Ohio, Indiana — tend to see the lowest retail prices. Iowa alone produces about <strong>1 in 7 eggs</strong> consumed in the US.
        </p>

        {/* Price callout box */}
        <div style={{
          background: 'rgba(251,191,36,0.08)',
          border: '1px solid rgba(251,191,36,0.2)',
          borderRadius: 12,
          padding: '20px 24px',
          marginBottom: 28,
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
            Current Average Prices (2025)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { label: 'National Average', price: '$4.82/doz' },
              { label: 'California (highest)', price: '$6.20+/doz' },
              { label: 'Iowa (lowest)', price: '$3.40/doz' },
              { label: 'Pre-2022 average', price: '$1.80/doz' },
            ].map(item => (
              <div key={item.label}>
                <div style={{ fontSize: 12, color: 'var(--subtle)' }}>{item.label}</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#fbbf24' }}>{item.price}</div>
              </div>
            ))}
          </div>
        </div>

        <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', marginTop: 36, marginBottom: 12 }}>
          🛒 How to Save on Eggs Right Now
        </h2>
        <ul style={{ color: '#d1d5db', lineHeight: 1.8, paddingLeft: 20, marginBottom: 24 }}>
          <li><strong style={{ color: 'var(--red)' }}>Buy store brand</strong> — name-brand eggs and store-brand eggs come from the same farms in many cases. Store brand saves $0.50–$1.50/dozen on average.</li>
          <li><strong style={{ color: 'var(--red)' }}>Check Aldi and Lidl</strong> — discount grocery chains consistently price eggs 20–40% below traditional supermarkets.</li>
          <li><strong style={{ color: 'var(--red)' }}>Costco and Sam's Club</strong> — bulk buying doesn't always save money on eggs (they spoil), but larger pack sizes often have lower per-egg costs.</li>
          <li><strong style={{ color: 'var(--red)' }}>Substitute when cooking</strong> — for baking, applesauce, mashed banana, or commercial egg replacers work in many recipes.</li>
          <li><strong style={{ color: 'var(--red)' }}>Local farms and co-ops</strong> — in many areas, buying directly from small local farms is now cheaper than supermarket prices.</li>
        </ul>

        <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', marginTop: 36, marginBottom: 12 }}>
          📅 When Will Egg Prices Come Down?
        </h2>
        <p style={{ color: '#d1d5db', lineHeight: 1.7, marginBottom: 16 }}>
          Analysts are cautiously optimistic that prices will moderate through 2025 — but not return to pre-2022 levels. Key factors:
        </p>
        <ul style={{ color: '#d1d5db', lineHeight: 1.8, paddingLeft: 20, marginBottom: 24 }}>
          <li>Avian flu outbreaks remain unpredictable — a major new outbreak could spike prices overnight</li>
          <li>Cage-free transition requirements in multiple states will keep a structural floor under prices</li>
          <li>New farm capacity takes 12–18 months to come online after culling events</li>
          <li>Feed cost relief depends on global grain markets</li>
        </ul>
        <p style={{ color: '#d1d5db', lineHeight: 1.7, marginBottom: 32 }}>
          Most forecasts put the national average at <strong style={{ color: 'var(--red)' }}>$3.50–$4.00/dozen</strong> by end of 2025 if no major new outbreak occurs. That's still double the pre-pandemic norm.
        </p>

        {/* FAQ */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 32, marginTop: 16 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', marginBottom: 20 }}>Frequently Asked Questions</h2>
          {[
            { q: 'Why did egg prices go up so fast?', a: 'The combination of historic avian flu outbreaks (100M+ hens culled), rising feed costs from the Ukraine war, and cage-free mandates in large states created a perfect storm that drove prices to record highs.' },
            { q: 'Is it avian flu or inflation causing high egg prices?', a: 'Both, but avian flu is the primary driver. Inflation contributes through feed, energy, and labor costs — but the supply shock from culling is what caused the extreme price spikes.' },
            { q: 'Are egg prices different across the US?', a: 'Yes, significantly. California typically pays $1–2 more per dozen than Midwest states due to Proposition 12 cage-free requirements and higher operating costs.' },
          ].map((faq, i) => (
            <div key={i} style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Q: {faq.q}</div>
              <div style={{ fontSize: 14, color: 'var(--subtle)', lineHeight: 1.7 }}>{faq.a}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid var(--border)', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Link href="/guides/how-to-save-money-on-groceries" style={{ color: 'var(--red)', fontSize: 13, textDecoration: 'none' }}>
            → How to Save Money on Groceries
          </Link>
          <Link href="/guides/inflation-and-your-grocery-bill" style={{ color: 'var(--red)', fontSize: 13, textDecoration: 'none' }}>
            → Inflation and Your Grocery Bill
          </Link>
          <Link href="/grocery-prices" style={{ color: 'var(--red)', fontSize: 13, textDecoration: 'none' }}>
            → Grocery Prices by State
          </Link>
        </div>

      </div>
    </main>
  )
}
