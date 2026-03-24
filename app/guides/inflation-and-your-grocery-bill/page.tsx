import type { Metadata } from 'next'
import Link from 'next/link'
import GroceryEmailBanner from '../../components/GroceryEmailBanner'

export const metadata: Metadata = {
  title: 'How Inflation Is Hitting Your Grocery Bill in 2025 | What\'s the Grocery Bill?',
  description: 'Food inflation has outpaced overall CPI for three years running. Here\'s which items are up the most, why, and what to expect in 2025.',
}

export default function InflationAndYourGroceryBill() {
  const items = [
    { name: 'Eggs', change: '+146%', period: 'since 2021', color: '#f87171' },
    { name: 'Butter', change: '+45%', period: 'since 2021', color: '#f87171' },
    { name: 'Ground Beef', change: '+38%', period: 'since 2021', color: '#fb923c' },
    { name: 'Bread', change: '+29%', period: 'since 2021', color: '#fb923c' },
    { name: 'Chicken', change: '+22%', period: 'since 2021', color: '#fbbf24' },
    { name: 'Milk', change: '+18%', period: 'since 2021', color: '#fbbf24' },
    { name: 'Canned goods', change: '+21%', period: 'since 2021', color: '#fbbf24' },
    { name: 'Fresh produce', change: '+14%', period: 'since 2021', color: '#a3e635' },
  ]

  return (
    <main style={{ background: '#0c1409', minHeight: '100vh', color: 'white' }}>
      <div style={{ maxWidth: 780, margin: '0 auto', padding: '40px 20px' }}>
        <Link href="/guides" style={{ color: '#4ade80', fontSize: 13, textDecoration: 'none' }}>← Back to Guides</Link>

        <div style={{ fontSize: 12, fontWeight: 600, color: '#4ade80', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '16px 0 10px' }}>
          Food Inflation Guide
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 900, lineHeight: 1.2, marginBottom: 12, color: '#f0fdf4' }}>
          How Inflation Is Hitting Your Grocery Bill
        </h1>
        <p style={{ color: '#9ca3af', fontSize: 15, marginBottom: 32, lineHeight: 1.6 }}>
          Food prices have risen faster than overall inflation for three consecutive years. The average American family is spending <strong style={{ color: '#fbbf24' }}>$3,000–4,000 more per year</strong> on groceries than they were in 2021. Here's the full breakdown.
        </p>

        <GroceryEmailBanner />

        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#f0fdf4', marginTop: 36, marginBottom: 16 }}>
          Price Changes Since 2021 (BLS Data)
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, marginBottom: 32 }}>
          {items.map(item => (
            <div key={item.name} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '14px 16px' }}>
              <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 6 }}>{item.name}</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: item.color }}>{item.change}</div>
              <div style={{ fontSize: 11, color: '#6b7280' }}>{item.period}</div>
            </div>
          ))}
        </div>

        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#f0fdf4', marginTop: 36, marginBottom: 12 }}>Why Food Inflation Is So Persistent</h2>
        <p style={{ color: '#d1d5db', lineHeight: 1.7, marginBottom: 16 }}>
          Unlike durable goods where price spikes often reverse, food prices tend to be "sticky" — they rise quickly when input costs increase but rarely fall back to prior levels. Grocery chains need to rebuild margins after absorbing supply shocks, and labor costs remain elevated.
        </p>
        <p style={{ color: '#d1d5db', lineHeight: 1.7, marginBottom: 16 }}>
          The three biggest drivers of sustained food inflation since 2021: <strong>energy costs</strong> (affects every step of the supply chain), <strong>supply chain disruptions</strong> (shipping, packaging), and <strong>commodity price shocks</strong> (grain, edible oils, fertilizer — worsened by the Ukraine war).
        </p>

        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#f0fdf4', marginTop: 36, marginBottom: 12 }}>What to Expect in 2025</h2>
        <p style={{ color: '#d1d5db', lineHeight: 1.7, marginBottom: 16 }}>
          The USDA projects overall food-at-home prices to increase <strong style={{ color: '#fbbf24' }}>2–3% in 2025</strong> — a slowdown from recent years but still above the historical 1.5% average. Eggs remain the wild card; avian flu outbreaks can spike prices 50–100% in weeks.
        </p>

        <GroceryEmailBanner />

        <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Link href="/guides/why-are-egg-prices-so-high" style={{ color: '#4ade80', fontSize: 13, textDecoration: 'none' }}>→ Why Are Egg Prices So High?</Link>
          <Link href="/guides/how-to-save-money-on-groceries" style={{ color: '#4ade80', fontSize: 13, textDecoration: 'none' }}>→ How to Save on Groceries</Link>
          <Link href="/grocery-prices" style={{ color: '#4ade80', fontSize: 13, textDecoration: 'none' }}>→ Prices by State</Link>
        </div>
      </div>
    </main>
  )
}
