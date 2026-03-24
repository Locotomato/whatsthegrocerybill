import type { Metadata } from 'next'
import { getClub } from '../../../lib/warehouseClubs'
import WarehouseClubPage from '../../components/WarehouseClubPage'

export const revalidate = 3600

const club = getClub('circle-k')!
const GAS_API = process.env.GAS_API_URL ?? 'https://rolando-pluckiest-ideographically.ngrok-free.dev'

export const metadata: Metadata = {
  title: "What's the Grocery Bill at Circle K? — Today's Circle K Grocery Prices",
  description: club.metaDescription,
  keywords: ["what's the price of gas at circle k", "circle k Grocery Price today", "circle k Grocery Price near me", "circle k grocery price", "circle k gas station price", "how much is gas at circle k"],
  openGraph: {
    title: "What's the Grocery Bill at Circle K? — Today's Circle K Grocery Prices",
    description: club.metaDescription,
    url: 'https://whatsthegrocerybill.com/grocery-prices/circle-k',
    siteName: "What's the Grocery Bill?",
  },
  twitter: { card: 'summary', site: '@wtgbofficial', creator: '@wtgbofficial' },
  alternates: { canonical: 'https://whatsthegrocerybill.com/grocery-prices/circle-k' },
}

async function getNationalAvg(): Promise<number | null> {
  try {
    const res = await fetch(`${GAS_API}/gas/states`, { next: { revalidate: 3600 } })
    if (!res.ok) return null
    const data = await res.json()
    return data.nationalAvg ?? null
  } catch { return null }
}

export default async function CircleKPage() {
  const nationalAvg = await getNationalAvg()
  return <WarehouseClubPage club={club} nationalAvg={nationalAvg} />
}
