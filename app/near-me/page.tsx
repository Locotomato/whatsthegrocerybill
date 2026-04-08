import type { Metadata } from 'next'
import NavHeader from '../components/NavHeader'
import NearMeClient from './NearMeClient'

export const metadata: Metadata = {
  title: "Grocery Prices Near Me — Local Grocery Costs Today | whatsthegrocerybill.com",
  description: "Find current grocery prices near you. See what eggs, milk, bread, chicken, beef, and coffee cost in your area today, updated from BLS data.",
  alternates: { canonical: 'https://whatsthegrocerybill.com/near-me' },
  openGraph: {
    title: "Grocery Prices Near Me",
    description: "Current grocery prices in your area — eggs, milk, bread, beef, chicken, and coffee. Updated from BLS CPI data.",
    url: 'https://whatsthegrocerybill.com/near-me',
    siteName: "What's the Grocery Bill?",
    type: 'website',
  },
  twitter: { card: 'summary', title: "Grocery Prices Near Me", site: '@wtgbofficial' },
}

export default function NearMePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <NavHeader active="near-me" />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            🛒 Grocery Prices Near Me
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            See what groceries cost in your area today. We&apos;ll look up prices based on your location.
          </p>
        </div>
        <NearMeClient />
      </main>
      <div data-loco-widget></div>
    </div>
  )
}
