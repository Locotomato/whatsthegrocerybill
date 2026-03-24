import type { Metadata } from 'next'
import { getClub } from '../../../lib/warehouseClubs'
import WarehouseClubPage from '../../components/WarehouseClubPage'

export const revalidate = 3600

const club = getClub('bucees')!
const GAS_API = process.env.GAS_API_URL ?? 'https://rolando-pluckiest-ideographically.ngrok-free.dev'

export const metadata: Metadata = {
  title: "What's the Grocery Bill at Buc-ee's? — Today's Buc-ee's Grocery Prices",
  description: club.metaDescription,
  keywords: ["what's the price of gas at buc-ee's", "bucees Grocery Price today", "buc-ees Grocery Price near me", "bucees grocery price", "buc-ee's gas station price", "how much is gas at bucees"],
  openGraph: {
    title: "What's the Grocery Bill at Buc-ee's? — Today's Buc-ee's Grocery Prices",
    description: club.metaDescription,
    url: 'https://whatsthegrocerybill.com/grocery-prices/bucees',
    siteName: "What's the Grocery Bill?",
  },
  twitter: { card: 'summary', site: '@wtgbofficial', creator: '@wtgbofficial' },
  alternates: { canonical: 'https://whatsthegrocerybill.com/grocery-prices/bucees' },
}

async function getNationalAvg(): Promise<number | null> {
  try {
    const res = await fetch(`${GAS_API}/gas/states`, { next: { revalidate: 3600 } })
    if (!res.ok) return null
    const data = await res.json()
    return data.nationalAvg ?? null
  } catch { return null }
}

export default async function BuceesPage() {
  const nationalAvg = await getNationalAvg()
  return <WarehouseClubPage club={club} nationalAvg={nationalAvg} />
}
