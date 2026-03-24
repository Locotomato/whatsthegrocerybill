import Link from 'next/link'
import ArticleSection from './components/ArticleSection'
import EmailCapture from './components/EmailCapture'
import NewsFeed from './components/NewsFeed'

interface GroceryItem {
  id: string
  emoji: string
  name: string
  unit: string
  price: string | null
  priceRaw: number | null
  yoyPct: number | null
  yoyUp: boolean | null
}

interface GroceryPricesPayload {
  items: GroceryItem[]
  dataMonth: string
  source: string
}

async function getGroceryPrices(): Promise<GroceryPricesPayload> {
  try {
    const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://whatsthegrocerybill.com'
    const res  = await fetch(`${base}/api/grocery-prices`, { next: { revalidate: 3600 } })
    if (!res.ok) throw new Error('API error')
    const data = await res.json()
    return { items: data.items ?? [], dataMonth: data.dataMonth ?? '', source: data.source ?? 'BLS' }
  } catch {
    return {
      items: [
        { id: 'APU0000708111', emoji: '🥚', name: 'Eggs (doz)',       unit: '/doz', price: '$4.82', priceRaw: 4.82, yoyPct: 61,  yoyUp: true  },
        { id: 'APU0000709112', emoji: '🥛', name: 'Milk (gal)',       unit: '/gal', price: '$3.94', priceRaw: 3.94, yoyPct: 3,   yoyUp: true  },
        { id: 'APU0000702111', emoji: '🍞', name: 'Bread (lb)',       unit: '/lb',  price: '$1.98', priceRaw: 1.98, yoyPct: 5,   yoyUp: true  },
        { id: 'APU0000703112', emoji: '🥩', name: 'Ground Beef (lb)', unit: '/lb',  price: '$5.43', priceRaw: 5.43, yoyPct: 8,   yoyUp: true  },
        { id: 'APU0000706111', emoji: '🐔', name: 'Chicken (lb)',     unit: '/lb',  price: '$2.11', priceRaw: 2.11, yoyPct: -1,  yoyUp: false },
        { id: 'APU0000714111', emoji: '🧈', name: 'Butter (lb)',      unit: '/lb',  price: '$5.11', priceRaw: 5.11, yoyPct: 15,  yoyUp: true  },
      ],
      dataMonth: '',
      source: 'fallback',
    }
  }
}

export default async function Home() {
  const { items: groceryItems, dataMonth, source } = await getGroceryPrices()
  return (
    <main className="min-h-screen text-white" style={{ background: '#0c1409' }}>
      <div className="max-w-6xl mx-auto px-4 pt-6 pb-8">

        {/* Header */}
        <div className="text-center mb-6">
          <div style={{ fontSize: 13, fontWeight: 600, color: '#4ade80', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
            Live US Grocery Price Tracker
          </div>
          <h1 className="text-3xl font-black tracking-tight mb-2" style={{ color: '#f0fdf4' }}>
            🛒 What&apos;s the Grocery Bill?
          </h1>
          <p style={{ color: '#6b7280', fontSize: 14 }}>
            Real-time grocery prices by state — eggs, milk, beef, chicken &amp; more
          </p>

          {/* Nav pills */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
            <Link href="/grocery-prices" style={{
              fontSize: 12, fontWeight: 700, color: '#4ade80',
              textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '5px 13px',
              background: 'rgba(74,222,128,0.1)',
              border: '1px solid rgba(74,222,128,0.2)',
              borderRadius: 20,
            }}>
              🗺 Prices by State
            </Link>
            <Link href="/grocery-prices/near-me" style={{
              fontSize: 12, fontWeight: 700, color: '#a3e635',
              textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '5px 13px',
              background: 'rgba(163,230,53,0.08)',
              border: '1px solid rgba(163,230,53,0.15)',
              borderRadius: 20,
            }}>
              📍 Near Me
            </Link>
            <Link href="/news" style={{
              fontSize: 12, fontWeight: 700, color: '#fbbf24',
              textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '5px 13px',
              background: 'rgba(251,191,36,0.08)',
              border: '1px solid rgba(251,191,36,0.15)',
              borderRadius: 20,
            }}>
              📈 Price Alerts
            </Link>
            <Link href="/guides" style={{
              fontSize: 12, fontWeight: 700, color: '#a78bfa',
              textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '5px 13px',
              background: 'rgba(167,139,250,0.08)',
              border: '1px solid rgba(167,139,250,0.15)',
              borderRadius: 20,
            }}>
              📚 Budget Guides
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

        {/* Grocery Price Grid — hero data display */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(74,222,128,0.12)',
          borderRadius: 16,
          padding: '20px 24px',
          marginBottom: 24,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#4ade80', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                National Averages
              </div>
              <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                BLS Avg Retail Price{dataMonth ? ` · ${dataMonth}` : ''} · Varies by store &amp; region
              </div>
            </div>
            <Link href="/grocery-prices" style={{
              fontSize: 11, fontWeight: 600, color: '#4ade80',
              textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4,
            }}>
              View by state →
            </Link>
          </div>

          <div className="price-grid">
            {groceryItems.map((item) => {
              const hasYoy = item.yoyPct != null && item.yoyUp != null
              const yoyLabel = hasYoy
                ? `${item.yoyUp ? '+' : ''}${Number(item.yoyPct).toFixed(1)}% vs last year`
                : null
              return (
                <div key={item.id} style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 10,
                  padding: '12px 14px',
                }}>
                  <div style={{ fontSize: 20, marginBottom: 4 }}>{item.emoji}</div>
                  <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 4 }}>{item.name}</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#f0fdf4', marginBottom: 3 }}>
                    {item.price ?? '—'}
                  </div>
                  {yoyLabel && (
                    <div style={{
                      fontSize: 11, fontWeight: 600,
                      color: item.yoyUp ? '#f87171' : '#4ade80',
                    }}>
                      {yoyLabel}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Email Capture */}
        <div style={{ marginBottom: 8 }}>
          <EmailCapture />
        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', margin: '28px 0 28px' }} />

        {/* Price Pressure Articles */}
        <ArticleSection />

        {/* Market Intelligence Feed */}
        <NewsFeed />

        {/* Footer */}
        <div className="text-center mt-6 text-xs" style={{ color: '#374151' }}>
          Data: BLS CPI · USDA ERS · X/Twitter · Updates weekly
        </div>
      </div>
    </main>
  )
}
