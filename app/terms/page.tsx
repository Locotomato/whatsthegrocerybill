import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Terms of Service | What's the Grocery Bill?",
  description: 'Terms of Service for whatsthegrocerybill.com',
}

export default function TermsPage() {
  const updated = 'June 5, 2026'
  return (
    <main style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px', fontFamily: 'Inter, sans-serif', color: '#1a1a1a', lineHeight: 1.7 }}>
      <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>Terms of Service</h1>
      <p style={{ color: '#666', marginBottom: 32 }}>Last updated: {updated}</p>

      <p>These Terms of Service (&quot;Terms&quot;) govern your use of <strong>whatsthegrocerybill.com</strong> (the &quot;Site&quot;), operated by Magic Media Group LLC (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). By accessing or using the Site you agree to be bound by these Terms. If you do not agree, do not use the Site.</p>

      <h2 style={{ fontSize: 22, fontWeight: 600, marginTop: 32, marginBottom: 12 }}>1. About the Site</h2>
      <p>The Site publishes informational content about U.S. grocery prices, food cost trends, household budgeting, and related consumer topics. Content includes articles, data visualizations, state-by-state comparisons, and price-tracking tools derived from publicly available datasets such as the Bureau of Labor Statistics Consumer Price Index and the USDA Economic Research Service.</p>

      <h2 style={{ fontSize: 22, fontWeight: 600, marginTop: 32, marginBottom: 12 }}>2. Permitted Use</h2>
      <p>You may access and use the Site for personal, non-commercial purposes. You agree not to:</p>
      <ul style={{ paddingLeft: 24 }}>
        <li>Scrape, crawl, or systematically extract data from the Site without our prior written consent</li>
        <li>Use the Site or its content for any unlawful purpose</li>
        <li>Attempt to disrupt, degrade, or interfere with the Site&apos;s infrastructure or security</li>
        <li>Reproduce, distribute, or create derivative works from Site content without written permission</li>
        <li>Frame or embed Site pages on third-party websites without authorization</li>
      </ul>

      <h2 style={{ fontSize: 22, fontWeight: 600, marginTop: 32, marginBottom: 12 }}>3. Informational Purposes Only</h2>
      <p>All grocery pricing data, articles, charts, and other content on the Site are provided for general informational purposes only. Grocery prices vary by retailer, region, and time of purchase. We make no guarantee as to the accuracy, completeness, or timeliness of any data presented. Always check current shelf prices at your local store before making purchasing decisions based on information from this Site.</p>

      <h2 style={{ fontSize: 22, fontWeight: 600, marginTop: 32, marginBottom: 12 }}>4. AI-Assisted Content Disclosure</h2>
      <p>Some articles on this Site are drafted with artificial-intelligence assistance and reviewed by our editorial team before publication. Our editorial process is described on our <a href="/editorial-policy" style={{ color: '#2563eb' }}>Editorial Policy</a> page. We strive for accuracy but errors may occur; if you spot an inaccuracy, please contact us using the information below.</p>

      <h2 style={{ fontSize: 22, fontWeight: 600, marginTop: 32, marginBottom: 12 }}>5. Intellectual Property</h2>
      <p>All original content on the Site — including text, data visualizations, graphics, logos, and software — is the property of Magic Media Group LLC or its licensors and is protected by U.S. copyright and trademark law. Grocery pricing data derived from government sources is used in compliance with applicable open-data licenses. You may quote brief excerpts with attribution and a link back to the original page.</p>

      <h2 style={{ fontSize: 22, fontWeight: 600, marginTop: 32, marginBottom: 12 }}>6. Third-Party Links and Services</h2>
      <p>The Site may link to third-party websites, advertisers, or data providers. We do not control and are not responsible for the content, privacy practices, or availability of any linked site. Inclusion of a link does not imply endorsement.</p>

      <h2 style={{ fontSize: 22, fontWeight: 600, marginTop: 32, marginBottom: 12 }}>7. Disclaimer of Warranties</h2>
      <p>THE SITE AND ITS CONTENT ARE PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED. WE DISCLAIM ALL WARRANTIES, INCLUDING IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SITE WILL BE UNINTERRUPTED, ERROR-FREE, OR FREE OF HARMFUL COMPONENTS.</p>

      <h2 style={{ fontSize: 22, fontWeight: 600, marginTop: 32, marginBottom: 12 }}>8. Limitation of Liability</h2>
      <p>TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, MAGIC MEDIA GROUP LLC AND ITS OFFICERS, DIRECTORS, AND EMPLOYEES SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM OR RELATED TO YOUR USE OF, OR INABILITY TO USE, THE SITE OR ITS CONTENT, EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.</p>

      <h2 style={{ fontSize: 22, fontWeight: 600, marginTop: 32, marginBottom: 12 }}>9. Changes to These Terms</h2>
      <p>We may update these Terms from time to time. The &quot;Last updated&quot; date at the top of this page reflects the most recent revision. Continued use of the Site after a change constitutes your acceptance of the revised Terms.</p>

      <h2 style={{ fontSize: 22, fontWeight: 600, marginTop: 32, marginBottom: 12 }}>10. Governing Law</h2>
      <p>These Terms are governed by and construed in accordance with the laws of the State of Florida, without regard to its conflict-of-law provisions. Any dispute arising under these Terms shall be subject to the exclusive jurisdiction of the state and federal courts located in Broward County, Florida.</p>

      <h2 style={{ fontSize: 22, fontWeight: 600, marginTop: 32, marginBottom: 12 }}>11. Contact</h2>
      <p>
        Magic Media Group LLC<br />
        330 N Federal Hwy, Ste 200<br />
        Hollywood, FL 33024<br />
        Email: <a href="mailto:info@magicmediagroup.co" style={{ color: '#2563eb' }}>info@magicmediagroup.co</a>
      </p>
    </main>
  )
}
