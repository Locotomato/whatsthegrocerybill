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
        {/* AdSense — plain script tag so Google's crawler sees it in raw HTML */}
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9017750219468820"
          crossOrigin="anonymous"
        />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-04DFV0Z2NJ"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-04DFV0Z2NJ');
          `}
        </Script>
      </head>
      <body className={`${inter.className} bg-gray-950`}>
        {children}
        {/* Loco Tomato embed script — loaded once globally, dedup handled by embed.v1.js */}
        <Script
          src="https://locotomato.com/embed.v1.js"
          data-partner="pub_rs2wayi1"
          data-campaign="cmp_8c54fcc7"
          strategy="lazyOnload"
        />
        <footer style={{ borderTop: '1px solid #1f2937', marginTop: 48, padding: '20px 24px', textAlign: 'center' }}>
          <p style={{ color: '#6b7280', fontSize: 13, margin: 0 }}>
            © {new Date().getFullYear()} Magic Media Group LLC &nbsp;·&nbsp;
            <a href="/privacy" style={{ color: '#9ca3af', textDecoration: 'none' }}>Privacy Policy</a>
            &nbsp;·&nbsp;
            <a href="/terms" style={{ color: '#9ca3af', textDecoration: 'none' }}>Terms of Service</a>
            &nbsp;·&nbsp;
            <a href="/authors" style={{ color: '#9ca3af', textDecoration: 'none' }}>Our Writers</a>
          </p>
        </footer>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
