import type { Metadata } from 'next'
import { getClub } from '../../../lib/warehouseClubs'
import WarehouseClubPage from '../../components/WarehouseClubPage'

export const revalidate = 3600

const club = getClub('walmart')!

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


export default function WalmartPage() {
  return <WarehouseClubPage club={club} />
}
