import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Terms of Service | What's the Grocery Bill?",
  description: 'Terms of Service for whatsthegrocerybill.com',
}

export default function TermsPage() {
  const updated = 'March 26, 2026'
  return (
    <main style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px', fontFamily: 'Inter, sans-serif', color: '#1a1a1a', lineHeight: 1.7 }}>
      <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>Terms of Service</h1>
      <p style={{ color: '#666', marginBottom: 32 }}>Last updated: {updated}</p>

      <p>These Terms of Service ("Terms") govern your use of <strong>whatsthegrocerybill.com</strong> (the "Site"), operated by Magic Media Group LLC ("we," "our," or "us"). By accessing or using the Site, you agree to these Terms.</p>

      <h2 style={{ fontSize: 22, fontWeight: 600, marginTop: 32, marginBottom: 12 }}>Use of the Site</h2>
      <p>The Site provides informational content about US grocery price trends. You may use the Site for personal, non-commercial purposes. You agree not to:</p>
      <ul style={{ paddingLeft: 24 }}>
        <li>Scrape or systematically extract data from the Site without our written permission</li>
        <li>Use the Site for any unlawful purpose</li>
        <li>Attempt to interfere with the Site's operation or security</li>
        <li>Reproduce or redistribute content from the Site without attribution</li>
      </ul>

      <h2 style={{ fontSize: 22, fontWeight: 600, marginTop: 32, marginBottom: 12 }}>Informational Purposes Only</h2>
      <p>All grocery price data, articles, and content on the Site are provided for informational purposes only. We make no guarantee as to the accuracy, completeness, or timeliness of the information. Gas prices can change rapidly; always verify current prices at the pump or through official sources before making decisions.</p>

      <h2 style={{ fontSize: 22, fontWeight: 600, marginTop: 32, marginBottom: 12 }}>Intellectual Property</h2>
      <p>All content on the Site, including text, graphics, logos, and data visualizations, is the property of Magic Media Group LLC or its content providers and is protected by applicable intellectual property laws. You may not reproduce, distribute, or create derivative works without our express written consent.</p>

      <h2 style={{ fontSize: 22, fontWeight: 600, marginTop: 32, marginBottom: 12 }}>Disclaimer of Warranties</h2>
      <p>THE SITE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. WE DISCLAIM ALL WARRANTIES, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.</p>

      <h2 style={{ fontSize: 22, fontWeight: 600, marginTop: 32, marginBottom: 12 }}>Limitation of Liability</h2>
      <p>TO THE FULLEST EXTENT PERMITTED BY LAW, MAGIC MEDIA GROUP LLC SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE SITE OR ITS CONTENT.</p>

      <h2 style={{ fontSize: 22, fontWeight: 600, marginTop: 32, marginBottom: 12 }}>Third-Party Links</h2>
      <p>The Site may contain links to third-party websites. We are not responsible for the content or practices of any linked sites and provide these links for your convenience only.</p>

      <h2 style={{ fontSize: 22, fontWeight: 600, marginTop: 32, marginBottom: 12 }}>Changes to Terms</h2>
      <p>We reserve the right to modify these Terms at any time. Continued use of the Site after changes are posted constitutes your acceptance of the revised Terms.</p>

      <h2 style={{ fontSize: 22, fontWeight: 600, marginTop: 32, marginBottom: 12 }}>Governing Law</h2>
      <p>These Terms are governed by the laws of the State of Florida, without regard to conflict of law principles.</p>

      <h2 style={{ fontSize: 22, fontWeight: 600, marginTop: 32, marginBottom: 12 }}>Contact Us</h2>
      <p>
        Magic Media Group LLC<br />
        330 N Federal Hwy, Ste 200<br />
        Hollywood, FL 33024<br />
        Email: <a href="mailto:michael@magicmediagroup.co" style={{ color: '#2563eb' }}>michael@magicmediagroup.co</a>
      </p>
    </main>
  )
}
