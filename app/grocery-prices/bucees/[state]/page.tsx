import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getClub } from '../../../../lib/warehouseClubs'
import { BRAND_STATES } from '../../../components/WarehouseClubStatePage'
import WarehouseClubStatePage from '../../../components/WarehouseClubStatePage'
import { slugToAbbr, toTitleCase } from '../../../../lib/stateData'

export const revalidate = 3600

const BRAND = 'bucees'
const club = getClub(BRAND)!
const GAS_API = process.env.GAS_API_URL ?? 'https://rolando-pluckiest-ideographically.ngrok-free.dev'

interface Props { params: Promise<{ state: string }> }

async function getPrices(abbr: string): Promise<{ statePrice: number | null; nationalAvg: number | null }> {
  try {
    const res = await fetch(`${GAS_API}/gas/states`, { next: { revalidate: 3600 } })
    if (!res.ok) return { statePrice: null, nationalAvg: null }
    const data = await res.json()
    return { statePrice: data.states?.[abbr]?.price ?? null, nationalAvg: data.nationalAvg ?? null }
  } catch { return { statePrice: null, nationalAvg: null } }
}

export async function generateStaticParams() {
  return BRAND_STATES[BRAND].map((s: string) => ({ state: s }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { state } = await params
  const abbr = slugToAbbr(state)
  if (!abbr) return {}
  const stateName = toTitleCase(state)
  const { statePrice } = await getPrices(abbr)
  const priceStr = statePrice ? `$${statePrice.toFixed(2)}/gal state avg` : 'current prices'
  return {
    title: `Buc-ee's Grocery Prices in ${stateName} Today (${priceStr})`,
    description: `Buc-ee's Grocery Prices in ${stateName} today. Based on ${stateName}'s current average of ${priceStr}, Buc-ee's saves you ${club.savingsLow}–${club.savingsHigh}¢/gal. Estimated price, annual savings, and local context.`,
    keywords: [`bucees Grocery Price ${stateName.toLowerCase()}`, `what's the price of gas at buc-ee's in ${stateName.toLowerCase()}`, `buc-ee's ${stateName.toLowerCase()} grocery price`],
    openGraph: {
      title: `Buc-ee's Grocery Prices in ${stateName} Today`,
      url: `https://whatsthegrocerybill.com/grocery-prices/bucees/${state}`,
      siteName: "What's the Grocery Bill?",
    },
    twitter: { card: 'summary', site: '@wtgbofficial' },
    alternates: { canonical: `https://whatsthegrocerybill.com/grocery-prices/bucees/${state}` },
  }
}

export default async function BuceesStatePage({ params }: Props) {
  const { state } = await params
  if (!BRAND_STATES[BRAND].includes(state)) notFound()
  const abbr = slugToAbbr(state)
  if (!abbr) notFound()
  const { statePrice, nationalAvg } = await getPrices(abbr)
  return <WarehouseClubStatePage club={club} stateSlug={state} stateAbbr={abbr} statePrice={statePrice} nationalAvg={nationalAvg} />
}
