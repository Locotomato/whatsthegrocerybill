export interface ClubData {
  slug: string
  name: string
  shortName: string
  membership: string
  membershipCost: string
  savingsLow: number      // % savings vs national average (low estimate)
  savingsHigh: number     // % savings vs national average (high estimate)
  weeklyCartSavings: number  // estimated weekly savings in dollars on a $150 cart
  requiresMembership: boolean
  membershipTiers?: string[]
  storesCount: string
  statesAvailable: string
  notes: string[]
  faqs: { q: string; a: string }[]
  whyCheaper: string
  keyItems: string[]      // items they're known for being cheap on
  metaDescription: string
}

export const CLUBS: Record<string, ClubData> = {
  'sams-club': {
    slug: 'sams-club',
    name: "Sam's Club",
    shortName: "Sam's",
    membership: "Sam's Club Membership",
    membershipCost: '$50–$110/year',
    savingsLow: 15,
    savingsHigh: 30,
    weeklyCartSavings: 28,
    requiresMembership: true,
    membershipTiers: [
      "Club ($50/year) — standard warehouse access",
      "Plus ($110/year — 2% cashback on purchases, free shipping, early shopping hours)",
    ],
    notes: [
      'Buy in bulk to maximize per-unit savings',
      'Member prices on fresh produce, meat, and dairy are typically 20–30% below retail',
      'Scan & Go app lets you skip the checkout line',
      'Instant Savings events rotate monthly — check before your trip',
    ],
    whyCheaper: "Sam's Club is a warehouse membership club owned by Walmart. They buy in enormous volume and pass per-unit savings to members. They also sell under private-label Member's Mark brand — often 20–35% cheaper than name brands for equivalent quality. The membership fee funds operations so they don't need to mark up food as heavily as traditional grocers.",
    keyItems: ['Ground beef', 'Chicken breast', 'Eggs', 'Milk', 'Butter', 'Cooking oil', 'Snacks & chips', 'Frozen meals'],
    statesAvailable: '44 states',
    storesCount: '600+ warehouse locations',
    faqs: [
      {
        q: "Is Sam's Club cheaper than regular grocery stores?",
        a: "Yes, typically 15–30% cheaper per unit on most grocery items when you buy in bulk. Staples like eggs, milk, meat, and butter are usually significantly cheaper than at traditional supermarkets. The $50/year Club membership breaks even after just a few shopping trips.",
      },
      {
        q: "What are the cheapest items at Sam's Club?",
        a: "Sam's Club offers the best savings on: eggs (often the cheapest per dozen in your area), chicken breast, ground beef, butter, cooking oil, cheese, frozen vegetables, snacks, and Member's Mark private-label products.",
      },
      {
        q: "Do you need a membership to shop at Sam's Club?",
        a: "Yes. A Sam's Club membership is required to shop in-store. The Club tier is $50/year and the Plus tier is $110/year. You can also shop online as a non-member but you'll pay a 10% surcharge. The membership typically pays for itself within 2–3 grocery trips.",
      },
      {
        q: "How does Sam's Club compare to Costco for groceries?",
        a: "Sam's Club is generally slightly cheaper than Costco on staple groceries, and the base membership ($50 vs Costco's $65) is lower. Costco has an edge on some specialty items and its Kirkland Signature brand is highly regarded. Both offer significant savings over traditional supermarkets.",
      },
      {
        q: "Can I shop Sam's Club without buying in bulk?",
        a: "Most Sam's Club items come in bulk packaging. Some fresh items like produce, bread, and prepared foods are sold in smaller quantities. The bulk format gives you the best per-unit price — just make sure you can use it before it expires.",
      },
    ],
    metaDescription: "Sam's Club grocery prices are typically 15–30% cheaper than traditional grocery stores. See how much members save on eggs, meat, dairy, and more. Membership from $50/year.",
  },

  'costco': {
    slug: 'costco',
    name: 'Costco',
    shortName: 'Costco',
    membership: 'Costco Membership',
    membershipCost: '$65–$130/year',
    savingsLow: 15,
    savingsHigh: 30,
    weeklyCartSavings: 30,
    requiresMembership: true,
    membershipTiers: [
      'Gold Star ($65/year) — standard warehouse access',
      'Executive ($130/year — 2% annual reward on purchases, extra discounts)',
    ],
    notes: [
      'Kirkland Signature brand rivals or beats name brands at 20–40% lower price',
      'Rotisserie chicken is famously $4.99 regardless of inflation',
      'Executive members earn 2% back — at $3,250+ annual spend, it covers the membership fee',
      'Costco app shows current prices and Instant Savings deals',
    ],
    whyCheaper: "Costco operates on a near-zero retail margin — they make almost all their profit from membership fees. This allows them to sell grocery items at or near cost, sometimes below. Their Kirkland Signature private label is manufactured by the same suppliers as top name brands (often the exact same product) but sold at a fraction of the price. Volume buying power and streamlined logistics keep costs down further.",
    keyItems: ['Rotisserie chicken', 'Kirkland organic eggs', 'Salmon', 'Butter', 'Olive oil', 'Nuts & trail mix', 'Cheese', 'Wine'],
    statesAvailable: 'all 50 states',
    storesCount: '590+ warehouse locations',
    faqs: [
      {
        q: "Is Costco the cheapest place to buy groceries?",
        a: "Costco is consistently among the cheapest for bulk grocery staples. Studies show Costco can be 15–30% cheaper than traditional supermarkets on comparable items. The Kirkland Signature brand specifically often undercuts even store brands at competitors while maintaining high quality.",
      },
      {
        q: "What groceries are cheapest at Costco?",
        a: "Costco's best grocery deals include: rotisserie chicken ($4.99 — a famous loss leader), organic eggs, wild-caught salmon, Kirkland butter, olive oil, coffee, nuts, dried fruit, cheese, and fresh produce. The per-unit price on most packaged goods beats standard grocery stores.",
      },
      {
        q: "Is the Costco Executive membership worth it for groceries?",
        a: "The Executive membership ($130/year) pays for itself if you spend $3,250+/year at Costco through the 2% reward. For a family of four doing regular grocery shopping, this threshold is usually easy to hit. You'd receive $65 back, making your net membership cost $65 — same as the base Gold Star.",
      },
      {
        q: "Does Costco accept EBT/SNAP for groceries?",
        a: "Yes. Costco accepts EBT/SNAP cards for eligible food items at all US warehouse locations. Note: you still need a paid membership to shop — the EBT card only covers qualifying food purchases.",
      },
      {
        q: "How does Costco keep grocery prices so low?",
        a: "Costco earns the vast majority of its profit from membership fees, not product markups. This lets them price groceries at near-cost. They stock a limited product selection (~4,000 SKUs vs 30,000+ at a typical grocery store), which gives them massive volume leverage with suppliers.",
      },
    ],
    metaDescription: "Costco grocery prices are typically 15–30% cheaper than traditional supermarkets. Kirkland Signature brand, bulk staples, and famously low prices. Gold Star membership starts at $65/year.",
  },

  'bjs': {
    slug: 'bjs',
    name: "BJ's Wholesale Club",
    shortName: "BJ's",
    membership: "BJ's Membership",
    membershipCost: '$55–$110/year',
    savingsLow: 15,
    savingsHigh: 28,
    weeklyCartSavings: 25,
    requiresMembership: true,
    membershipTiers: [
      'Inner Circle ($55/year) — warehouse access + digital coupons',
      'Perks Rewards ($110/year — 2% cashback + premium benefits)',
    ],
    notes: [
      'BJ\'s accepts manufacturer coupons — a major advantage over Costco/Sam\'s',
      'Sells name-brand items in addition to its Wellsley Farms private label',
      'Located primarily in the Eastern US (East Coast focus)',
      'BJ\'s Easy Renewal auto-renews membership annually',
    ],
    whyCheaper: "BJ's competes directly with Costco and Sam's Club on the East Coast. Their key differentiator: they accept manufacturer's coupons, letting you stack savings on top of already-low warehouse prices. Like other warehouse clubs, they buy in bulk and operate on membership fee revenue rather than high product margins. Their Wellsley Farms private label covers most staple categories at significant discounts.",
    keyItems: ['Wellsley Farms meats', 'Dairy & cheese', 'Organic produce', 'Paper goods', 'Cooking staples', 'Frozen foods', 'Snacks', 'Coffee'],
    statesAvailable: '18 states (East Coast)',
    storesCount: '240+ warehouse locations',
    faqs: [
      {
        q: "Is BJ's Wholesale cheaper than regular grocery stores?",
        a: "Yes — BJ's Wholesale typically offers 15–28% savings vs traditional supermarkets on staple grocery items. The savings are most pronounced on meat, dairy, produce, and packaged goods. BJ's unique advantage: they accept manufacturer's coupons, which Costco and Sam's Club do not.",
      },
      {
        q: "What are the best grocery deals at BJ's?",
        a: "BJ's offers strong value on: fresh and frozen meats, dairy (cheese, butter, milk), eggs, cooking oils, canned goods, snacks, and Wellsley Farms organic products. They also regularly run Instant Savings promotions on name-brand items.",
      },
      {
        q: "Does BJ's accept manufacturer coupons?",
        a: "Yes — BJ's is the only major warehouse club that accepts manufacturer's coupons. You can also stack BJ's digital coupons with manufacturer coupons for maximum savings. This can make BJ's significantly cheaper than Costco or Sam's on couponable items.",
      },
      {
        q: "How does BJ's compare to Costco for groceries?",
        a: "BJ's and Costco have similar base prices on most grocery items. BJ's edge is coupon acceptance — you can stack manufacturer coupons on top of warehouse prices. Costco has a broader product selection and Kirkland Signature is widely regarded as the best warehouse private label. Both are significantly cheaper than traditional supermarkets.",
      },
      {
        q: "Is a BJ's membership worth it?",
        a: "For East Coast families who do regular grocery shopping, yes. A typical family saves $1,500–$2,500/year on groceries at BJ's vs a traditional supermarket. The Inner Circle membership at $55/year pays for itself after just one or two shopping trips.",
      },
    ],
    metaDescription: "BJ's Wholesale Club grocery prices offer 15–28% savings vs traditional supermarkets. The only warehouse club that accepts manufacturer coupons. Inner Circle membership from $55/year.",
  },

  'walmart': {
    slug: 'walmart',
    name: 'Walmart',
    shortName: 'Walmart',
    membership: 'Walmart+ (optional)',
    membershipCost: '$98/year (optional)',
    savingsLow: 10,
    savingsHigh: 20,
    weeklyCartSavings: 18,
    requiresMembership: false,
    membershipTiers: [
      'Standard (free) — in-store shopping, no membership needed',
      'Walmart+ ($98/year — free delivery, fuel discount, Paramount+ streaming)',
    ],
    notes: [
      'No membership required — open to all shoppers',
      'Great Value private label is consistently among the cheapest grocery options',
      'Walmart+ includes unlimited free grocery delivery on $35+ orders',
      'Price matching available on select items via the Walmart app',
    ],
    whyCheaper: "Walmart is the world's largest retailer and uses that scale to negotiate the lowest possible prices from suppliers. Their Everyday Low Price (EDLP) strategy means they rarely run sales — instead keeping prices permanently low. The Great Value private label covers hundreds of grocery categories at prices that typically undercut even store brands at traditional supermarkets.",
    keyItems: ['Great Value eggs', 'Great Value milk', 'Chicken', 'Ground beef', 'Bread', 'Frozen vegetables', 'Canned goods', 'Cooking oil'],
    statesAvailable: 'all 50 states',
    storesCount: '4,600+ Supercenter locations',
    faqs: [
      {
        q: "Is Walmart the cheapest grocery store?",
        a: "Walmart is consistently one of the cheapest grocery options in the US, typically 10–20% below traditional supermarkets like Kroger or Safeway. They're usually slightly more expensive than warehouse clubs like Costco on a per-unit basis, but require no membership and sell in smaller quantities.",
      },
      {
        q: "What are the cheapest groceries at Walmart?",
        a: "Walmart's Great Value brand offers some of the lowest prices on: eggs, milk, bread, canned goods, frozen vegetables, cooking oil, pasta, rice, and beans. Fresh produce and meat are also competitively priced, especially at Walmart Supercenters.",
      },
      {
        q: "Is Walmart+ worth it for grocery shopping?",
        a: "Walmart+ ($98/year) is worthwhile if you order grocery delivery regularly. With free delivery on orders $35+, a family ordering 2–3 times per month would save more than the membership cost vs paying $7–10 per delivery. The fuel discount (10¢/gal at Walmart and Murphy USA) adds additional value.",
      },
      {
        q: "How do Walmart grocery prices compare to Kroger?",
        a: "Walmart is typically 5–15% cheaper than Kroger on comparable grocery items, especially on private-label products. Kroger competes with frequent sales and digital coupons, so Kroger can occasionally beat Walmart on specific sale items. For everyday prices without hunting deals, Walmart is usually lower.",
      },
      {
        q: "Does Walmart price match other grocery stores?",
        a: "Walmart's everyday low price strategy means they don't have a formal grocery price match program. However, the Walmart Savings Catcher (now discontinued) showed they believe their prices are already the lowest. Some individual store managers may match prices on a case-by-case basis.",
      },
    ],
    metaDescription: "Walmart grocery prices are typically 10–20% cheaper than traditional supermarkets. No membership required. Great Value private label and 4,600+ Supercenter locations across all 50 states.",
  },

  'kroger': {
    slug: 'kroger',
    name: 'Kroger',
    shortName: 'Kroger',
    membership: 'Kroger Plus Card (free)',
    membershipCost: 'Free',
    savingsLow: 5,
    savingsHigh: 15,
    weeklyCartSavings: 15,
    requiresMembership: false,
    membershipTiers: [
      'Kroger Plus Card (free) — digital coupons, sale prices, fuel points',
      'Boost ($59–$99/year — free delivery, 2× fuel points)',
    ],
    notes: [
      'Digital coupons via the Kroger app can save $10–30+ per trip',
      'Fuel Points program: earn 1 point per $1 spent, redeem for gas discounts',
      'Private label Simple Truth Organic is competitively priced vs national brands',
      'Weekly ad sales can match or beat warehouse club prices on featured items',
    ],
    whyCheaper: "Kroger is the largest traditional US grocery chain and uses scale to keep prices competitive. Their Kroger Plus loyalty card unlocks discounted prices throughout the store. Digital coupons and weekly sales events can generate significant per-trip savings. Their Simple Truth and Kroger brand private labels offer quality alternatives to name brands at 20–40% lower prices.",
    keyItems: ['Simple Truth Organic produce', 'Kroger brand dairy', 'Weekly meat specials', 'Digital coupon items', 'Bakery bread', 'Deli items', 'Private label staples'],
    statesAvailable: '35 states',
    storesCount: '2,700+ stores',
    faqs: [
      {
        q: "Is Kroger cheaper than other grocery stores?",
        a: "Kroger is competitively priced among traditional supermarkets. With a free Kroger Plus Card and digital coupons loaded via the app, many shoppers achieve 15–25% savings vs the regular shelf price. Without using coupons and the card, prices are comparable to other major chains.",
      },
      {
        q: "How does the Kroger Plus Card work?",
        a: "The Kroger Plus Card is free to sign up for. It unlocks sale prices throughout the store, lets you load digital coupons that auto-apply at checkout, and earns Fuel Points (100 points = 10¢/gallon off at Kroger and Shell stations). Sign up in-store or through the Kroger app.",
      },
      {
        q: "What are the best deals at Kroger?",
        a: "The best Kroger savings come from: (1) loading all available digital coupons before shopping, (2) buying weekly ad specials, (3) choosing Simple Truth or Kroger brand over name brands, and (4) checking the Friday digital deals which often include $0.99 produce or meat deals.",
      },
      {
        q: "How does Kroger compare to Walmart on grocery prices?",
        a: "Walmart's everyday prices are typically 5–15% lower than Kroger's regular prices. However, with Kroger digital coupons and weekly sales, Kroger can frequently match or beat Walmart on specific items. For consistent low prices without deal-hunting, Walmart tends to be cheaper. For savings-savvy shoppers using Kroger's loyalty program, Kroger is competitive.",
      },
      {
        q: "Is Kroger Boost worth it?",
        a: "Kroger Boost ($59–$99/year) offers free delivery on $35+ orders and 2× Fuel Points. It's worth it if you regularly use grocery delivery — free delivery on 2+ orders per month easily covers the membership cost. The 2× Fuel Points can also add up to meaningful gas savings for frequent shoppers.",
      },
    ],
    metaDescription: "Kroger grocery prices with digital coupons and the free Kroger Plus Card can save you 15–25% per trip. Weekly deals, Simple Truth organic brand, and Fuel Points. Find current prices near you.",
  },
}

export function getClub(slug: string): ClubData | null {
  return CLUBS[slug] ?? null
}

export function getAllClubs(): ClubData[] {
  return Object.values(CLUBS)
}
