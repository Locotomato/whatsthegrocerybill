import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Grocery Price Guides — What's the Grocery Bill?",
  description: 'In-depth guides explaining why Grocery Prices rise and fall, how taxes affect pump prices, and how administrations have influenced fuel costs.',
  openGraph: {
    title: "Grocery Price Guides — What's the Grocery Bill?",
    description: 'In-depth guides on Grocery Prices, state taxes, and US energy policy.',
  },
}

export default function GuidesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
