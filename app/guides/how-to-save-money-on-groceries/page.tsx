import type { Metadata } from 'next'
import Link from 'next/link'
import GroceryEmailBanner from '../../components/GroceryEmailBanner'

export const metadata: Metadata = {
  title: 'How to Save Money on Groceries in 2025 | What\'s the Grocery Bill?',
  description: '15 proven strategies to cut your grocery bill — without couponing for hours. Real savings on eggs, meat, produce and more.',
}

export default function HowToSaveMoneyOnGroceries() {
  const tips = [
    { num: '01', title: 'Shop at Aldi or Lidl first', body: 'Discount grocery chains consistently price staples 20–40% below traditional supermarkets. Eggs, milk, bread, produce, and meat are typically the biggest savings. For many households, switching primary stores saves $100–200/month.' },
    { num: '02', title: 'Buy store brand on everything', body: 'Store-brand products are manufactured by the same companies as name brands in most categories. The savings are 15–35% with zero quality difference on staples like canned goods, pasta, flour, frozen vegetables, and dairy.' },
    { num: '03', title: 'Freeze meat when it\'s on sale', body: 'Beef, chicken, and pork go on sale in cycles — typically every 4–6 weeks. When ground beef drops below $4/lb or chicken breasts below $2/lb, buy 2–3 weeks worth and freeze. Most meat keeps 3–6 months frozen without quality loss.' },
    { num: '04', title: 'Eat more eggs and legumes', body: 'Even at $4.80/dozen, eggs remain one of the cheapest proteins per gram available. Lentils, beans, and chickpeas are even cheaper. Replacing one meat dinner per week with legumes saves $15–30/month for a family of four.' },
    { num: '05', title: 'Use the store app for digital coupons', body: 'Kroger, Safeway, Albertsons, and most major chains offer digital coupons through their apps. These are often 20–50% off specific items. Takes 2 minutes to clip before shopping — easily saves $10–20/trip.' },
    { num: '06', title: 'Buy produce in season', body: 'Out-of-season produce can cost 3–5× more than in-season. Strawberries in January vs June. Tomatoes in winter vs summer. Plan meals around what\'s in season for the biggest produce savings.' },
    { num: '07', title: 'Don\'t shop hungry', body: 'Studies consistently show shoppers buy 15–25% more — and more impulsively — when shopping on an empty stomach. Eat before you go. Bring a list. Stick to it.' },
    { num: '08', title: 'Buy whole chickens instead of parts', body: 'A whole chicken at $1.50/lb yields the same meat as chicken breasts at $3.50/lb, plus bones for stock. Roast whole, use leftovers for 2–3 meals, make stock from the carcass. One $8 chicken = 4+ servings.' },
  ]

  return (
    <main style={{ background: '#0c1409', minHeight: '100vh', color: 'white' }}>
      <div style={{ maxWidth: 780, margin: '0 auto', padding: '40px 20px' }}>
        <Link href="/guides" style={{ color: '#4ade80', fontSize: 13, textDecoration: 'none' }}>← Back to Guides</Link>

        <div style={{ fontSize: 12, fontWeight: 600, color: '#4ade80', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '16px 0 10px' }}>
          Grocery Savings Guide
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 900, lineHeight: 1.2, marginBottom: 12, color: '#f0fdf4' }}>
          How to Save Money on Groceries in 2025
        </h1>
        <p style={{ color: '#9ca3af', fontSize: 15, marginBottom: 32, lineHeight: 1.6 }}>
          The average American family spends <strong style={{ color: '#fbbf24' }}>$1,000–1,500/month</strong> on groceries. With food inflation still elevated, these 8 strategies can cut your bill by 20–30% without spending hours couponing.
        </p>

        <GroceryEmailBanner />

        <div style={{ marginTop: 32 }}>
          {tips.map((tip) => (
            <div key={tip.num} style={{
              display: 'flex', gap: 20, marginBottom: 28,
              paddingBottom: 28, borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: 'rgba(74,222,128,0.2)', minWidth: 40, lineHeight: 1 }}>
                {tip.num}
              </div>
              <div>
                <h2 style={{ fontSize: 17, fontWeight: 800, color: '#f0fdf4', marginBottom: 8 }}>{tip.title}</h2>
                <p style={{ color: '#9ca3af', lineHeight: 1.7, margin: 0 }}>{tip.body}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.15)', borderRadius: 12, padding: '20px 24px', marginBottom: 32 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#4ade80', marginBottom: 8 }}>💡 The bottom line</div>
          <p style={{ color: '#d1d5db', lineHeight: 1.7, margin: 0 }}>
            Switching your primary grocery store, buying store brand, and freezing sale items are the three highest-ROI changes most households can make. Combined, they typically save $150–300/month for a family of four — without changing what you eat.
          </p>
        </div>

        <GroceryEmailBanner />

        <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Link href="/guides/why-are-egg-prices-so-high" style={{ color: '#4ade80', fontSize: 13, textDecoration: 'none' }}>→ Why Are Egg Prices So High?</Link>
          <Link href="/guides/cheapest-grocery-stores-compared" style={{ color: '#4ade80', fontSize: 13, textDecoration: 'none' }}>→ Cheapest Grocery Stores Compared</Link>
          <Link href="/grocery-prices" style={{ color: '#4ade80', fontSize: 13, textDecoration: 'none' }}>→ Grocery Prices by State</Link>
        </div>
      </div>
    </main>
  )
}
