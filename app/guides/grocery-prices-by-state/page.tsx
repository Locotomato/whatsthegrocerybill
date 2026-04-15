import type { Metadata } from 'next'
import Link from 'next/link'
import NavHeader from '../../components/NavHeader'
import AfsUnit from '@/components/AfsUnit'

export const metadata: Metadata = {
  title: 'Grocery Prices by State 2025: Which States Pay Most & Least | What\'s the Grocery Bill?',
  description: 'Grocery prices vary up to 50% by state. Hawaii and Alaska pay the most; Midwest and Southern states pay the least. Full state-by-state data.',
}

const STATE_DATA = [
  { state: 'Hawaii', tier: 'highest', note: '+48% above national avg — isolation + shipping costs', color: '#f87171' },
  { state: 'Alaska', tier: 'highest', note: '+40% above national avg — remote supply chains', color: '#f87171' },
  { state: 'California', tier: 'high', note: '+22% — regulations, labor costs, Prop 12 cage-free', color: '#fb923c' },
  { state: 'New York', tier: 'high', note: '+18% — NYC metro pulls the statewide average up', color: '#fb923c' },
  { state: 'Massachusetts', tier: 'high', note: '+16% — high cost of living statewide', color: '#fb923c' },
  { state: 'Kansas', tier: 'low', note: '-12% below national avg — grain belt, low transport costs', color: 'var(--red)' },
  { state: 'Missouri', tier: 'low', note: '-11% — central location, low cost of living', color: 'var(--red)' },
  { state: 'Iowa', tier: 'low', note: '-10% — major egg + pork producer, low logistics costs', color: 'var(--red)' },
  { state: 'Arkansas', tier: 'low', note: '-9% — low cost of living, Walmart headquarters state', color: 'var(--red)' },
  { state: 'Mississippi', tier: 'low', note: '-9% — lowest overall cost of living in US', color: 'var(--red)' },
]

export default function GroceryPricesByState() {
  return (
    <main style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--text)' }}>
      <NavHeader active="prices" />
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 20px' }}>
        <Link href="/guides" style={{ color: 'var(--red)', fontSize: 13, textDecoration: 'none' }}>← Back to Guides</Link>

        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--red)', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '16px 0 10px' }}>
          State-by-State Data
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 900, lineHeight: 1.2, marginBottom: 12, color: 'var(--text)' }}>
          Grocery Prices by State: 2025 Guide
        </h1>
        <p style={{ color: 'var(--subtle)', fontSize: 15, marginBottom: 32, lineHeight: 1.6 }}>
          A family spending $1,000/month on groceries in Iowa would spend <strong style={{ color: '#fbbf24' }}>$1,480/month in Hawaii</strong> buying the exact same items. Here's how all 50 states compare — and why the gaps are so large.
        </p>

        <div data-loco-widget></div>

        <AfsUnit />

        <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', marginTop: 36, marginBottom: 16 }}>Highest & Lowest Cost States</h2>
        <div style={{ marginBottom: 28 }}>
          {STATE_DATA.map((s) => (
            <div key={s.state} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '12px 16px', marginBottom: 8,
              background: '#fafafa',
              border: '1px solid var(--border)',
              borderRadius: 10, flexWrap: 'wrap', gap: 8,
            }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', minWidth: 110 }}>{s.state}</span>
              <span style={{ fontSize: 13, color: 'var(--muted)', flex: 1 }}>{s.note}</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: s.color }}>
                {s.tier === 'highest' ? '🔴 Most Expensive' : s.tier === 'high' ? '🟠 Above Average' : '🟢 Below Average'}
              </span>
            </div>
          ))}
        </div>

        <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', marginTop: 36, marginBottom: 12 }}>Why Do Grocery Prices Vary So Much by State?</h2>
        <p style={{ color: '#d1d5db', lineHeight: 1.7, marginBottom: 16 }}>
          <strong>Transportation costs</strong> are the biggest variable — Hawaii and Alaska pay a massive premium simply because everything has to be shipped long distances. In the continental US, states far from major distribution centers pay more.
        </p>
        <p style={{ color: '#d1d5db', lineHeight: 1.7, marginBottom: 16 }}>
          <strong>State regulations</strong> matter for specific categories. California's Prop 12 cage-free mandate adds $1–2/dozen to egg prices statewide. Local minimum wages and labor laws affect store operating costs.
        </p>
        <p style={{ color: '#d1d5db', lineHeight: 1.7, marginBottom: 32 }}>
          <strong>Local competition</strong> plays a role too — states with dense Aldi and Lidl penetration see lower prices across the board as competitors match their pricing.
        </p>

        <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid var(--border)', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Link href="/grocery-prices" style={{ color: 'var(--red)', fontSize: 13, textDecoration: 'none' }}>→ See Live Data by State</Link>
          <Link href="/guides/cheapest-grocery-stores-compared" style={{ color: 'var(--red)', fontSize: 13, textDecoration: 'none' }}>→ Cheapest Grocery Stores Compared</Link>
        </div>
      </div>
    </main>
  )
}
