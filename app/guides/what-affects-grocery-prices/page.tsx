import type { Metadata } from 'next'
import Link from 'next/link'
import NavHeader from '../../components/NavHeader'
import LocoRadZone from '@/components/LocoRadZone'
import LocoBannerZone from '@/components/LocoBannerZone'
import LocoTabZone from '@/components/LocoTabZone'

export const metadata: Metadata = {
  title: 'What Determines Grocery Prices? | What\'s the Grocery Bill?',
  description: 'From farm to checkout — why grocery prices rise and fall, who sets them, and what factors affect what you pay at the register.',
}

export default function WhatAffectsGroceryPrices() {
  const factors = [
    { emoji: '🌾', title: 'Commodity Prices', body: 'The raw ingredients — wheat, corn, soybeans, cattle, hogs — are traded globally on commodity exchanges. When drought hits the Midwest or a war disrupts Ukrainian wheat exports, it ripples through every product that contains those ingredients within 3–6 months.' },
    { emoji: '⛽', title: 'Energy Costs', body: 'Energy powers every step: farm equipment, refrigerated transport trucks, warehouse climate control, and store lighting. When diesel prices spike, so does the cost of getting food to market. Energy represents 10–15% of the total cost of food production.' },
    { emoji: '🚚', title: 'Supply Chain & Transportation', body: 'The distance food travels matters. California produces 50%+ of US fruits and vegetables — shipping those to the East Coast adds cost. Supply chain bottlenecks (like the 2021 port backlogs) can cause sudden price spikes for packaged goods.' },
    { emoji: '👷', title: 'Labor Costs', body: 'Farm labor, meatpacking, warehouse workers, and store employees all factor into your grocery bill. Minimum wage increases and tight labor markets since 2021 have structurally raised food production costs in ways that don\'t reverse easily.' },
    { emoji: '🦠', title: 'Disease and Weather Events', body: 'Avian flu wiped out 100M+ egg-laying hens. A drought crushes California lettuce. A hurricane floods Florida orange groves. These supply shocks cause immediate and sometimes lasting price spikes in specific categories.' },
    { emoji: '📦', title: 'Packaging and Inputs', body: 'Cardboard, plastic, aluminum, and glass costs all affect packaged food prices. Post-2021 commodity inflation hit packaging materials hard. "Shrinkflation" — smaller package sizes at the same price — is one response grocery brands use.' },
  ]

  return (
    <main style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--text)' }}>
      <NavHeader active="prices" />
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 20px' }}>
        <Link href="/guides" style={{ color: 'var(--red)', fontSize: 13, textDecoration: 'none' }}>← Back to Guides</Link>

        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--red)', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '16px 0 10px' }}>
          How Grocery Pricing Works
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 900, lineHeight: 1.2, marginBottom: 12, color: 'var(--text)' }}>
          What Determines Grocery Prices?
        </h1>
        <p style={{ color: 'var(--subtle)', fontSize: 15, marginBottom: 32, lineHeight: 1.6 }}>
          By the time food reaches your cart, it's passed through farmers, processors, distributors, and retailers — each adding cost. Here's how grocery prices are actually set, and what makes them go up or down.
        </p>

        <LocoRadZone partner="pub_rs2wayi1" campaign="cmp_e14b1866" count={4} />

        <div style={{ marginTop: 32 }}>
          {factors.map((f, i) => (
            <div key={f.title}>
              <div style={{ marginBottom: 28, paddingBottom: 28, borderBottom: '1px solid var(--border)' }}>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', marginBottom: 10 }}>
                  {f.emoji} {f.title}
                </h2>
                <p style={{ color: 'var(--subtle)', lineHeight: 1.7, margin: 0 }}>{f.body}</p>
              </div>
              {i % 4 === 0 && <LocoRadZone key={`rad-${i}`} partner="pub_rs2wayi1" campaign="cmp_e14b1866" count={4} />}
              {i % 4 === 1 && <LocoBannerZone key={`ban-a-${i}`} />}
              {i % 4 === 2 && <LocoTabZone key={`tab-${i}`} partner="pub_rs2wayi1" campaign="cmp_e0ef7110" count={6} />}
              {i % 4 === 3 && <LocoBannerZone key={`ban-b-${i}`} />}
            </div>
          ))}
        </div>

        <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid var(--border)', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Link href="/guides/inflation-and-your-grocery-bill" style={{ color: 'var(--red)', fontSize: 13, textDecoration: 'none' }}>→ Inflation and Your Grocery Bill</Link>
          <Link href="/guides/how-to-save-money-on-groceries" style={{ color: 'var(--red)', fontSize: 13, textDecoration: 'none' }}>→ How to Save on Groceries</Link>
        </div>
      </div>
    </main>
  )
}
