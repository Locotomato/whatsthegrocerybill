import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getClub } from '../../../../lib/warehouseClubs'
import { BRAND_STATES } from '../../../components/WarehouseClubStatePage'
import WarehouseClubStatePage from '../../../components/WarehouseClubStatePage'
import { slugToAbbr, toTitleCase } from '../../../../lib/stateData'

export const revalidate = 3600

const BRAND = 'circle-k'
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
    title: `Circle K Grocery Prices in ${stateName} Today (${priceStr})`,
    description: `Circle K Grocery Prices in ${stateName} today. Based on ${stateName}'s current average of ${priceStr}, Circle K saves you ${club.savingsLow}–${club.savingsHigh}¢/gal vs branded stations. Estimated price and annual savings.`,
    keywords: [`circle k Grocery Price ${stateName.toLowerCase()}`, `what's the price of gas at circle k in ${stateName.toLowerCase()}`, `circle k ${stateName.toLowerCase()} grocery price`],
    openGraph: {
      title: `Circle K Grocery Prices in ${stateName} Today`,
      url: `https://whatsthegrocerybill.com/grocery-prices/circle-k/${state}`,
      siteName: "What's the Grocery Bill?",
    },
    twitter: { card: 'summary', site: '@wtgbofficial' },
    alternates: { canonical: `https://whatsthegrocerybill.com/grocery-prices/circle-k/${state}` },
  }
}

export default async function CircleKStatePage({ params }: Props) {
  const { state } = await params
  if (!BRAND_STATES[BRAND].includes(state)) notFound()
  const abbr = slugToAbbr(state)
  if (!abbr) notFound()
  const { statePrice, nationalAvg } = await getPrices(abbr)
  return <WarehouseClubStatePage club={club} stateSlug={state} stateAbbr={abbr} statePrice={statePrice} nationalAvg={nationalAvg} />
}
