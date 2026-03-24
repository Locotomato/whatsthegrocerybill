export interface ClubData {
  slug: string
  name: string
  shortName: string
  membership: string
  membershipCost: string
  savingsLow: number   // cents below national avg (low estimate)
  savingsHigh: number  // cents below national avg (high estimate)
  tankSize: number     // avg tank fill gallons
  fillsPerYear: number // avg fills per year for a US driver
  requiresMembership: boolean
  membershipTiers?: string[]
  notes: string[]
  faqs: { q: string; a: string }[]
  whyCheaper: string
  statesAvailable: string   // e.g. "all 50 states" or "38 states"
  stationCount: string
  metaDescription: string
}

export const CLUBS: Record<string, ClubData> = {
  'sams-club': {
    slug: 'sams-club',
    name: "Sam's Club",
    shortName: "Sam's",
    membership: "Sam's Club Membership",
    membershipCost: '$50–$110/year',
    savingsLow: 10,
    savingsHigh: 25,
    tankSize: 13,
    fillsPerYear: 52,
    requiresMembership: true,
    membershipTiers: ['Club ($50/year)', 'Plus ($110/year — includes 5¢/gal fuel cashback)'],
    notes: [
      'Prices updated at the pump — not posted online',
      'Plus members earn 5¢/gal cashback on top of the already-discounted price',
      'Accepts Mastercard, cash, Sam\'s Club gift cards, and EBT (for fuel)',
    ],
    whyCheaper: "Sam's Club operates gas stations as a membership benefit, not a profit center. The real money is inside the warehouse. This means they price gas at or near cost — sometimes below — to drive foot traffic and memberships. Their bulk purchasing power from major fuel suppliers lets them pass volume discounts directly to members.",
    statesAvailable: '44 states',
    stationCount: '600+ fuel centers',
    faqs: [
      {
        q: "Do you need a Sam's Club membership to buy gas?",
        a: "Yes. A valid Sam's Club membership card is required at the pump. The base Club membership is $50/year. Plus members ($110/year) earn an additional 5¢/gal fuel cashback on all purchases.",
      },
      {
        q: "How much cheaper is Sam's Club gas vs the national average?",
        a: "Sam's Club gas typically runs 10–25¢ per gallon below the national average, though this varies by region and market conditions. In high-tax states like California, the savings gap is usually smaller.",
      },
      {
        q: "What payment methods does Sam's Club accept for gas?",
        a: "Sam's Club accepts Mastercard, cash, Sam's Club gift cards, and EBT cards at the fuel center. Note: they do not accept Visa or Discover at the pump.",
      },
      {
        q: "Is a Sam's Club Plus membership worth it just for the gas discount?",
        a: "At 10¢/gal savings with a 13-gallon fill-up once a week, you'd save about $67.60/year on gas alone. A Plus membership costs $110/year, so you'd break even on gas savings alone at roughly 1.6 fill-ups per week. The Plus tier also includes 5¢/gal cashback, free shipping, and other perks.",
      },
      {
        q: "Can I check Sam's Club Grocery Prices online before going?",
        a: "Sam's Club does not publish real-time Grocery Prices online. The best way to check is the Sam's Club app, which shows current grocery prices at nearby locations for members.",
      },
    ],
    metaDescription: "Sam's Club Grocery Prices are typically 10–25¢ below the national average for members. See today's national avg, calculate your annual savings, and learn if the membership pays for itself.",
  },

  'costco': {
    slug: 'costco',
    name: 'Costco',
    shortName: 'Costco',
    membership: 'Costco Membership',
    membershipCost: '$65–$130/year',
    savingsLow: 15,
    savingsHigh: 30,
    tankSize: 13,
    fillsPerYear: 52,
    requiresMembership: true,
    membershipTiers: ['Gold Star ($65/year)', 'Executive ($130/year — 2% cashback on purchases)'],
    notes: [
      'Costco gas stations often have long lines — plan accordingly',
      'Accepts Visa credit cards, Visa debit, cash, and Costco Shop Cards',
      'Does NOT accept Mastercard, American Express, or Discover at the pump',
    ],
    whyCheaper: "Costco, like Sam's Club, uses low Grocery Prices as a traffic driver. Members who stop to fill up are more likely to walk inside and spend money. Costco buys fuel in bulk from refineries and major suppliers, passing those volume discounts to members. They also run their own tanker fleet in some regions, cutting out distribution middlemen.",
    statesAvailable: '47 states + DC',
    stationCount: '700+ fuel stations',
    faqs: [
      {
        q: "Do you need a Costco membership to buy gas?",
        a: "Yes. A valid Costco membership is required at all Costco fuel stations. The Gold Star membership is $65/year; Executive is $130/year and includes 2% cashback on most Costco purchases.",
      },
      {
        q: "How much cheaper is Costco gas vs the national average?",
        a: "Costco gas typically runs 15–30¢ per gallon below the national average — making it consistently one of the cheapest gas sources in the US. Some members report savings of 40¢+ in areas where local prices are unusually high.",
      },
      {
        q: "Why are Costco gas lines so long?",
        a: "Because the price is genuinely lower. A 20-cent savings on a 15-gallon fill-up is $3.00 — worth a few extra minutes for most drivers. Costco stations also tend to have fewer pumps relative to demand. Lines move faster than they look since Costco pumps are typically high-flow.",
      },
      {
        q: "What payment methods does Costco accept for gas?",
        a: "Costco accepts Visa credit cards, Visa debit cards, cash, and Costco Shop Cards at the pump. They do NOT accept Mastercard, American Express, or Discover.",
      },
      {
        q: "Is Costco or Sam's Club gas cheaper?",
        a: "It depends on location, but Costco gas tends to be slightly cheaper than Sam's Club on average — saving 15–30¢/gal vs Sam's 10–25¢/gal below the national average. Both are significantly cheaper than branded stations (Shell, BP, Chevron). Your best bet is to check the app for each before filling up.",
      },
    ],
    metaDescription: "Costco Grocery Prices are typically 15–30¢ below the national average for members. See today's national avg, find out how much you'd save annually, and compare to Sam's Club.",
  },

  'bjs': {
    slug: 'bjs',
    name: "BJ's Wholesale Club",
    shortName: "BJ's",
    membership: "BJ's Membership",
    membershipCost: '$55–$110/year',
    savingsLow: 10,
    savingsHigh: 20,
    tankSize: 13,
    fillsPerYear: 52,
    requiresMembership: true,
    membershipTiers: ['Inner Circle ($55/year)', 'Perks Rewards ($110/year — 2% cashback)'],
    notes: [
      'BJ\'s is located primarily in the East Coast (16 states)',
      'Perks Rewards members earn 10¢/gal with the My BJ\'s Perks Mastercard',
      'Often has shorter lines than Costco in the same markets',
    ],
    whyCheaper: "BJ's uses the same warehouse club model as Costco and Sam's Club — gas is priced as a membership benefit to drive foot traffic, not as a revenue center. As an East Coast-focused chain, BJ's competes directly with Costco and Wawa in the mid-Atlantic and Northeast, keeping prices competitive in those high-cost markets.",
    statesAvailable: '16 states (East Coast)',
    stationCount: '160+ fuel stations',
    faqs: [
      {
        q: "Do you need a BJ's membership to buy gas?",
        a: "Yes. A valid BJ's membership is required. The Inner Circle membership is $55/year. Perks Rewards ($110/year) earns 2% cashback on most BJ's purchases, and the My BJ's Perks Mastercard adds 10¢/gal in fuel savings on top.",
      },
      {
        q: "What states have BJ's gas stations?",
        a: "BJ's operates primarily in the eastern US: Connecticut, Delaware, Florida, Georgia, Indiana, Maine, Maryland, Massachusetts, Michigan, New Hampshire, New Jersey, New York, North Carolina, Ohio, Pennsylvania, Rhode Island, South Carolina, Tennessee, and Virginia.",
      },
      {
        q: "How much cheaper is BJ's gas vs the national average?",
        a: "BJ's gas typically runs 10–20¢ per gallon below the national average. In high-cost Northeast markets, savings can occasionally exceed 25¢/gal. Their prices are competitive with Costco in overlapping markets.",
      },
      {
        q: "Does BJ's accept Visa and Mastercard for gas?",
        a: "Yes — BJ's accepts Visa, Mastercard, American Express, and BJ's gift cards at the pump. This is an advantage over Costco, which only accepts Visa.",
      },
    ],
    metaDescription: "BJ's Wholesale Club Grocery Prices run 10–20¢ below the national average for members, primarily on the East Coast. See today's national avg and whether a BJ's membership pays for itself.",
  },

  'murphys': {
    slug: 'murphys',
    name: "Murphy USA",
    shortName: "Murphy's",
    membership: 'No membership required',
    membershipCost: 'Free (Murphy Drive Rewards)',
    savingsLow: 5,
    savingsHigh: 15,
    tankSize: 13,
    fillsPerYear: 52,
    requiresMembership: false,
    notes: [
      'Located almost exclusively adjacent to Walmart stores',
      'Murphy Drive Rewards app earns points toward fuel discounts',
      'No membership required — open to everyone',
      'Over 1,700 locations across 26 states',
    ],
    whyCheaper: "Murphy USA stations are almost always located directly next to a Walmart supercenter. Walmart's business model is everyday low prices, and Murphy USA extends that to fuel. They run on thin margins with high volume and benefit from Walmart's customer foot traffic. No membership means their savings are available to anyone — making them a top pick for budget-conscious drivers.",
    statesAvailable: '26 states (primarily South and Midwest)',
    stationCount: '1,700+ stations',
    faqs: [
      {
        q: "Do you need a membership for Murphy USA gas?",
        a: "No membership required. Murphy USA is open to everyone. They do offer a free loyalty program called Murphy Drive Rewards, which earns points toward fuel discounts — but it's optional.",
      },
      {
        q: "Why is Murphy USA gas so cheap?",
        a: "Murphy USA stations sit on low-cost real estate next to Walmart stores, operate on high volume with minimal overhead, and price gas competitively to draw in Walmart shoppers. Their margins are thin by design.",
      },
      {
        q: "Where are Murphy USA gas stations located?",
        a: "Murphy USA has over 1,700 stations, almost entirely located adjacent to Walmart Supercenters. They operate in 26 states, concentrated in the South and Midwest: Alabama, Arkansas, Colorado, Florida, Georgia, Illinois, Indiana, Iowa, Kansas, Kentucky, Louisiana, Michigan, Mississippi, Missouri, Nebraska, Nevada, New Mexico, North Carolina, Ohio, Oklahoma, South Carolina, Tennessee, Texas, Utah, Virginia, and Wisconsin.",
      },
      {
        q: "How does Murphy Drive Rewards work?",
        a: "Murphy Drive Rewards is a free loyalty program. Members earn 1 point per gallon purchased and can redeem points for fuel discounts. Special promotions occasionally offer 5–10¢/gal bonus discounts for app users.",
      },
    ],
    metaDescription: "Murphy USA Grocery Prices are typically 5–15¢ below the national average with no membership required. Located next to Walmart stores in 26 states. See today's national avg and how much you'd save.",
  },

  'wawa': {
    slug: 'wawa',
    name: 'Wawa',
    shortName: 'Wawa',
    membership: 'No membership required',
    membershipCost: 'Free (Wawa Rewards)',
    savingsLow: 3,
    savingsHigh: 10,
    tankSize: 13,
    fillsPerYear: 52,
    requiresMembership: false,
    notes: [
      'Wawa operates in 7 Mid-Atlantic and Southeast states',
      'Free Wawa Rewards program offers occasional fuel coupons',
      'Known for competitive pricing vs branded stations in its markets',
      'Accepts all major credit cards',
    ],
    whyCheaper: "Wawa is a convenience store chain that competes aggressively on fuel pricing in its Mid-Atlantic and Southeast markets. Unlike branded stations (Shell, BP, Chevron) that pay franchise fees and brand premiums, Wawa buys fuel independently and prices it to compete with warehouse clubs. Their high-volume locations keep per-gallon margins thin.",
    statesAvailable: '7 states (Mid-Atlantic & Southeast)',
    stationCount: '950+ stores with fuel',
    faqs: [
      {
        q: "Do you need a membership for Wawa gas?",
        a: "No membership required. Wawa is open to everyone. They offer a free Wawa Rewards program that occasionally provides fuel coupons and discounts.",
      },
      {
        q: "What states have Wawa gas stations?",
        a: "Wawa operates in Pennsylvania, New Jersey, Delaware, Maryland, Virginia, Florida, and North Carolina. They have over 950 locations with fuel, concentrated in the Philadelphia metro area and Florida.",
      },
      {
        q: "How much cheaper is Wawa gas vs the national average?",
        a: "Wawa typically prices 3–10¢ below the national average, though this varies significantly by market. In their core Pennsylvania/New Jersey markets, they're consistently among the lowest-priced options at unbranded-level pricing.",
      },
      {
        q: "Does Wawa have a gas rewards program?",
        a: "Yes. Wawa Rewards is a free loyalty program that occasionally offers fuel discounts. They also partner with credit cards for additional savings — notably offering 10¢/gal savings for certain Wawa Mastercard holders.",
      },
    ],
    metaDescription: "Wawa Grocery Prices are typically 3–10¢ below the national average with no membership required, in 7 Mid-Atlantic and Southeast states. See today's national avg and local pricing.",
  },

  'sheetz': {
    slug: 'sheetz',
    name: 'Sheetz',
    shortName: 'Sheetz',
    membership: 'No membership required',
    membershipCost: 'Free (Sheetz Rewardz)',
    savingsLow: 5,
    savingsHigh: 15,
    tankSize: 13,
    fillsPerYear: 52,
    requiresMembership: false,
    notes: [
      'Over 600 locations across 9 states in the Mid-Atlantic and Southeast',
      'Free Sheetz Rewardz loyalty program offers periodic fuel discounts',
      'No membership required — open to everyone',
      'Known for competitive unbranded fuel pricing vs Shell, BP, and Sunoco',
    ],
    whyCheaper: "Sheetz operates as an independent convenience store chain and buys fuel without paying major oil brand franchise fees. This lets them undercut branded stations by 5–15¢/gal while still turning a profit on their high-margin food and beverage sales. Their Sheetz Rewardz app occasionally offers additional per-gallon discounts to loyalty members.",
    statesAvailable: '9 states (Mid-Atlantic & Southeast)',
    stationCount: '600+ locations',
    faqs: [
      {
        q: "What's the price of gas at Sheetz today?",
        a: "Sheetz Grocery Prices vary by location but typically run 5–15¢ below the national average. They post prices at the pump and on the Sheetz app — the app is the easiest way to find the current price at your nearest location.",
      },
      {
        q: "Do you need a membership to buy gas at Sheetz?",
        a: "No membership required. Sheetz is open to everyone. They offer a free Sheetz Rewardz loyalty program that provides occasional fuel discounts and in-store deals, but it's entirely optional.",
      },
      {
        q: "What states have Sheetz gas stations?",
        a: "Sheetz operates in Pennsylvania, West Virginia, Virginia, North Carolina, Maryland, Ohio, Kentucky, South Carolina, and Indiana — with the heaviest concentration in Pennsylvania and surrounding states.",
      },
      {
        q: "How does Sheetz Rewardz work for gas savings?",
        a: "Sheetz Rewardz is a free points program. Members earn points on food and drink purchases, which can be redeemed for in-store items. Sheetz also runs periodic promotions offering 5–10¢/gal fuel discounts through the app.",
      },
    ],
    metaDescription: "What's the price of gas at Sheetz? Sheetz gas typically runs 5–15¢ below the national avg with no membership required, across 9 Mid-Atlantic states. See today's estimated price.",
  },

  'walmart': {
    slug: 'walmart',
    name: 'Walmart Gas Stations',
    shortName: 'Walmart',
    membership: 'No membership required',
    membershipCost: 'Free (Walmart+ optional)',
    savingsLow: 5,
    savingsHigh: 15,
    tankSize: 13,
    fillsPerYear: 52,
    requiresMembership: false,
    notes: [
      'Walmart gas stations are operated by Murphy USA, co-located at Walmart Supercenters',
      'Walmart+ members save 5–10¢/gal at Walmart and Murphy USA stations',
      'Over 1,600 locations across 48 states (no Hawaii or Alaska)',
      'No membership required — open to everyone at standard posted prices',
    ],
    whyCheaper: "Walmart gas stations (operated by Murphy USA) price fuel competitively as part of Walmart's everyday low price strategy. High-volume locations, low real estate overhead next to Walmart Supercenters, and thin margins backed by store foot traffic allow them to consistently undercut branded stations. Walmart+ members receive an additional 5–10¢/gal discount.",
    statesAvailable: '48 states (excludes Hawaii and Alaska)',
    stationCount: '1,600+ stations',
    faqs: [
      {
        q: "What's the price of gas at Walmart today?",
        a: "Walmart gas stations (run by Murphy USA) typically price 5–15¢ below the national average. Prices vary by location and are posted at the pump. Walmart+ members save an additional 5–10¢/gal on top of the already-discounted price.",
      },
      {
        q: "Do you need a Walmart+ membership to buy gas at Walmart?",
        a: "No membership is required to buy gas at Walmart stations. Anyone can fill up at the posted price. However, Walmart+ members ($98/year) receive 5–10¢/gal in additional discounts at participating Walmart and Murphy USA fuel stations.",
      },
      {
        q: "Are Walmart gas stations the same as Murphy USA?",
        a: "Yes, in most cases. Murphy USA operates the majority of fuel stations located at Walmart Supercenters. They function as separate businesses but share the same real estate and customer base.",
      },
      {
        q: "Is Walmart+ worth it for the gas discount?",
        a: "At 10¢/gal savings on a 13-gallon fill-up once a week, you'd save about $67.60/year on gas alone. Walmart+ costs $98/year, so you'd need to fill up roughly 1.5 times per week to break even on the fuel discount alone — plus you get free delivery, Paramount+, and other perks.",
      },
    ],
    metaDescription: "What's the price of gas at Walmart? Walmart gas (Murphy USA) typically runs 5–15¢ below national avg with no membership required. Walmart+ saves an extra 5–10¢/gal. 48 states.",
  },

  'bucees': {
    slug: 'bucees',
    name: "Buc-ee's",
    shortName: "Buc-ee's",
    membership: 'No membership required',
    membershipCost: 'None',
    savingsLow: 5,
    savingsHigh: 20,
    tankSize: 13,
    fillsPerYear: 52,
    requiresMembership: false,
    notes: [
      'Buc-ee\'s mega-stations typically have 100+ fuel pumps — one of the largest in the US',
      'No membership required — open to everyone',
      'Known for some of the cleanest restrooms and widest fuel canopies in the country',
      '50+ locations, concentrated in Texas but expanding rapidly across the South and Midwest',
    ],
    whyCheaper: "Buc-ee's operates enormous travel centers with 100+ fuel pumps, allowing massive fuel volume throughput that other retailers can't match. This scale, combined with direct fuel purchasing and high in-store revenue from snacks, prepared food, and merchandise, lets them price gas 5–20¢ below the national average without sacrificing profitability.",
    statesAvailable: '17 states (South, Southeast & Midwest)',
    stationCount: '50+ mega-stations',
    faqs: [
      {
        q: "What's the price of gas at Buc-ee's today?",
        a: "Buc-ee's Grocery Prices typically run 5–20¢ below the national average, though prices vary by location. They post current prices on GasBuddy and the Buc-ee's website for nearby locations.",
      },
      {
        q: "Do you need a membership to buy gas at Buc-ee's?",
        a: "No membership required. Buc-ee's is open to everyone. There is no loyalty program for gas discounts — they simply price fuel competitively for all customers.",
      },
      {
        q: "Why does Buc-ee's have so many gas pumps?",
        a: "Buc-ee's business model is built around massive throughput. Their locations typically have 80–120+ fuel pumps and massive travel centers with food, snacks, and merchandise. High fuel volume at thin margins, combined with strong in-store sales, makes the model work.",
      },
      {
        q: "What states have Buc-ee's gas stations?",
        a: "Buc-ee's operates in Texas, Florida, Georgia, Alabama, South Carolina, North Carolina, Tennessee, Kentucky, Virginia, Ohio, Indiana, Oklahoma, Missouri, Kansas, Nebraska, Colorado, and Wyoming — with more locations under construction.",
      },
    ],
    metaDescription: "What's the price of gas at Buc-ee's? Buc-ee's gas typically runs 5–20¢ below national avg with no membership required. 50+ mega-stations across 17 states. See today's estimated price.",
  },

  'kroger': {
    slug: 'kroger',
    name: 'Kroger Fuel Centers',
    shortName: 'Kroger',
    membership: 'No membership required',
    membershipCost: 'Free (Kroger Plus Card)',
    savingsLow: 3,
    savingsHigh: 35,
    tankSize: 13,
    fillsPerYear: 52,
    requiresMembership: false,
    notes: [
      'Free Kroger Plus Card unlocks baseline fuel discounts at all Kroger Fuel Centers',
      'Earn up to 35¢/gal off with Kroger Rewards points from grocery purchases',
      '1,500+ fuel centers at Kroger, Fry\'s, Harris Teeter, Fred Meyer, King Soopers, and other banner stores',
      'Fuel points expire at end of each month, so use them before they reset',
    ],
    whyCheaper: "Kroger prices fuel as a grocery loyalty benefit — their Fuel Centers are designed to increase grocery store visit frequency and basket size. By linking fuel discounts to grocery spending (earn 1 fuel point per $1 spent), Kroger drives more store traffic while passing fuel savings to loyal shoppers. The more you grocery shop, the cheaper your gas gets — up to 35¢/gal off.",
    statesAvailable: '~38 states',
    stationCount: '1,500+ fuel centers',
    faqs: [
      {
        q: "What's the price of gas at Kroger today?",
        a: "Kroger Fuel Centers typically price 3–10¢ below the national average at baseline. With Kroger Rewards fuel points earned from grocery purchases, cardholders can save an additional 10–35¢/gal on top of that, making Kroger one of the best gas deals for frequent grocery shoppers.",
      },
      {
        q: "How do Kroger fuel points work?",
        a: "You earn 1 fuel point for every $1 spent on groceries at Kroger stores. Every 100 points = 10¢/gal off (up to 35¢/gal per fill-up). Points must be used by the end of the calendar month they were earned. Some promotions offer 2x or 4x points on specific purchases.",
      },
      {
        q: "Do you need a Kroger card to get the cheap Grocery Price?",
        a: "Yes, the Kroger Plus Card (free to sign up) is required to get the discounted grocery price. Without it, you pay the posted retail price, which is typically still 3–10¢ below branded stations. The card is free and takes 2 minutes to sign up for in-store or online.",
      },
      {
        q: "What Kroger banner stores have fuel centers?",
        a: "Kroger fuel discounts work at all Kroger banner stores: Kroger, Fry's, Harris Teeter, Fred Meyer, King Soopers, Ralphs, Smith's, City Market, Baker's, Dillons, and Pay Less Super Markets — depending on your region.",
      },
    ],
    metaDescription: "What's the price of gas at Kroger? Kroger Fuel Centers typically run 3–10¢ below avg, and Kroger Rewards card holders can save up to 35¢/gal. Free card. 1,500+ locations in 38 states.",
  },

  'circle-k': {
    slug: 'circle-k',
    name: 'Circle K',
    shortName: 'Circle K',
    membership: 'No membership required',
    membershipCost: 'Free (Inner Circle Rewards)',
    savingsLow: 0,
    savingsHigh: 8,
    tankSize: 13,
    fillsPerYear: 52,
    requiresMembership: false,
    notes: [
      'Over 7,000 Circle K locations with fuel in the US',
      'Free Inner Circle Rewards program offers periodic fuel discounts and in-store deals',
      'No membership required — open to everyone at standard posted prices',
      'Operates under the Holiday brand in the upper Midwest',
    ],
    whyCheaper: "Circle K operates as an independent convenience store chain without paying major oil brand franchise fees, allowing them to price fuel 0–8¢ below branded competitors like Shell, BP, and Chevron. Their Inner Circle Rewards program occasionally adds bonus fuel discounts for loyalty members. With 7,000+ US locations, Circle K is one of the most accessible cheap gas options nationwide.",
    statesAvailable: '40+ states',
    stationCount: '7,000+ locations',
    faqs: [
      {
        q: "What's the price of gas at Circle K today?",
        a: "Circle K Grocery Prices are typically 0–8¢ below branded station averages (Shell, BP, Chevron). Prices vary significantly by market and region. The Circle K app shows current grocery prices at nearby locations and often includes app-exclusive fuel discount offers.",
      },
      {
        q: "Do you need a membership to buy gas at Circle K?",
        a: "No membership required. Circle K is open to everyone. Their free Inner Circle Rewards program provides periodic fuel discounts and in-store deals — it's worth signing up but entirely optional.",
      },
      {
        q: "What is Circle K Inner Circle Rewards?",
        a: "Inner Circle Rewards is Circle K's free loyalty program. Members earn rewards on in-store purchases and receive periodic fuel discount offers — often 3–5¢/gal off via the app. Sign up is free in-store or via the Circle K app.",
      },
      {
        q: "Is Circle K gas the same as Holiday gas?",
        a: "Yes. In the upper Midwest (Minnesota, Wisconsin, and surrounding states), Circle K operates under the Holiday brand name. The fuel programs and Inner Circle Rewards are the same across both brands.",
      },
    ],
    metaDescription: "What's the price of gas at Circle K? Circle K gas is typically 0–8¢ below branded avg with no membership required. Free Inner Circle Rewards for more savings. 7,000+ US locations.",
  },
}

export const ALL_CLUB_SLUGS = Object.keys(CLUBS)

export function getClub(slug: string): ClubData | null {
  return CLUBS[slug] ?? null
}
