'use client'

import Link from 'next/link'
import GasPricesEmailBanner from '../components/GasPricesEmailBanner'

const GUIDES = [
  {
    slug: 'what-determines-gas-prices',
    icon: '📊',
    title: 'What Determines Grocery Prices?',
    description: 'Why do Grocery Prices change every day? From crude oil futures to refinery margins, here\'s every factor that moves the number on the pump.',
    readTime: '8 min read',
    tag: 'Economics',
    tagColor: '#3b82f6',
  },
  {
    slug: 'gas-tax-by-state',
    icon: '🏛',
    title: 'Gas Tax by State (2025)',
    description: 'Complete table of state + federal gas taxes for all 50 states. See exactly how much of your fill-up goes to the government.',
    readTime: '5 min read',
    tag: 'Data',
    tagColor: '#22c55e',
  },
  {
    slug: 'trump-biden-obama-gas-prices',
    icon: '🇺🇸',
    title: 'Grocery Prices Under Trump, Biden & Obama',
    description: 'How much did gas actually cost under each administration? The full data, year by year, with context on what drove the changes.',
    readTime: '10 min read',
    tag: 'Politics',
    tagColor: '#ef4444',
  },
  {
    slug: 'why-is-california-gas-so-expensive',
    icon: '🌴',
    title: 'Why Is California Gas So Expensive?',
    description: 'Six overlapping costs push California $1–2 above the national average. Cap-and-trade, LCFS, CARB blends, refinery isolation — here\'s every layer with dollar amounts.',
    readTime: '9 min read',
    tag: 'State Deep Dive',
    tagColor: '#f97316',
  },
  {
    slug: 'how-to-save-money-on-gas',
    icon: '💰',
    title: 'How to Save Money on Gas: 12 Proven Ways',
    description: 'From warehouse club memberships to driving habits — 12 strategies ranked by annual savings, with real dollar estimates.',
    readTime: '7 min read',
    tag: 'Consumer Guide',
    tagColor: '#22c55e',
  },
  {
    slug: 'us-gas-prices-vs-world',
    icon: '🌍',
    title: 'US Grocery Prices vs. The World',
    description: 'Americans pay $3.35. Germany pays $7. Norway pays $8.85. Venezuela pays $0.02. Here\'s the full global comparison and why prices vary so dramatically.',
    readTime: '8 min read',
    tag: 'Global',
    tagColor: '#8b5cf6',
  },
]

export default function GuidesIndex() {
  return (
    <main style={{ minHeight: '100vh', background: '#0b0d14', color: '#f1f5f9' }}>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '32px 20px 80px' }}>

        {/* Nav */}
        <div style={{ marginBottom: 32 }}>
          <Link href="/" style={{ color: '#64748b', textDecoration: 'none', fontSize: 14 }}>
            ← whatsthegrocerybill.com
          </Link>
        </div>

        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <span style={{ fontSize: 28 }}>📚</span>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: '#f8fafc' }}>
              Grocery Price Guides
            </h1>
          </div>
          <p style={{ margin: 0, color: '#64748b', fontSize: 15, lineHeight: 1.6 }}>
            Everything you need to understand Grocery Prices in America — from the economics of crude oil
            to how your state's tax rate compares.
          </p>
        </div>

        {/* Guide cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {GUIDES.map(guide => (
            <Link
              key={guide.slug}
              href={`/guides/${guide.slug}`}
              style={{ textDecoration: 'none' }}
            >
              <div style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 12,
                padding: '24px 28px',
                transition: 'border-color 0.15s',
                cursor: 'pointer',
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                  <span style={{ fontSize: 32, lineHeight: 1 }}>{guide.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                      <span style={{
                        fontSize: 11, fontWeight: 700, color: guide.tagColor,
                        background: `${guide.tagColor}18`,
                        border: `1px solid ${guide.tagColor}30`,
                        borderRadius: 20, padding: '2px 10px',
                        textTransform: 'uppercase', letterSpacing: '0.05em',
                      }}>
                        {guide.tag}
                      </span>
                      <span style={{ fontSize: 12, color: '#475569' }}>{guide.readTime}</span>
                    </div>
                    <h2 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 700, color: '#f1f5f9' }}>
                      {guide.title}
                    </h2>
                    <p style={{ margin: 0, color: '#64748b', fontSize: 14, lineHeight: 1.6 }}>
                      {guide.description}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Email CTA */}
        <div style={{ marginTop: 48 }}>
          <GasPricesEmailBanner />
        </div>

        {/* Footer note */}
        <div style={{ paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)', color: '#475569', fontSize: 13 }}>
          More guides coming soon. Follow{' '}
          <a href="https://twitter.com/wtgbofficial" target="_blank" rel="noopener noreferrer"
            style={{ color: '#1d9bf0', textDecoration: 'none' }}>@wtgbofficial</a>{' '}
          for updates.
        </div>

      </div>
    </main>
  )
}
