'use client'

import Link from 'next/link'
import NavHeader from '../components/NavHeader'

const GUIDES = [
  {
    slug: 'why-are-egg-prices-so-high',
    icon: '🥚',
    title: 'Why Are Egg Prices So High Right Now?',
    description: 'Avian flu wiped out 100M+ hens. Feed costs are up. Cage-free mandates added a permanent floor. Here\'s the full breakdown — and when prices may ease.',
    readTime: '7 min read',
    tag: 'Trending',
    tagColor: '#f87171',
  },
  {
    slug: 'how-to-save-money-on-groceries',
    icon: '💰',
    title: 'How to Save Money on Groceries in 2025',
    description: '8 proven strategies that can cut your grocery bill 20–30% without spending hours couponing. Real savings on eggs, meat, produce and more.',
    readTime: '6 min read',
    tag: 'Savings',
    tagColor: '#4ade80',
  },
  {
    slug: 'cheapest-grocery-stores-compared',
    icon: '🏪',
    title: 'Cheapest Grocery Stores in 2025: Ranked',
    description: 'Aldi vs Walmart vs Kroger vs Costco vs Whole Foods — we compared 20 common items. Where you shop matters more than what you buy.',
    readTime: '5 min read',
    tag: 'Data',
    tagColor: '#3b82f6',
  },
  {
    slug: 'inflation-and-your-grocery-bill',
    icon: '📈',
    title: 'How Inflation Is Hitting Your Grocery Bill',
    description: 'Eggs +146%. Butter +45%. Beef +38%. Food prices have outpaced overall inflation for three straight years. Here\'s the full breakdown by category.',
    readTime: '8 min read',
    tag: 'Economics',
    tagColor: '#fbbf24',
  },
  {
    slug: 'grocery-prices-by-state',
    icon: '🗺',
    title: 'Grocery Prices by State: Complete Guide',
    description: 'Groceries cost 30–50% more in Hawaii and Alaska than in Midwest states. See how your state compares for eggs, milk, meat, and produce.',
    readTime: '6 min read',
    tag: 'Data',
    tagColor: '#a78bfa',
  },
  {
    slug: 'what-affects-grocery-prices',
    icon: '🌾',
    title: 'What Determines Grocery Prices?',
    description: 'From commodity markets to supply chain costs to labor — here\'s every factor that moves the number on your grocery receipt.',
    readTime: '7 min read',
    tag: 'Economics',
    tagColor: '#22c55e',
  },
]

export default function GuidesPage() {
  return (
    <main style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--text)' }}>
      <NavHeader active="guides" />
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 20px' }}>
        <Link href="/" style={{ color: 'var(--red)', fontSize: 13, textDecoration: 'none' }}>← Home</Link>

        <div style={{ textAlign: 'center', margin: '24px 0 36px' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--red)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
            Grocery Price Guides
          </div>
          <h1 style={{ fontSize: 30, fontWeight: 900, color: 'var(--text)', marginBottom: 10 }}>
            📚 Understand Your Grocery Bill
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: 14 }}>
            In-depth guides on grocery prices, food inflation, and how to spend less at the checkout.
          </p>
        </div>

        <div data-loco-widget></div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, marginTop: 28 }}>
          {GUIDES.map((guide) => (
            <Link key={guide.slug} href={`/guides/${guide.slug}`} style={{ textDecoration: 'none' }}>
              <div style={{
                background: '#fafafa',
                border: '1px solid var(--border)',
                borderRadius: 14,
                padding: '20px 22px',
                height: '100%',
                transition: 'border-color 0.2s',
                cursor: 'pointer',
              }}>
                <div style={{ fontSize: 28, marginBottom: 12 }}>{guide.icon}</div>
                <div style={{
                  display: 'inline-block',
                  fontSize: 11, fontWeight: 700,
                  color: guide.tagColor,
                  background: `${guide.tagColor}18`,
                  border: `1px solid ${guide.tagColor}30`,
                  borderRadius: 20, padding: '2px 10px',
                  marginBottom: 10,
                }}>
                  {guide.tag}
                </div>
                <h2 style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)', marginBottom: 8, lineHeight: 1.3 }}>
                  {guide.title}
                </h2>
                <p style={{ fontSize: 13, color: 'var(--subtle)', lineHeight: 1.6, marginBottom: 12 }}>
                  {guide.description}
                </p>
                <div style={{ fontSize: 12, color: 'var(--red)', fontWeight: 600 }}>
                  {guide.readTime} →
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
