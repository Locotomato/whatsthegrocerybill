import type { Metadata } from 'next'
import { getClub } from '../../../lib/warehouseClubs'
import WarehouseClubPage from '../../components/WarehouseClubPage'

export const revalidate = 3600

const club = getClub('bjs')!
const GAS_API = process.env.GAS_API_URL ?? 'https://rolando-pluckiest-ideographically.ngrok-free.dev'

export const metadata: Metadata = {
  title: "What's the Grocery Bill at BJ's? — BJ's Wholesale Grocery Prices Today",
  description: club.metaDescription,
  keywords: ["bj's Grocery Price", "what is the price of gas at bj's", "bj's wholesale Grocery Price today", "how much is gas at bj's", "bj's grocery price"],
  openGraph: {
    title: "BJ's Wholesale Club Grocery Prices Today",
    description: club.metaDescription,
    url: "https://whatsthegrocerybill.com/grocery-prices/bjs",
    siteName: "What's the Grocery Bill?",
  },
  twitter: { card: 'summary', site: '@wtgbofficial', creator: '@wtgbofficial' },
  alternates: { canonical: 'https://whatsthegrocerybill.com/grocery-prices/bjs' },
}

async function getNationalAvg(): Promise<number | null> {
  try {
    const res = await fetch(`${GAS_API}/gas/states`, { next: { revalidate: 3600 } })
    if (!res.ok) return null
    const data = await res.json()
    return data.nationalAvg ?? null
  } catch { return null }
}

export default async function BJsPage() {
  const nationalAvg = await getNationalAvg()
  return <WarehouseClubPage club={club} nationalAvg={nationalAvg} />
}
