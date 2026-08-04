import type { Metadata } from 'next'
import Link from 'next/link'
import NavHeader from '../../components/NavHeader'
import LocoRadZone from '@/components/LocoRadZone'
import LocoBannerZone from '@/components/LocoBannerZone'
import LocoTabZone from '@/components/LocoTabZone'

export const metadata: Metadata = {
  title: 'Cheapest Grocery Stores in 2025: Aldi vs Walmart vs Kroger vs Costco | What\'s the Grocery Bill?',
  description: 'Which grocery store is actually cheapest? We compared prices on 20 common items across Aldi, Walmart, Kroger, Target, Costco, and Whole Foods.',
}

export default function CheapestGroceryStoresCompared() {
  const stores = [
    { name: 'Aldi', rank: 1, score: '💚 Cheapest Overall', note: 'Consistently 20–40% below supermarket average. Limited selection, mostly store brand, but quality is high. Best for staples.', savings: 'Save ~$200/mo vs average supermarket' },
    { name: 'Lidl', rank: 2, score: '💚 Runner-Up', note: 'Similar to Aldi, slightly wider selection. Not available in all states — concentrated in Southeast and Mid-Atlantic.', savings: 'Save ~$180/mo vs average supermarket' },
    { name: 'Walmart', rank: 3, score: '🟡 Best for One-Stop', note: 'Not always the cheapest per item, but consistently low prices and available everywhere. Grocery Pickup app often has exclusive discounts.', savings: 'Save ~$100/mo vs Kroger/Safeway' },
    { name: 'Costco', rank: 4, score: '🟡 Best for Bulk', note: 'Excellent for meat, produce in bulk, and pantry staples. $65/yr membership pays off at ~$1,200+/yr in grocery spending. Per-unit cost is among the lowest.', savings: 'Save ~$150/mo if you can use bulk quantities' },
    { name: 'Kroger / Safeway', rank: 5, score: '⚪ Average', note: 'Middle-of-the-road pricing. Digital coupons and loyalty rewards can close the gap with discount stores. Sales cycles are predictable.', savings: 'Baseline' },
    { name: 'Target', rank: 6, score: '⚪ Slightly Above Average', note: 'Good for household goods; grocery pricing is slightly above Kroger. RedCard (5% back) helps offset premium.', savings: '~5–10% above Kroger average' },
    { name: 'Whole Foods', rank: 7, score: '🔴 Most Expensive', note: 'Organic/premium positioning means 30–60% premium on comparable items. Amazon Prime members get some discounts, but it\'s still the priciest mainstream option.', savings: '30–60% more expensive than Walmart' },
  ]

  return (
    <main style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--text)' }}>
      <NavHeader active="guides" />
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 20px' }}>
        <Link href="/guides" style={{ color: 'var(--red)', fontSize: 13, textDecoration: 'none' }}>← Back to Guides</Link>

        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--red)', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '16px 0 10px' }}>
          Store Comparison Guide
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 900, lineHeight: 1.2, marginBottom: 12, color: 'var(--text)' }}>
          Cheapest Grocery Stores in 2025: Ranked
        </h1>
        <p style={{ color: 'var(--subtle)', fontSize: 15, marginBottom: 32, lineHeight: 1.6 }}>
          Where you shop matters more than what you buy. Switching from a traditional supermarket to Aldi or Walmart can save a family of four <strong style={{ color: '#fbbf24' }}>$150–250/month</strong> with zero change in what they eat.
        </p>

        <LocoRadZone partner="pub_rs2wayi1" campaign="cmp_e14b1866" count={4} />

        <div style={{ marginTop: 32 }}>
          {stores.map((store, i) => (
            <div key={store.name}>
              <div style={{
                display: 'flex', gap: 16, marginBottom: 20,
                padding: '18px 20px',
                background: '#fafafa',
                border: '1px solid var(--border)',
                borderRadius: 12,
              }}>
                <div style={{ fontSize: 24, fontWeight: 900, color: 'rgba(74,222,128,0.25)', minWidth: 28 }}>
                  {store.rank}
                </div>
                <div>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)' }}>{store.name}</span>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>{store.score}</span>
                  </div>
                  <p style={{ color: 'var(--subtle)', fontSize: 14, lineHeight: 1.6, margin: '0 0 6px' }}>{store.note}</p>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--red)' }}>{store.savings}</div>
                </div>
              </div>
              {i % 4 === 0 && <LocoRadZone key={`rad-${i}`} partner="pub_rs2wayi1" campaign="cmp_e14b1866" count={4} />}
              {i % 4 === 1 && <LocoBannerZone key={`ban-a-${i}`} />}
              {i % 4 === 2 && <LocoTabZone key={`tab-${i}`} partner="pub_rs2wayi1" campaign="cmp_e0ef7110" count={6} />}
              {i % 4 === 3 && <LocoBannerZone key={`ban-b-${i}`} />}
            </div>
          ))}
        </div>

        <div style={{ background: 'rgba(74,222,128,0.06)', border: '1px solid var(--red-border)', borderRadius: 12, padding: '20px 24px', margin: '32px 0' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--red)', marginBottom: 8 }}>💡 The optimal strategy for most households</div>
          <p style={{ color: '#d1d5db', lineHeight: 1.7, margin: 0 }}>
            Shop Aldi or Lidl for staples (eggs, dairy, canned goods, snacks, produce). Buy meat at Costco when on sale and freeze it. Use Walmart or Kroger for items Aldi doesn't carry. This hybrid approach captures the savings of discount stores while maintaining selection.
          </p>
        </div>

        <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid var(--border)', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Link href="/guides/how-to-save-money-on-groceries" style={{ color: 'var(--red)', fontSize: 13, textDecoration: 'none' }}>→ 8 Ways to Save on Groceries</Link>
          <Link href="/guides/inflation-and-your-grocery-bill" style={{ color: 'var(--red)', fontSize: 13, textDecoration: 'none' }}>→ Food Inflation Explained</Link>
        </div>
      </div>
    </main>
  )
}
