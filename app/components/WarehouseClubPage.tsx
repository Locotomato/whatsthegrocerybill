'use client'
import type { ClubData } from '../../lib/warehouseClubs'
import Link from 'next/link'
import NavHeader from './NavHeader'
import { BRAND_STATES } from './WarehouseClubStatePage'
import RadUnit from '@/components/RadUnit'

const C = { bg: '#f8f9fa', card: '#ffffff', border: '#e5e7eb', red: '#dc2626', navy: '#1e3a5f', text: '#1f2937', muted: '#6b7280', green: '#16a34a', light: '#fef2f2' }
const F = "'Inter', system-ui, sans-serif"

interface Props {
  club: ClubData
  nationalEggPrice?: number | null
}

function SavingsCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: '16px 20px', flex: 1, minWidth: 140 }}>
      <div style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: C.navy }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{sub}</div>}
    </div>
  )
}

export default function WarehouseClubPage({ club }: Props) {
  const savingsMid = Math.round((club.savingsLow + club.savingsHigh) / 2)
  const annualSavings = (club.weeklyCartSavings * 52).toFixed(0)
  const membershipMonths = club.requiresMembership
    ? Math.ceil(parseInt(club.membershipCost.replace(/[^0-9]/g, '').slice(0, 3)) / (club.weeklyCartSavings * 4.3))
    : 0

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `${club.name} Grocery Prices`,
    url: `https://whatsthegrocerybill.com/grocery-prices/${club.slug}`,
    description: club.metaDescription,
  }

  return (
    <main style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: F }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <NavHeader active="grocery-prices" />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 16px 80px' }}>
        {/* Breadcrumb */}
        <div style={{ fontSize: 13, color: C.muted, marginBottom: 24 }}>
          <Link href="/" style={{ color: C.muted, textDecoration: 'none' }}>Home</Link>
          {' / '}
          <Link href="/grocery-prices" style={{ color: C.muted, textDecoration: 'none' }}>Grocery Prices</Link>
          {' / '}
          <span style={{ color: C.text }}>{club.name}</span>
        </div>

        {/* Hero */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '28px 24px', marginBottom: 24 }}>
          <h1 style={{ margin: '0 0 8px', fontSize: 26, fontWeight: 800, color: C.navy }}>
            {club.name} Grocery Prices
          </h1>
          <p style={{ margin: '0 0 20px', color: C.muted, fontSize: 15 }}>
            {club.name} typically prices groceries <strong style={{ color: C.red }}>{club.savingsLow}–{club.savingsHigh}% below</strong> traditional supermarkets.
            {club.requiresMembership ? ` ${club.membership} required.` : ' No membership required.'}
          </p>

          {/* Savings cards */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <SavingsCard
              label="Avg savings vs supermarket"
              value={`${club.savingsLow}–${club.savingsHigh}%`}
              sub="per unit on staples"
            />
            <SavingsCard
              label="Est. weekly cart savings"
              value={`$${club.weeklyCartSavings}`}
              sub="on a $150 grocery cart"
            />
            <SavingsCard
              label="Est. annual savings"
              value={`$${annualSavings}`}
              sub="based on weekly shopping"
            />
            {club.requiresMembership && (
              <SavingsCard
                label="Membership"
                value={club.membershipCost}
                sub={`breaks even in ~${membershipMonths} month${membershipMonths !== 1 ? 's' : ''}`}
              />
            )}
          </div>
        </div>

        <RadUnit />

        {/* Key items */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '24px', marginBottom: 24 }}>
          <h2 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 700, color: C.navy }}>
            Best Grocery Deals at {club.name}
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {club.keyItems.map((item, i) => (
              <span key={i} style={{
                background: C.light, color: C.red, border: `1px solid #fecaca`,
                borderRadius: 20, padding: '6px 14px', fontSize: 13, fontWeight: 500
              }}>
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* Why cheaper */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '24px', marginBottom: 24 }}>
          <h2 style={{ margin: '0 0 12px', fontSize: 18, fontWeight: 700, color: C.navy }}>
            Why Are {club.name} Grocery Prices Lower?
          </h2>
          <p style={{ margin: 0, color: C.text, lineHeight: 1.65, fontSize: 15 }}>
            {club.whyCheaper}
          </p>
        </div>

        {/* Membership tiers */}
        {club.membershipTiers && (
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '24px', marginBottom: 24 }}>
            <h2 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 700, color: C.navy }}>
              {club.requiresMembership ? 'Membership Options' : 'Loyalty Program'}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {club.membershipTiers.map((tier, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <span style={{ color: C.green, fontSize: 16, marginTop: 1 }}>✓</span>
                  <span style={{ fontSize: 14, color: C.text }}>{tier}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '24px', marginBottom: 24 }}>
          <h2 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 700, color: C.navy }}>
            Shopping Tips
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {club.notes.map((note, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <span style={{ color: C.red, fontSize: 16, marginTop: 1 }}>•</span>
                <span style={{ fontSize: 14, color: C.text }}>{note}</span>
              </div>
            ))}
          </div>
        </div>

        {/* State links */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '24px', marginBottom: 24 }}>
          <h2 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700, color: C.navy }}>
            {club.name} Grocery Prices by State
          </h2>
          <p style={{ margin: '0 0 16px', color: C.muted, fontSize: 14 }}>
            Grocery prices vary by region. Select your state to see local context.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {(BRAND_STATES[club.slug] ?? []).map(slug => {
              const label = slug.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
              return (
                <Link
                  key={slug}
                  href={`/grocery-prices/${club.slug}/${slug}`}
                  style={{ fontSize: 13, color: C.navy, textDecoration: 'none', padding: '4px 10px',
                    background: '#f1f5f9', borderRadius: 6, border: `1px solid ${C.border}` }}
                >
                  {label}
                </Link>
              )
            })}
          </div>
        </div>

        {/* FAQs */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '24px' }}>
          <h2 style={{ margin: '0 0 20px', fontSize: 18, fontWeight: 700, color: C.navy }}>
            {club.name} Grocery Prices — FAQs
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {club.faqs.map((faq, i) => (
              <div key={i} style={{ borderTop: i > 0 ? `1px solid ${C.border}` : 'none', paddingTop: i > 0 ? 20 : 0 }}>
                <div style={{ fontWeight: 600, color: C.navy, marginBottom: 8, fontSize: 15 }}>{faq.q}</div>
                <div style={{ color: C.text, lineHeight: 1.65, fontSize: 14 }}>{faq.a}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
