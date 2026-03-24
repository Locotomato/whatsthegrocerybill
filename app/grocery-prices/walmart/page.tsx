import type { Metadata } from 'next'
import { getClub } from '../../../lib/warehouseClubs'
import WarehouseClubPage from '../../components/WarehouseClubPage'

export const revalidate = 3600

const club = getClub('walmart')!
const GAS_API = process.env.GAS_API_URL ?? 'https://rolando-pluckiest-ideographically.ngrok-free.dev'

export const metadata: Metadata = {
  title: "What's the Grocery Bill at Walmart? — Today's Walmart Grocery Prices",
  description: club.metaDescription,
  keywords: ["what's the price of gas at walmart", "walmart Grocery Price today", "walmart Grocery Price near me", "walmart grocery price", "walmart gas station prices", "murphy usa walmart Grocery Price"],
  openGraph: {
    title: "What's the Grocery Bill at Walmart? — Today's Walmart Grocery Prices",
    description: club.metaDescription,
    url: 'https://whatsthegrocerybill.com/grocery-prices/walmart',
    siteName: "What's the Grocery Bill?",
  },
  twitter: { card: 'summary', site: '@wtgbofficial', creator: '@wtgbofficial' },
  alternates: { canonical: 'https://whatsthegrocerybill.com/grocery-prices/walmart' },
}

async function getNationalAvg(): Promise<number | null> {
  try {
    const res = await fetch(`${GAS_API}/gas/states`, { next: { revalidate: 3600 } })
    if (!res.ok) return null
    const data = await res.json()
    return data.nationalAvg ?? null
  } catch { return null }
}

export default async function WalmartPage() {
  const nationalAvg = await getNationalAvg()
  return <WarehouseClubPage club={club} nationalAvg={nationalAvg} />
}
