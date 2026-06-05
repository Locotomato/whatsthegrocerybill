import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Privacy Policy | What's the Grocery Bill?",
  description: 'Privacy Policy for whatsthegrocerybill.com',
}

export default function PrivacyPage() {
  const updated = 'June 5, 2026'
  return (
    <main style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px', fontFamily: 'Inter, sans-serif', color: '#1a1a1a', lineHeight: 1.7 }}>
      <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>Privacy Policy</h1>
      <p style={{ color: '#666', marginBottom: 32 }}>Last updated: {updated}</p>

      <p>Magic Media Group LLC (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) operates <strong>whatsthegrocerybill.com</strong> (the &quot;Site&quot;), a consumer-information resource focused on U.S. grocery prices, food cost trends, and household budgeting. This Privacy Policy describes the categories of information we collect, how we use that information, and the choices available to you.</p>

      <h2 style={{ fontSize: 22, fontWeight: 600, marginTop: 32, marginBottom: 12 }}>1. Information We Collect</h2>

      <h3 style={{ fontSize: 18, fontWeight: 600, marginTop: 20, marginBottom: 8 }}>a. Information collected automatically</h3>
      <p>When you browse the Site we collect technical data through server logs and analytics tools: IP address, device type, browser version, screen resolution, referring URL, pages visited, and timestamps. We use this data to monitor performance, identify popular content, and diagnose technical issues.</p>

      <h3 style={{ fontSize: 18, fontWeight: 600, marginTop: 20, marginBottom: 8 }}>b. Grocery price and cost-of-living data</h3>
      <p>The Site aggregates publicly available grocery pricing information from government sources including the Bureau of Labor Statistics (BLS) Consumer Price Index, the USDA Economic Research Service, and state agriculture departments. We do not collect personal purchase data from individual shoppers. Our data pipeline processes publicly released commodity datasets to produce the price comparisons and trend analyses displayed on the Site.</p>

      <h3 style={{ fontSize: 18, fontWeight: 600, marginTop: 20, marginBottom: 8 }}>c. Newsletter subscriptions</h3>
      <p>If you subscribe to our grocery-price alert emails we collect your email address and, optionally, your state or metro area so we can send location-relevant price updates. Subscription is voluntary and you may unsubscribe at any time using the link included in every email.</p>

      <h3 style={{ fontSize: 18, fontWeight: 600, marginTop: 20, marginBottom: 8 }}>d. Cookies and similar technologies</h3>
      <p>We set first-party cookies for analytics (Vercel Web Analytics) and third-party cookies through our advertising partners. You can manage cookie preferences through your browser settings. Disabling cookies may limit certain interactive features such as state-level price comparisons.</p>

      <h2 style={{ fontSize: 22, fontWeight: 600, marginTop: 32, marginBottom: 12 }}>2. How We Use Your Information</h2>
      <ul style={{ paddingLeft: 24 }}>
        <li>Delivering and improving grocery price content, data visualizations, and state/city comparison tools</li>
        <li>Sending price-alert newsletters to subscribers who opt in</li>
        <li>Analyzing aggregate traffic patterns to prioritize coverage of the commodities and regions readers care about most</li>
        <li>Serving contextually relevant advertisements through our advertising partners</li>
        <li>Meeting legal and regulatory obligations</li>
      </ul>

      <h2 style={{ fontSize: 22, fontWeight: 600, marginTop: 32, marginBottom: 12 }}>3. Advertising</h2>
      <p>We display advertisements served by Google AdSense and other programmatic advertising partners. These partners may use cookies and web beacons to measure ad performance and deliver interest-based ads. Google&apos;s advertising cookies, including the DoubleClick cookie, enable Google and its partners to serve ads based on your browsing activity across the web.</p>
      <p>You can control interest-based advertising through:</p>
      <ul style={{ paddingLeft: 24 }}>
        <li><a href="https://www.google.com/settings/ads" style={{ color: '#2563eb' }} target="_blank" rel="noopener noreferrer">Google Ads Settings</a></li>
        <li><a href="https://optout.networkadvertising.org/" style={{ color: '#2563eb' }} target="_blank" rel="noopener noreferrer">Network Advertising Initiative Opt-Out</a></li>
        <li><a href="https://optout.aboutads.info/" style={{ color: '#2563eb' }} target="_blank" rel="noopener noreferrer">Digital Advertising Alliance Opt-Out</a></li>
      </ul>
      <p>Opting out does not remove advertising from the Site; it means the ads you see will no longer be tailored to your browsing history.</p>

      <h2 style={{ fontSize: 22, fontWeight: 600, marginTop: 32, marginBottom: 12 }}>4. Third-Party Services</h2>
      <p>We use the following third-party services that process data under their own privacy policies:</p>
      <ul style={{ paddingLeft: 24 }}>
        <li><strong>Vercel</strong> — hosting and edge delivery</li>
        <li><strong>Google Analytics</strong> — traffic measurement</li>
        <li><strong>Google AdSense</strong> — display advertising</li>
        <li><strong>Pexels</strong> — licensed stock imagery displayed on articles</li>
      </ul>
      <p>We do not sell your personal information to third parties.</p>

      <h2 style={{ fontSize: 22, fontWeight: 600, marginTop: 32, marginBottom: 12 }}>5. Data Retention</h2>
      <p>Newsletter subscriber email addresses are retained until you unsubscribe. Server logs are retained for 90 days and then deleted. Analytics data is retained according to the retention settings of the applicable third-party analytics service.</p>

      <h2 style={{ fontSize: 22, fontWeight: 600, marginTop: 32, marginBottom: 12 }}>6. Children&apos;s Privacy</h2>
      <p>The Site is intended for a general audience. We do not knowingly collect personal information from children under the age of 13. If you believe a child has provided us with personal information, contact us and we will delete it promptly.</p>

      <h2 style={{ fontSize: 22, fontWeight: 600, marginTop: 32, marginBottom: 12 }}>7. Your Rights</h2>
      <p>Depending on where you live, applicable privacy laws (including the California Consumer Privacy Act and state equivalents) may give you the right to request access to, correction of, or deletion of your personal data. To exercise any of these rights, email us at the address below. We will respond within the timeframe required by applicable law.</p>

      <h2 style={{ fontSize: 22, fontWeight: 600, marginTop: 32, marginBottom: 12 }}>8. Changes to This Policy</h2>
      <p>We may revise this Privacy Policy periodically. The &quot;Last updated&quot; date at the top of this page indicates when the most recent changes took effect. Your continued use of the Site after a revision constitutes acceptance of the updated policy.</p>

      <h2 style={{ fontSize: 22, fontWeight: 600, marginTop: 32, marginBottom: 12 }}>9. Contact</h2>
      <p>
        Magic Media Group LLC<br />
        330 N Federal Hwy, Ste 200<br />
        Hollywood, FL 33024<br />
        Email: <a href="mailto:info@magicmediagroup.co" style={{ color: '#2563eb' }}>info@magicmediagroup.co</a>
      </p>
    </main>
  )
}
