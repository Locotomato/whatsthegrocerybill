import type { Metadata } from 'next'
import { getClub } from '../../../lib/warehouseClubs'
import WarehouseClubPage from '../../components/WarehouseClubPage'

export const revalidate = 3600

const club = getClub('sams-club')!

export const metadata: Metadata = {
  title: "What's the Grocery Bill at Sam's Club? — Sam's Club Grocery Prices Today",
  description: club.metaDescription,
  keywords: ["Sam's Club grocery price", "what is the grocery price at Sam's Club", "Sam's Club grocery price today"],
  openGraph: {
    title: "Sam's Club Grocery Prices Today",
    description: club.metaDescription,
    url: "https://whatsthegrocerybill.com/grocery-prices/sams-club",
    siteName: "What's the Grocery Bill?",
  },
  twitter: { card: 'summary', site: '@wtgbofficial', creator: '@wtgbofficial' },
  alternates: { canonical: 'https://whatsthegrocerybill.com/grocery-prices/sams-club' },
}


export default function SamsClubPage() {
  return <WarehouseClubPage club={club} />
}
