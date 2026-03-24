import type { Metadata } from 'next'
import { getClub } from '../../../lib/warehouseClubs'
import WarehouseClubPage from '../../components/WarehouseClubPage'

export const revalidate = 3600

const club = getClub('wawa')!
const GAS_API = process.env.GAS_API_URL ?? 'https://rolando-pluckiest-ideographically.ngrok-free.dev'

export const metadata: Metadata = {
  title: "What's the Grocery Bill at Wawa? — Wawa Grocery Prices Today",
  description: club.metaDescription,
  keywords: ["wawa Grocery Price", "what's the price of gas at wawa", "wawa Grocery Price today", "wawa grocery price", "wawa gas station near me"],
  openGraph: {
    title: "Wawa Grocery Prices Today",
    description: club.metaDescription,
    url: 'https://whatsthegrocerybill.com/grocery-prices/wawa',
    siteName: "What's the Grocery Bill?",
  },
  twitter: { card: 'summary', site: '@wtgbofficial', creator: '@wtgbofficial' },
  alternates: { canonical: 'https://whatsthegrocerybill.com/grocery-prices/wawa' },
}

async function getNationalAvg(): Promise<number | null> {
  try {
    const res = await fetch(`${GAS_API}/gas/states`, { next: { revalidate: 3600 } })
    if (!res.ok) return null
    const data = await res.json()
    return data.nationalAvg ?? null
  } catch { return null }
}

export default async function WawaPage() {
  const nationalAvg = await getNationalAvg()
  return <WarehouseClubPage club={club} nationalAvg={nationalAvg} />
}
