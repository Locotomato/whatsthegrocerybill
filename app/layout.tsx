import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import Script from 'next/script'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export const metadata: Metadata = {
  title: "What's the Grocery Bill? | US Grocery Prices by State",
  description: 'Track grocery prices across the US — eggs, milk, beef, chicken, bread and more. Live data by state updated daily.',
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🛒</text></svg>",
  },
  openGraph: {
    title: "What's the Grocery Bill?",
    description: 'Track grocery prices across the US — eggs, milk, beef, chicken, bread and more. Live data by state.',
    url: 'https://whatsthegrocerybill.com',
    siteName: "What's the Grocery Bill?",
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@wtgbofficial',
    creator: '@wtgbofficial',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-PLACEHOLDER"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-PLACEHOLDER');
          `}
        </Script>
      </head>
      <body className={`${inter.className} bg-gray-950`}>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
