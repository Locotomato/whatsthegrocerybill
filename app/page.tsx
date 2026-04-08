import Link from 'next/link'
import ArticleSection from './components/ArticleSection'
import NewsFeed from './components/NewsFeed'

interface GroceryItem {
  id: string; emoji: string; name: string; unit: string
  price: string | null; priceRaw: number | null
  yoyPct: number | null; yoyUp: boolean | null
}

interface GroceryPricesPayload {
  items: GroceryItem[]; dataMonth: string; source: string
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
      dataMonth: '', source: 'fallback',
    }
  }
}

export default async function Home() {
  const { items: groceryItems, dataMonth } = await getGroceryPrices()

  return (
    <main className="min-h-screen" style={{ background: 'var(--bg)' }}>

      {/* ── Top nav bar ── */}
      <header style={{ background: 'var(--navy)', borderBottom: '3px solid var(--red)', padding: '0 20px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 54 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 22 }}>🛒</span>
            <span style={{ fontSize: 16, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>
              What&apos;s the Grocery Bill?
            </span>
          </div>
          <nav style={{ display: 'flex', gap: 4 }}>
            <Link href="/grocery-prices" style={{ fontSize: 12, fontWeight: 600, color: '#cbd5e1', textDecoration: 'none', padding: '4px 10px' }}>By State</Link>
            <Link href="/news"           style={{ fontSize: 12, fontWeight: 600, color: '#cbd5e1', textDecoration: 'none', padding: '4px 10px' }}>News</Link>
            <Link href="/guides"         style={{ fontSize: 12, fontWeight: 600, color: '#cbd5e1', textDecoration: 'none', padding: '4px 10px' }}>Guides</Link>
          </nav>
        </div>
      </header>

      {/* ── Main content ── */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 16px 0' }}>

        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            display: 'inline-block', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
            textTransform: 'uppercase', color: 'var(--red)', background: 'var(--red-light)',
            border: '1px solid var(--red-border)', padding: '4px 12px', borderRadius: 20, marginBottom: 14,
          }}>
            🇺🇸 Live US Grocery Price Tracker
          </div>
          <h1 style={{ fontSize: 'clamp(24px, 5vw, 38px)', fontWeight: 900, letterSpacing: '-0.025em', color: 'var(--text)', margin: '0 0 10px' }}>
            How much is your grocery bill?
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: 15, margin: '0 0 18px', maxWidth: 480, marginLeft: 'auto', marginRight: 'auto' }}>
            Track egg, milk, beef &amp; bread prices by state — updated weekly from BLS data.
          </p>
          <nav className="nav-pills">
            <Link href="/grocery-prices" className="nav-pill" style={{ color: 'var(--blue)', background: 'var(--blue-light)', borderColor: 'var(--blue-border)' }}>🗺 Prices by State</Link>
            <Link href="/grocery-prices/near-me" className="nav-pill" style={{ color: '#7c3aed', background: '#f5f3ff', borderColor: '#ddd6fe' }}>📍 Near Me</Link>
            <Link href="/news" className="nav-pill" style={{ color: 'var(--red)', background: 'var(--red-light)', borderColor: 'var(--red-border)' }}>📈 Price Alerts</Link>
            <Link href="/guides" className="nav-pill" style={{ color: '#0369a1', background: '#f0f9ff', borderColor: '#bae6fd' }}>📚 Budget Guides</Link>
            <a href="https://twitter.com/intent/follow?screen_name=wtgbofficial" target="_blank" rel="noopener noreferrer"
              className="nav-pill" style={{ color: '#0369a1', background: '#f0f9ff', borderColor: '#bae6fd' }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.63L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/>
              </svg>
              @wtgbofficial
            </a>
          </nav>
        </div>

        {/* National Averages */}
        <div className="card" style={{ padding: '20px 22px', marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--red)', letterSpacing: '0.09em', textTransform: 'uppercase' }}>
                National Averages
              </div>
              <div style={{ fontSize: 12, color: 'var(--subtle)', marginTop: 2 }}>
                BLS avg retail price{dataMonth ? ` · ${dataMonth}` : ''} · varies by store &amp; region
              </div>
            </div>
            <Link href="/grocery-prices" style={{
              fontSize: 12, fontWeight: 700, color: 'var(--blue)', textDecoration: 'none',
              display: 'inline-flex', alignItems: 'center', gap: 3,
              padding: '6px 14px', background: 'var(--blue-light)',
              border: '1px solid var(--blue-border)', borderRadius: 20, whiteSpace: 'nowrap',
            }}>By state →</Link>
          </div>

          {/* Email Capture — above fold, before price grid */}
          <div className="price-grid">
            {groceryItems.map((item) => {
              const hasYoy = item.yoyPct != null && item.yoyUp != null
              const pct = hasYoy ? Math.abs(Number(item.yoyPct)).toFixed(0) : null
              return (
                <div key={item.id} style={{
                  background: !hasYoy ? '#fff' : item.yoyUp ? 'var(--red-light)' : '#f0fdf4',
                  border: `1px solid ${!hasYoy ? 'var(--border)' : item.yoyUp ? 'var(--red-border)' : '#bbf7d0'}`,
                  borderRadius: 12, padding: '12px 14px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                    <span style={{ fontSize: 22, lineHeight: 1 }}>{item.emoji}</span>
                    {hasYoy && pct && (
                      <span style={{
                        fontSize: 10, fontWeight: 700,
                        color: item.yoyUp ? 'var(--red)' : 'var(--green)',
                        background: item.yoyUp ? '#fee2e2' : '#dcfce7',
                        padding: '2px 7px', borderRadius: 20, lineHeight: 1.6,
                      }}>{item.yoyUp ? '↑' : '↓'}{pct}% 2yr</span>
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4, lineHeight: 1.3 }}>{item.name}</div>
                  <div style={{
                    fontSize: 22, fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1,
                    color: !hasYoy ? 'var(--text)' : item.yoyUp ? 'var(--red)' : 'var(--green)',
                  }}>
                    {item.price ?? '—'}
                  </div>
                </div>
              )
            })}
          </div>

          <div data-loco-widget style={{ marginTop: 32, marginBottom: 8 }}></div>
        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px solid var(--border)', margin: '8px 0 28px' }} />

        {/* 🎁 Giveaway CTA */}
        <a
          href="https://1mjav.com/?E=JQ%2bhcGmfPo0nZW%2bHDj0eJlRdpCAq4UCy&s1=wtgb-homepage"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'block', marginBottom: 28, padding: '20px 24px',
            background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
            borderRadius: 14, textDecoration: 'none',
            boxShadow: '0 4px 14px rgba(22,163,74,0.35)',
            border: '1px solid #14532d',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ fontSize: 36, lineHeight: 1, flexShrink: 0 }}>🛒</div>
            <div style={{ flex: 1, minWidth: 180 }}>
              <div style={{
                fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
                color: '#bbf7d0', textTransform: 'uppercase', marginBottom: 4,
              }}>Daily Giveaway — Starting April 1st</div>
              <div style={{
                fontSize: 20, fontWeight: 900, color: '#fff',
                lineHeight: 1.2, marginBottom: 4, letterSpacing: '-0.02em',
              }}>Win a $100 Grocery Gift Card</div>
              <div style={{ fontSize: 14, color: '#d1fae5', lineHeight: 1.5 }}>
                One winner every single day. Enter free — takes 30 seconds.
              </div>
            </div>
            <div style={{
              background: '#fff', color: '#16a34a', fontSize: 14, fontWeight: 800,
              padding: '11px 22px', borderRadius: 30, whiteSpace: 'nowrap',
              flexShrink: 0, letterSpacing: '-0.01em',
            }}>
              Enter to Win →
            </div>
          </div>
        </a>

        {/* Articles */}
        <ArticleSection />

      </div>

      {/* ── Market Signals — dark section ── */}
      <div style={{ background: 'var(--navy)', borderTop: '3px solid var(--red)', borderBottom: '3px solid var(--blue)', padding: '32px 16px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <NewsFeed />
        </div>
      </div>

      {/* ── Footer ── */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '20px 16px 40px', textAlign: 'center' }}>
        <div style={{ fontSize: 12, color: 'var(--subtle)', borderTop: '1px solid var(--border)', paddingTop: 20 }}>
          Data: BLS CPI · USDA ERS · Updates weekly ·{' '}
          <a href="https://twitter.com/wtgbofficial" target="_blank" rel="noopener noreferrer"
            style={{ color: 'var(--blue)', textDecoration: 'none' }}>@wtgbofficial</a>
        </div>
      </div>

    </main>
  )
}
