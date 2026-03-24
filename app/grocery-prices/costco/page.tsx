import type { Metadata } from 'next'
import { getClub } from '../../../lib/warehouseClubs'
import WarehouseClubPage from '../../components/WarehouseClubPage'

export const revalidate = 3600

const club = getClub('costco')!

export const metadata: Metadata = {
  title: "What's the Grocery Bill at Costco? — Costco Grocery Prices Today",
  description: club.metaDescription,
  keywords: ["Costco grocery price", "what is the grocery price at Costco", "Costco grocery price today"],
  openGraph: {
    title: "Costco Grocery Prices Today",
    description: club.metaDescription,
    url: "https://whatsthegrocerybill.com/grocery-prices/costco",
    siteName: "What's the Grocery Bill?",
  },
  twitter: { card: 'summary', site: '@wtgbofficial', creator: '@wtgbofficial' },
  alternates: { canonical: 'https://whatsthegrocerybill.com/grocery-prices/costco' },
}


export default function CostcoPage() {
  return <WarehouseClubPage club={club} />
}
