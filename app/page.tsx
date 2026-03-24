import Link from 'next/link'
import GasMapWrapper from './components/GasMapWrapper'
import ArticleSection from './components/ArticleSection'
import EmailCapture from './components/EmailCapture'
import NewsFeed from './components/NewsFeed'

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0b0d14] text-white">
      <div className="max-w-6xl mx-auto px-4 pt-6 pb-8">

        {/* Header */}
        <div className="text-center mb-5">
          <h1 className="text-3xl font-black tracking-tight mb-1">
            🛒 What&apos;s the Price of Gas?
          </h1>
          <p className="text-gray-500 text-sm">
            Live US retail groceries prices by state
          </p>
          {/* Nav pills */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
            <Link href="/grocery-prices/near-me" style={{
              fontSize: 12, fontWeight: 700, color: '#22c55e',
              textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '5px 13px',
              background: 'rgba(34,197,94,0.1)',
              border: '1px solid rgba(34,197,94,0.2)',
              borderRadius: 20,
            }}>
              📍 Grocery Prices Near Me
            </Link>
            <Link href="/grocery-prices" style={{
              fontSize: 12, fontWeight: 700, color: '#94a3b8',
              textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '5px 13px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 20,
            }}>
              🗺 Grocery Prices by State
            </Link>
            <Link href="/news" style={{
              fontSize: 12, fontWeight: 700, color: '#ef4444',
              textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '5px 13px',
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: 20,
            }}>
              ⬆ Price Pressure Analysis
            </Link>
            <Link href="/guides" style={{
              fontSize: 12, fontWeight: 700, color: '#a78bfa',
              textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '5px 13px',
              background: 'rgba(167,139,250,0.1)',
              border: '1px solid rgba(167,139,250,0.2)',
              borderRadius: 20,
            }}>
              📚 Grocery Price Guides
            </Link>
            <Link href="/grocery-prices#brands" style={{
              fontSize: 12, fontWeight: 700, color: '#f97316',
              textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '5px 13px',
              background: 'rgba(249,115,22,0.1)',
              border: '1px solid rgba(249,115,22,0.2)',
              borderRadius: 20,
            }}>
              🏪 Gas by Brand
            </Link>
            <a href="https://twitter.com/intent/follow?screen_name=wtgbofficial"
              target="_blank" rel="noopener noreferrer"
              style={{
                fontSize: 12, fontWeight: 600, color: '#1d9bf0',
                textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '5px 13px',
                background: 'rgba(29,155,240,0.08)',
                border: '1px solid rgba(29,155,240,0.15)',
                borderRadius: 20,
              }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.63L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/>
              </svg>
              @wtgbofficial
            </a>
          </div>
        </div>

        {/* Map */}
        <GasMapWrapper />

        {/* Email Capture — above the fold after map, highest intent moment */}
        <div style={{ marginTop: 24, marginBottom: 8 }}>
          <EmailCapture />
        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', margin: '28px 0 28px' }} />

        {/* Price Pressure Articles */}
        <ArticleSection />

        {/* Market Intelligence Feed */}
        <NewsFeed />

        {/* Footer */}
        <div className="text-center mt-6 text-xs text-gray-600">
          Data: AAA · EIA · X/Twitter · Updates every hour
        </div>
      </div>
    </main>
  )
}
