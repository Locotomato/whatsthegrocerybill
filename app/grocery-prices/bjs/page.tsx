import type { Metadata } from 'next'
import { getClub } from '../../../lib/warehouseClubs'
import WarehouseClubPage from '../../components/WarehouseClubPage'

export const revalidate = 3600

const club = getClub('bjs')!

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


export default function BJsPage() {
  return <WarehouseClubPage club={club} />
}
