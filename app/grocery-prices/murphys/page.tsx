import type { Metadata } from 'next'
import { getClub } from '../../../lib/warehouseClubs'
import WarehouseClubPage from '../../components/WarehouseClubPage'

export const revalidate = 3600

const club = getClub('murphys')!
const GAS_API = process.env.GAS_API_URL ?? 'https://rolando-pluckiest-ideographically.ngrok-free.dev'

export const metadata: Metadata = {
  title: "What's the Grocery Bill at Murphy's? — Murphy USA Grocery Prices Today",
  description: club.metaDescription,
  keywords: ["murphy usa Grocery Price", "what's the price of gas at murphy's", "murphy's Grocery Price today", "murphy gas station price", "murphy usa grocery price"],
  openGraph: {
    title: "Murphy USA Grocery Prices Today",
    description: club.metaDescription,
    url: 'https://whatsthegrocerybill.com/grocery-prices/murphys',
    siteName: "What's the Grocery Bill?",
  },
  twitter: { card: 'summary', site: '@wtgbofficial', creator: '@wtgbofficial' },
  alternates: { canonical: 'https://whatsthegrocerybill.com/grocery-prices/murphys' },
}

async function getNationalAvg(): Promise<number | null> {
  try {
    const res = await fetch(`${GAS_API}/gas/states`, { next: { revalidate: 3600 } })
    if (!res.ok) return null
    const data = await res.json()
    return data.nationalAvg ?? null
  } catch { return null }
}

export default async function MurphysPage() {
  const nationalAvg = await getNationalAvg()
  return <WarehouseClubPage club={club} nationalAvg={nationalAvg} />
}
