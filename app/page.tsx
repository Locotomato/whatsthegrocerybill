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
  const { items: groceryItems, dataMonth } = await getGroceryPrices()

  return (
    <main className="min-h-screen text-white" style={{ background: '#0c1409' }}>
      <div className="max-w-5xl mx-auto px-4 pt-6 pb-10">

        {/* ── Header ─────────────────────────────────── */}
        <div className="text-center mb-6">
          <div style={{ fontSize: 12, fontWeight: 600, color: '#4ade80', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
            Live US Grocery Price Tracker
          </div>
          <h1 style={{ fontSize: 'clamp(22px, 5vw, 32px)', fontWeight: 900, letterSpacing: '-0.02em', color: '#f0fdf4', margin: '0 0 8px' }}>
            🛒 What&apos;s the Grocery Bill?
          </h1>
          <p style={{ color: '#6b7280', fontSize: 14, margin: 0 }}>
            US grocery prices by state — eggs, milk, beef, chicken &amp; more
          </p>

          {/* Nav pills */}
          <nav className="nav-pills">
            <Link href="/grocery-prices" className="nav-pill"
              style={{ color: '#4ade80', background: 'rgba(74,222,128,0.1)', borderColor: 'rgba(74,222,128,0.22)' }}>
              🗺 Prices by State
            </Link>
            <Link href="/grocery-prices/near-me" className="nav-pill"
              style={{ color: '#a3e635', background: 'rgba(163,230,53,0.08)', borderColor: 'rgba(163,230,53,0.18)' }}>
              📍 Near Me
            </Link>
            <Link href="/news" className="nav-pill"
              style={{ color: '#fbbf24', background: 'rgba(251,191,36,0.08)', borderColor: 'rgba(251,191,36,0.18)' }}>
              📈 Price Alerts
            </Link>
            <Link href="/guides" className="nav-pill"
              style={{ color: '#a78bfa', background: 'rgba(167,139,250,0.08)', borderColor: 'rgba(167,139,250,0.18)' }}>
              📚 Budget Guides
            </Link>
            <a href="https://twitter.com/intent/follow?screen_name=wtgbofficial"
              target="_blank" rel="noopener noreferrer"
              className="nav-pill"
              style={{ color: '#1d9bf0', background: 'rgba(29,155,240,0.08)', borderColor: 'rgba(29,155,240,0.18)' }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.63L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/>
              </svg>
              @wtgbofficial
            </a>
          </nav>
        </div>

        {/* ── National Averages card ─────────────────── */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(74,222,128,0.14)',
          borderRadius: 16,
          padding: '18px 20px',
          marginBottom: 20,
        }}>
          {/* Card header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#4ade80', letterSpacing: '0.09em', textTransform: 'uppercase' }}>
                National Averages
              </div>
              <div style={{ fontSize: 12, color: '#4b5563', marginTop: 2 }}>
                BLS avg retail price{dataMonth ? ` · ${dataMonth}` : ''} · varies by store &amp; region
              </div>
            </div>
            <Link href="/grocery-prices" style={{
              fontSize: 12, fontWeight: 600, color: '#4ade80', textDecoration: 'none',
              display: 'inline-flex', alignItems: 'center', gap: 3,
              padding: '5px 12px',
              background: 'rgba(74,222,128,0.08)',
              border: '1px solid rgba(74,222,128,0.18)',
              borderRadius: 20,
              whiteSpace: 'nowrap',
            }}>
              By state →
            </Link>
          </div>

          {/* Price grid */}
          <div className="price-grid">
            {groceryItems.map((item) => {
              const hasYoy = item.yoyPct != null && item.yoyUp != null
              const pct = hasYoy ? Math.abs(Number(item.yoyPct)).toFixed(0) : null
              return (
                <div key={item.id} style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 12,
                  padding: '12px 14px',
                }}>
                  {/* Emoji row + trend badge */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                    <span style={{ fontSize: 22, lineHeight: 1 }}>{item.emoji}</span>
                    {hasYoy && pct && (
                      <span style={{
                        fontSize: 10, fontWeight: 700,
                        color: item.yoyUp ? '#fca5a5' : '#86efac',
                        background: item.yoyUp ? 'rgba(248,113,113,0.14)' : 'rgba(74,222,128,0.14)',
                        padding: '2px 7px',
                        borderRadius: 20,
                        lineHeight: 1.6,
                      }}>
                        {item.yoyUp ? '↑' : '↓'}{pct}%
                      </span>
                    )}
                  </div>

                  {/* Label */}
                  <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 4, lineHeight: 1.3 }}>
                    {item.name}
                  </div>

                  {/* Price */}
                  <div style={{
                    fontSize: 22, fontWeight: 900, color: '#f0fdf4',
                    letterSpacing: '-0.02em', lineHeight: 1,
                  }}>
                    {item.price ?? '—'}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Email capture ─────────────────────────── */}
        <EmailCapture />

        {/* ── Divider ───────────────────────────────── */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', margin: '4px 0 28px' }} />

        {/* ── Articles + News ───────────────────────── */}
        <ArticleSection />
        <NewsFeed />

        {/* ── Footer ────────────────────────────────── */}
        <div style={{ textAlign: 'center', marginTop: 24, fontSize: 12, color: '#374151' }}>
          Data: BLS CPI · USDA ERS · Updates weekly
        </div>
      </div>
    </main>
  )
}
