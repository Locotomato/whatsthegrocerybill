import type { Metadata } from 'next'
import { getClub } from '../../../lib/warehouseClubs'
import WarehouseClubPage from '../../components/WarehouseClubPage'

export const revalidate = 3600

const club = getClub('kroger')!

export const metadata: Metadata = {
  title: "What's the Grocery Bill at Kroger? — Kroger Grocery Prices Today",
  description: club.metaDescription,
  keywords: ["Kroger grocery price", "what is the grocery price at Kroger", "Kroger grocery price today"],
  openGraph: {
    title: "Kroger Grocery Prices Today",
    description: club.metaDescription,
    url: "https://whatsthegrocerybill.com/grocery-prices/kroger",
    siteName: "What's the Grocery Bill?",
  },
  twitter: { card: 'summary', site: '@wtgbofficial', creator: '@wtgbofficial' },
  alternates: { canonical: 'https://whatsthegrocerybill.com/grocery-prices/kroger' },
}


export default function KrogerPage() {
  return <WarehouseClubPage club={club} />
}
