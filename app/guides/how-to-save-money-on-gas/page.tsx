import type { Metadata } from 'next'
import GasPricesEmailBanner from '../../components/GasPricesEmailBanner'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'How to Save Money on Gas: 12 Proven Ways',
  description: 'From warehouse club memberships to driving habits, here are 12 ways to cut your gas bill — with real dollar estimates on how much each strategy saves.',
  openGraph: {
    title: 'How to Save Money on Gas: 12 Proven Ways',
    description: 'Costco vs. brand stations, credit card rewards, tire pressure, and more — with actual dollar savings estimates.',
  },
}

const TIPS = [
  {
    rank: 1,
    title: 'Buy Gas at Costco or Sam\'s Club',
    savings: '$200–500/yr',
    savingsColor: '#22c55e',
    body: `Warehouse clubs consistently beat market prices by 10–25¢/gallon. Costco's fuel pricing policy is to undercut the local market average — it's a membership benefit, not a profit center. On a 15-gallon weekly fill-up at 20¢ savings, that's $156/year. Heavier drivers save more.

The math on membership: Costco Executive ($130/yr) pays you 2% cash back on all Costco purchases. Most members who buy gas there cover the membership fee on fuel savings alone. Sam's Club Plus ($110/yr) is similar.`,
    link: '/grocery-prices/sams-club',
    linkLabel: "Find Sam's Club prices near you",
  },
  {
    rank: 2,
    title: 'Use a Gas Rewards Credit Card',
    savings: '$100–400/yr',
    savingsColor: '#22c55e',
    body: `The best gas credit cards return 4–5% cash back on fuel purchases. The Costco Anywhere Visa (Citi) gives 4% back on gas at all stations, up to $7,000/year. The Sam's Club Mastercard offers 5% back at Sam's Club gas.

The average American spends ~$2,500/year on gas. At 4% back, that's $100/year. At 5%, $125. Stack this with warehouse club pricing and you're looking at 25–35¢ effective savings per gallon.`,
    link: null,
    linkLabel: null,
  },
  {
    rank: 3,
    title: 'Use Instacart or Our State Tracker Before Every Fill-Up',
    savings: '$50–200/yr',
    savingsColor: '#3b82f6',
    body: `Price variation within a single zip code can be 20–40¢/gallon. A 5-minute check before a fill-up can save $3–6 per tank. Across 50 fill-ups a year, that's $150–300. The catch: only go out of your way if the cheaper station doesn't require a significant detour — you'll burn the savings in extra miles.

Rule of thumb: don't drive more than 0.5 miles out of your way per 5¢ of savings on a typical 12-gallon fill-up.`,
    link: '/grocery-prices',
    linkLabel: 'Check live prices by state',
  },
  {
    rank: 4,
    title: 'Keep Your Tires Properly Inflated',
    savings: '$50–150/yr',
    savingsColor: '#3b82f6',
    body: `Underinflated tires increase rolling resistance, which forces the engine to work harder. The EPA estimates you can improve gas mileage by up to 0.5–3% by keeping tires at the recommended pressure. On a vehicle getting 28 MPG burning $3.50 gas, that's $35–210/year depending on miles driven.

Check pressure monthly (or when temperatures drop — tires lose ~1 PSI per 10°F temperature decrease). Find your vehicle's recommended pressure on the door jamb sticker, not the max pressure on the tire itself.`,
    link: null,
    linkLabel: null,
  },
  {
    rank: 5,
    title: 'Slow Down on the Highway',
    savings: '$150–400/yr',
    savingsColor: '#22c55e',
    body: `Aerodynamic drag increases with the square of speed. Going 75 MPH instead of 65 MPH uses roughly 15–20% more fuel. Going 80 MPH vs 65 MPH: ~25% more.

If you drive 15,000 miles/year at an average 50/50 city/highway split, and reduce average highway speed from 77 to 67 MPH, you might save 1.5–2 MPG. At $3.50/gallon and 28 MPG baseline: $168/year. The time cost: about 4 minutes per 50-mile highway stretch. Usually worth it.`,
    link: null,
    linkLabel: null,
  },
  {
    rank: 6,
    title: 'Stop Idling',
    savings: '$50–100/yr',
    savingsColor: '#3b82f6',
    body: `Idling gets 0 MPG. A typical car burns 0.2–0.5 gallons per hour at idle. If you idle 30 minutes/day (drive-through, parking, warming up in winter), that's 36–90 gallons/year wasted — $126–315 at $3.50/gal.

Modern fuel-injected engines don't need more than 30 seconds to warm up, even in cold weather. Turn the engine off if you'll be stopped more than 60 seconds. Many newer cars do this automatically (stop-start systems).`,
    link: null,
    linkLabel: null,
  },
  {
    rank: 7,
    title: 'Fill Up on Tuesday or Wednesday',
    savings: '$15–40/yr',
    savingsColor: '#64748b',
    body: `Grocery Prices follow a weekly cycle. They typically rise Thursday–Saturday as refiners and distributors anticipate weekend demand. Monday and Tuesday tend to be the cheapest days of the week nationally, according to Instacart's multi-year analysis.

The average Tuesday-vs-Saturday differential is about 3–7¢/gallon. On a 15-gallon weekly fill-up, that's $2–4 savings/week, or $100–200/year if you're consistent. Lower impact than other strategies but zero effort cost.`,
    link: null,
    linkLabel: null,
  },
  {
    rank: 8,
    title: 'Buy Regular Unless Your Car Requires Premium',
    savings: '$200–500/yr',
    savingsColor: '#22c55e',
    body: `Premium gas (91+ octane) costs roughly 50–80¢ more per gallon than regular (87 octane). If your car's manufacturer says "premium recommended" (not required), you can use regular without harming the engine — the ECU will adjust timing. You'll lose 1–3% performance, which most drivers never notice.

Only use premium if the manual says "required." If it says "recommended," test regular for a tank — if you don't notice any knocking, you're fine. Savings: $156–312/year on a 15-gallon weekly fill-up.`,
    link: null,
    linkLabel: null,
  },
  {
    rank: 9,
    title: 'Use Fuel Reward Programs',
    savings: '$30–100/yr',
    savingsColor: '#64748b',
    body: `Kroger, Safeway, Giant, and other grocery chains offer fuel reward points — typically 1 point per $1 spent, redeemable for 10¢/gallon discounts (100 points = 10¢/gal). Loyal grocery shoppers can easily accumulate 20–40¢/gallon discounts regularly.

Shell, BP, and Exxon/Mobil also have loyalty apps. Exxon's Mobil Rewards+ gives ~3¢/gal back on purchases. Small individually but worth stacking — you're already buying gas there anyway.`,
    link: null,
    linkLabel: null,
  },
  {
    rank: 10,
    title: 'Remove Unnecessary Weight',
    savings: '$20–60/yr',
    savingsColor: '#64748b',
    body: `Every 100 lbs of extra weight reduces fuel economy by about 1%. If you're hauling a roof cargo box (40–50 lbs plus massive aerodynamic drag), golf clubs, tools, or sports equipment year-round, you're paying for it in fuel.

The cargo box is the biggest offender. A roof box at highway speeds can reduce MPG by 5–25% depending on shape and speed. Remove it when not in use. Similarly, a full truck bed of junk (200 lbs) costs roughly 2% fuel economy year-round.`,
    link: null,
    linkLabel: null,
  },
  {
    rank: 11,
    title: 'Combine Trips and Plan Routes',
    savings: '$100–300/yr',
    savingsColor: '#3b82f6',
    body: `Cold engine starts use significantly more fuel — a short trip from a cold start burns 3–4× the fuel per mile vs. a warm engine. Combining errands into one trip (instead of three separate trips) meaningfully cuts consumption.

Use Google Maps, Waze, or Apple Maps to route around traffic. Sitting in stop-and-go adds time AND dramatically reduces fuel economy. A 20-minute route with free-flowing traffic almost always beats a 15-minute route with heavy congestion.`,
    link: null,
    linkLabel: null,
  },
  {
    rank: 12,
    title: 'Check Air Filter and Spark Plugs',
    savings: '$50–150/yr',
    savingsColor: '#64748b',
    body: `A clogged air filter can reduce fuel economy by up to 10% on older carbureted vehicles (less impact on modern fuel-injected cars, but still worth checking). Fouled spark plugs cause incomplete combustion, burning more fuel for less power.

Air filter replacement: $15–30 DIY, 10 minutes. Spark plugs (standard): $20–60 for most cars, every 30,000 miles. These are basic maintenance items that pay for themselves in fuel savings within a few tanks if they've been neglected.`,
    link: null,
    linkLabel: null,
  },
]

export default function HowToSaveMoneyOnGas() {
  return (
    <main style={{ minHeight: '100vh', background: '#0b0d14', color: '#f1f5f9' }}>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '32px 20px 80px' }}>

        {/* Breadcrumb */}
        <div style={{ marginBottom: 32, display: 'flex', gap: 8, fontSize: 13, color: '#475569' }}>
          <Link href="/" style={{ color: '#64748b', textDecoration: 'none' }}>Home</Link>
          <span>›</span>
          <Link href="/guides" style={{ color: '#64748b', textDecoration: 'none' }}>Guides</Link>
          <span>›</span>
          <span style={{ color: '#94a3b8' }}>How to Save Money on Gas</span>
        </div>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{
              fontSize: 11, fontWeight: 700, color: '#22c55e',
              background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)',
              borderRadius: 20, padding: '2px 10px', textTransform: 'uppercase', letterSpacing: '0.05em',
            }}>Consumer Guide</span>
            <span style={{ fontSize: 12, color: '#475569' }}>7 min read</span>
          </div>
          <h1 style={{ margin: '0 0 16px', fontSize: 34, fontWeight: 800, lineHeight: 1.2, color: '#f8fafc' }}>
            How to Save Money on Gas: 12 Proven Ways
          </h1>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: 16, lineHeight: 1.7 }}>
            Grocery Prices are mostly out of your control. But how much gas you buy — and how much you pay
            per gallon — isn&apos;t. These 12 strategies, stacked together, can save the average driver
            $400–1,200/year without changing where they go.
          </p>
        </div>

        {/* Quick wins box */}
        <div style={{
          background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.15)',
          borderRadius: 12, padding: '20px 24px', marginBottom: 40,
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#22c55e', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            🏆 The 3 Highest-Impact Actions
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { n: 1, text: 'Get a Costco or Sam\'s Club membership and buy all gas there', save: '$200–500/yr' },
              { n: 2, text: 'Use a 4–5% cash back gas credit card on top of that', save: '$100–400/yr' },
              { n: 3, text: 'Slow down 8–10 MPH on the highway', save: '$150–400/yr' },
            ].map(item => (
              <div key={item.n} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: '#22c55e', width: 20 }}>{item.n}.</span>
                  <span style={{ fontSize: 14, color: '#cbd5e1' }}>{item.text}</span>
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#22c55e', flexShrink: 0 }}>{item.save}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(34,197,94,0.1)', fontSize: 13, color: '#475569' }}>
            Combined max potential: <strong style={{ color: '#22c55e' }}>~$1,300/yr</strong> for a driver filling up 15 gal/week
          </div>
        </div>

        {/* Tips */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          {TIPS.map(tip => (
            <div key={tip.rank} style={{
              borderLeft: '3px solid rgba(255,255,255,0.08)',
              paddingLeft: 24,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, gap: 12, flexWrap: 'wrap' }}>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#f1f5f9' }}>
                  <span style={{ color: '#475569', marginRight: 8 }}>{tip.rank}.</span>
                  {tip.title}
                </h2>
                <span style={{
                  fontSize: 13, fontWeight: 800, color: tip.savingsColor,
                  background: `${tip.savingsColor}15`,
                  border: `1px solid ${tip.savingsColor}30`,
                  borderRadius: 6, padding: '3px 10px', flexShrink: 0,
                }}>
                  {tip.savings}
                </span>
              </div>
              <div style={{ fontSize: 15, color: '#94a3b8', lineHeight: 1.75 }}>
                {tip.body.split('\n\n').map((para, i) => (
                  <p key={i} style={{ margin: '0 0 12px' }}>{para}</p>
                ))}
              </div>
              {tip.link && (
                <Link href={tip.link} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  fontSize: 13, fontWeight: 600, color: '#3b82f6', textDecoration: 'none',
                  marginTop: 4,
                }}>
                  → {tip.linkLabel}
                </Link>
              )}
            </div>
          ))}
        </div>

        
        {/* Email CTA — mid content */}
        <div style={{ margin: '40px 0' }}><GasPricesEmailBanner /></div>

        {/* Summary table */}
        <div style={{
          background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 12, overflow: 'hidden', marginTop: 48, marginBottom: 32,
        }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)', fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'grid', gridTemplateColumns: '1fr auto' }}>
            <span>Strategy</span><span>Est. Annual Savings</span>
          </div>
          {TIPS.map((tip, i) => (
            <div key={tip.rank} style={{
              display: 'grid', gridTemplateColumns: '1fr auto',
              padding: '10px 20px', alignItems: 'center',
              borderBottom: i < TIPS.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
              background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
            }}>
              <span style={{ fontSize: 13, color: '#cbd5e1' }}>
                <span style={{ color: '#475569', marginRight: 8 }}>{tip.rank}.</span>{tip.title}
              </span>
              <span style={{ fontSize: 13, fontWeight: 700, color: tip.savingsColor }}>{tip.savings}</span>
            </div>
          ))}
        </div>

        {/* Related */}
        <div style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#475569', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Related Guides
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { href: '/guides/what-determines-gas-prices', title: 'What Determines Grocery Prices?', desc: 'Understand the forces behind price changes so you can anticipate them.' },
              { href: '/guides/gas-tax-by-state', title: 'Gas Tax by State (2025)', desc: 'Some states are dramatically cheaper. Know the numbers if you drive near a border.' },
              { href: '/grocery-prices/sams-club', title: "Sam's Club Grocery Prices", desc: "Live Sam's Club Grocery Prices — find your nearest location." },
            ].map(r => (
              <Link key={r.href} href={r.href} style={{
                textDecoration: 'none', background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: '14px 18px',
              }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#f1f5f9', marginBottom: 4 }}>{r.title}</div>
                <div style={{ fontSize: 13, color: '#64748b' }}>{r.desc}</div>
              </Link>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 32 }}>
          <Link href="/grocery-prices" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            fontSize: 14, fontWeight: 600, color: '#22c55e', textDecoration: 'none',
            background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)',
            borderRadius: 8, padding: '10px 18px',
          }}>
            🗺 Find the Cheapest Gas in Your State →
          </Link>
        </div>
      </div>
    </main>
  )
}
