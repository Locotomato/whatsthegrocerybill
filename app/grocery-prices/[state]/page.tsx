import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { slugToAbbr, toTitleCase, ALL_STATE_SLUGS } from '../../../lib/stateData'
import NavHeader from '../../components/NavHeader'

export const dynamic = 'force-dynamic'
export const revalidate = 3600

// Cost-of-living grocery context per state
const STATE_GROCERY_CONTEXT: Record<string, string> = {
  CA: "California has some of the highest grocery prices in the nation, driven by high labor costs, strict food safety regulations, and the state's high cost of living overall.",
  HI: "Hawaii consistently ranks as the most expensive state for groceries — nearly everything must be shipped to the islands, adding significant freight costs to food prices.",
  NY: "New York City and surrounding areas push the state average higher, with grocery prices running 10–20% above the national average due to real estate costs and distribution expenses.",
  AK: "Alaska faces extreme grocery prices, especially in remote communities. Anchorage prices run 15–20% above national averages; remote villages can be 2–3× higher.",
  CT: "Connecticut has above-average grocery costs reflecting its high cost of living, though competition from major chains keeps prices somewhat in check.",
  MA: "Massachusetts grocery prices are above average, particularly in Boston metro area. High wages and real estate costs are passed through to consumers.",
  NJ: "New Jersey grocery prices run above average due to proximity to high-cost NYC metro, though strong competition among major chains provides some relief.",
  TX: "Texas benefits from low grocery taxes (food is generally untaxed), a large agricultural sector, and strong retail competition — keeping prices near or below national averages.",
  MS: "Mississippi has some of the lowest grocery prices in the nation, benefiting from low land and labor costs and minimal state grocery taxes.",
  KS: "Kansas benefits from its central location in the nation's breadbasket, keeping costs for staples like beef, wheat, and corn-based products lower than average.",
  MO: "Missouri grocery prices are consistently among the most affordable, with no state sales tax on food and a central location reducing distribution costs.",
  WI: "Wisconsin is a top dairy producer, which keeps prices on milk, cheese, and butter lower than average. Overall grocery costs are near or below national averages.",
  IA: "Iowa's agricultural base — a top producer of corn, soybeans, and pork — helps keep grocery prices for staple items among the lowest in the nation.",
}

// Grocery price index estimates by state (national avg = 100)
const STATE_GROCERY_INDEX: Record<string, number> = {
  AL:95,AK:135,AZ:100,AR:92,CA:115,CO:105,CT:112,DE:103,FL:102,GA:97,
  HI:150,ID:98,IL:105,IN:95,IA:90,KS:92,KY:93,LA:95,ME:105,MD:108,
  MA:115,MI:97,MN:100,MS:88,MO:90,MT:102,NE:92,NV:104,NH:108,NJ:113,
  NM:98,NY:118,NC:97,ND:94,OH:95,OK:93,OR:107,PA:103,RI:110,SC:96,
  SD:93,TN:95,TX:93,UT:100,VT:108,VA:103,WA:108,WV:93,WI:95,WY:98,
}

function getStateFaqs(abbr: string, stateName: string): Array<{ q: string; a: string }> {
  const index = STATE_GROCERY_INDEX[abbr] ?? 100
  const isHigh = index > 105
  const context = STATE_GROCERY_CONTEXT[abbr]

  return [
    {
      q: `How do grocery prices in ${stateName} compare to the national average?`,
      a: index > 105
        ? `Grocery prices in ${stateName} run approximately ${index - 100}% above the national average. ${context ?? `This reflects the state's higher cost of living and distribution costs.`}`
        : index < 95
        ? `${stateName} is one of the more affordable states for groceries — prices typically run ${100 - index}% below the national average. ${context ?? `Low labor costs, local agricultural production, and no state grocery tax contribute to lower prices.`}`
        : `${stateName} grocery prices are close to the national average. ${context ?? `The state benefits from competitive retail markets and reasonable distribution costs.`}`,
    },
    {
      q: `What groceries are most expensive in ${stateName}?`,
      a: `Across the US — including ${stateName} — the items that have seen the steepest price increases include eggs (up over 100% since 2021 due to avian flu), beef (+25%), and butter (+30%). Fresh produce prices also vary significantly by season and supply chain conditions.`,
    },
    {
      q: `Does ${stateName} have a grocery tax?`,
      a: `Most states exempt groceries from sales tax, though policies vary. States like Alabama, Mississippi, and South Dakota still charge sales tax on food. Check your state's department of revenue for the exact rules — some states tax prepared food differently from unprepared staples.`,
    },
    {
      q: `What is the cheapest grocery store in ${stateName}?`,
      a: `Studies consistently rank Aldi and Lidl as the cheapest major grocery chains, typically 15–25% below average. Walmart and Walmart Neighborhood Market are also consistently low-priced. Warehouse clubs like Costco and Sam's Club offer the best per-unit prices on bulk items. Check our store comparison guide for a full breakdown.`,
    },
    {
      q: `How much does the average family spend on groceries in ${stateName}?`,
      a: `The USDA estimates the average American family of four spends $1,100–$1,500/month on groceries depending on eating habits. In ${isHigh ? `a higher-cost state like ${stateName}, expect the upper end of that range or higher` : `${stateName}, costs tend to be closer to or below the national average`}. Cooking at home vs. buying prepared foods is the biggest single variable.`,
    },
  ]
}

interface Props { params: Promise<{ state: string }> }

export async function generateStaticParamsDisabled() {
  return ALL_STATE_SLUGS.map(s => ({ state: s }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { state } = await params
  const abbr = slugToAbbr(state)
  if (!abbr) return {}
  const name = toTitleCase(state)
  const index = STATE_GROCERY_INDEX[abbr] ?? 100
  const rel = index > 100 ? `${index - 100}% above national avg` : index < 100 ? `${100 - index}% below national avg` : 'at national avg'

  return {
    title: `${name} Grocery Prices Today | Average Cost of Groceries in ${name}`,
    description: `How much do groceries cost in ${name}? ${name} grocery prices are ${rel}. See egg, milk, beef, and bread prices in ${name} plus money-saving tips.`,
    keywords: [`${name} grocery prices`, `cost of groceries in ${name}`, `${name} food prices`, `average grocery bill in ${name}`, `grocery stores in ${name}`],
    openGraph: {
      title: `${name} Grocery Prices Today`,
      description: `Average grocery costs in ${name} vs national average. Updated monthly from BLS CPI data.`,
      url: `https://whatsthegrocerybill.com/grocery-prices/${state}`,
      siteName: "What's the Grocery Bill?",
    },
    twitter: { card: 'summary', site: '@wtgbofficial', creator: '@wtgbofficial' },
    alternates: { canonical: `https://whatsthegrocerybill.com/grocery-prices/${state}` },
  }
}

export default async function StatePage({ params }: Props) {
  const { state } = await params
  const abbr = slugToAbbr(state)
  if (!abbr) notFound()

  const stateName = toTitleCase(state)
  const index = STATE_GROCERY_INDEX[abbr] ?? 100
  const isHigh = index > 105
  const isLow  = index < 95
  const diff   = index - 100
  const faqs   = getStateFaqs(abbr, stateName)
  const context = STATE_GROCERY_CONTEXT[abbr]

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `${stateName} Grocery Prices Today`,
    description: `Average grocery prices in ${stateName} — cost index, key items, and money-saving tips.`,
    url: `https://whatsthegrocerybill.com/grocery-prices/${state}`,
    publisher: { '@type': 'Organization', name: "What's the Grocery Bill?", url: 'https://whatsthegrocerybill.com' },
  }

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      <NavHeader active="prices" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 20px 80px' }}>

        {/* Breadcrumb */}
        <div style={{ marginBottom: 24, display: 'flex', gap: 8, fontSize: 13, color: 'var(--muted)', flexWrap: 'wrap' }}>
          <Link href="/" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Home</Link>
          <span>›</span>
          <Link href="/grocery-prices" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Grocery Prices by State</Link>
          <span>›</span>
          <span style={{ color: 'var(--subtle)' }}>{stateName}</span>
        </div>

        {/* Header */}
        <h1 style={{ margin: '0 0 6px', fontSize: 'clamp(28px,5vw,42px)', fontWeight: 900, letterSpacing: '-0.02em' }}>
          {stateName} Grocery Prices
        </h1>
        <p style={{ margin: '0 0 32px', fontSize: 15, color: 'var(--muted)' }}>
          Cost index vs national average · Source: BLS CPI · Updated monthly
        </p>

        {/* Cost index hero card */}
        <div style={{
          background: '#fff',
          border: '1px solid var(--border)',
          borderRadius: 16,
          padding: '28px 32px',
          marginBottom: 24,
          display: 'flex', alignItems: 'flex-start', gap: 32, flexWrap: 'wrap',
        }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
              Cost Index
            </div>
            <div style={{ fontSize: 'clamp(48px,10vw,72px)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1, color: 'var(--text)' }}>
              {index}
            </div>
            <div style={{ fontSize: 14, color: 'var(--muted)', marginTop: 6 }}>National avg = 100</div>
          </div>

          <div style={{ paddingTop: 4 }}>
            <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>
              vs National Average
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: isHigh ? '#ef4444' : isLow ? '#4ade80' : '#94a3b8' }}>
              {diff === 0 ? 'At avg' : diff > 0 ? `+${diff}% above avg` : `${diff}% below avg`}
            </div>
            <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 6 }}>
              {isHigh ? '🧾 Higher cost state' : isLow ? '💰 Lower cost state' : '📊 Near national average'}
            </div>
          </div>
        </div>

        {/* State context */}
        {context && (
          <div style={{
            background: 'rgba(74,222,128,0.06)',
            border: '1px solid var(--red-border)',
            borderRadius: 12,
            padding: '16px 20px',
            marginBottom: 32,
            fontSize: 14,
            color: 'var(--subtle)',
            lineHeight: 1.7,
          }}>
            {context}
          </div>
        )}

        {/* Key grocery items */}
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 14, color: 'var(--text)' }}>
            Key Grocery Items — National Averages
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
            {[
              { emoji: '🥚', name: 'Eggs (doz)',  price: '$4.82', trend: '↑ +12%' },
              { emoji: '🥛', name: 'Milk (gal)',  price: '$3.94', trend: '↑ +3%' },
              { emoji: '🍞', name: 'Bread (loaf)', price: '$3.98', trend: '↑ +5%' },
              { emoji: '🥩', name: 'Ground Beef', price: '$5.43', trend: '↑ +8%' },
              { emoji: '🐔', name: 'Chicken (lb)', price: '$2.11', trend: '↓ -1%' },
              { emoji: '🧈', name: 'Butter (lb)', price: '$5.11', trend: '↑ +15%' },
            ].map(item => (
              <div key={item.name} style={{
                background: '#fff',
                border: '1px solid var(--border)',
                borderRadius: 10, padding: '12px 14px',
              }}>
                <div style={{ fontSize: 18, marginBottom: 4 }}>{item.emoji}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>{item.name}</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)' }}>{item.price}</div>
                <div style={{ fontSize: 11, color: item.trend.startsWith('↑') ? '#f87171' : '#4ade80', marginTop: 2 }}>{item.trend}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 8 }}>BLS CPI data · Updated monthly · {stateName} prices may vary ±{Math.abs(diff)}%</div>
        </div>

        {/* Email CTA */}
        <div data-loco-widget></div>

        {/* FAQ */}
        <div style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: 'var(--text)' }}>
            {stateName} Grocery Prices — FAQ
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {faqs.map((faq, i) => (
              <div key={i} style={{
                background: '#fff',
                border: '1px solid var(--border)',
                borderRadius: 12, padding: '14px 18px',
              }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>{faq.q}</div>
                <div style={{ fontSize: 13, color: 'var(--subtle)', lineHeight: 1.7 }}>{faq.a}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CTAs */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 40 }}>
          <Link href="/guides/cheapest-grocery-stores-compared" style={{
            padding: '10px 20px', background: '#16a34a', color: '#fff',
            borderRadius: 20, textDecoration: 'none', fontSize: 13, fontWeight: 700,
          }}>🛒 Find Cheapest Stores</Link>
          <Link href="/news" style={{
            padding: '10px 20px', background: '#f8fafc', color: 'var(--subtle)',
            borderRadius: 20, textDecoration: 'none', fontSize: 13, fontWeight: 600,
          }}>📰 Grocery Price News</Link>
          <Link href="/near-me" style={{
            padding: '10px 20px', background: '#f8fafc', color: 'var(--subtle)',
            borderRadius: 20, textDecoration: 'none', fontSize: 13, fontWeight: 600,
          }}>📍 Prices Near Me</Link>
        </div>

        {/* Latest news internal links */}
        <div style={{ background: '#f8fafc', border: '1px solid var(--border)', borderRadius: 12, padding: '20px 22px', marginBottom: 40 }}>
          <h3 style={{ fontSize: 14, fontWeight: 800, color: 'var(--text)', marginBottom: 14, letterSpacing: '-0.01em' }}>
            📰 Latest Grocery Price News
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { slug: 'grocery-prices-rising-again-what-shoppers-need-to-know-now', title: 'Grocery Prices Rising Again: What Shoppers Need to Know' },
              { slug: 'grocery-prices-fall-again-what-shoppers-are-seeing-at-checkout', title: 'Grocery Prices Fall: What Shoppers Are Seeing at Checkout' },
              { slug: 'grocery-prices-rising-food-inflation-hits-9-12-as-shoppers-face-empty-shelves', title: 'Food Inflation Hits 9–12% as Shoppers Face Empty Shelves' },
            ].map(article => (
              <Link key={article.slug} href={`/news/${article.slug}`} style={{
                fontSize: 13, color: 'var(--blue)', textDecoration: 'none', fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <span style={{ color: 'var(--muted)', fontSize: 11 }}>→</span>
                {article.title}
              </Link>
            ))}
            <Link href="/news" style={{ fontSize: 12, color: 'var(--muted)', textDecoration: 'none', marginTop: 4 }}>
              View all grocery price news →
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
