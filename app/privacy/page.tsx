import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Privacy Policy | What's the Grocery Bill?",
  description: 'Privacy Policy for whatsthegrocerybill.com',
}

export default function PrivacyPage() {
  const updated = 'March 26, 2026'
  return (
    <main style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px', fontFamily: 'Inter, sans-serif', color: '#1a1a1a', lineHeight: 1.7 }}>
      <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>Privacy Policy</h1>
      <p style={{ color: '#666', marginBottom: 32 }}>Last updated: {updated}</p>

      <p>Magic Media Group LLC ("we," "our," or "us") operates <strong>whatsthegrocerybill.com</strong> (the "Site"). This Privacy Policy explains how we collect, use, and protect information when you visit the Site.</p>

      <h2 style={{ fontSize: 22, fontWeight: 600, marginTop: 32, marginBottom: 12 }}>Information We Collect</h2>
      <p><strong>Automatically collected data:</strong> When you visit the Site, we may automatically collect standard log data such as your IP address, browser type, operating system, referring URLs, pages viewed, and the date/time of your visit. This information is used for analytics and to improve Site performance.</p>
      <p><strong>Cookies:</strong> We use cookies and similar tracking technologies to analyze traffic and understand usage patterns. You may disable cookies in your browser settings, though some features of the Site may not function properly as a result.</p>
      <p><strong>Email subscriptions:</strong> If you subscribe to our alerts or newsletter, we collect your email address. We use this solely to send you the content you signed up for. You may unsubscribe at any time via the link in any email we send.</p>

      <h2 style={{ fontSize: 22, fontWeight: 600, marginTop: 32, marginBottom: 12 }}>How We Use Information</h2>
      <ul style={{ paddingLeft: 24 }}>
        <li>To provide and improve the Site and its content</li>
        <li>To send email alerts or newsletters you have requested</li>
        <li>To analyze usage trends and optimize performance</li>
        <li>To comply with legal obligations</li>
      </ul>

      <h2 style={{ fontSize: 22, fontWeight: 600, marginTop: 32, marginBottom: 12 }}>Third-Party Advertising</h2>
      <p>We work with third-party advertising partners, including Google AdSense/Ad Manager, to serve ads on this Site. These partners may use cookies, web beacons, and similar technologies to collect information about your visits to this and other websites in order to provide interest-based advertising.</p>
      <p>Google&apos;s use of advertising cookies enables it and its partners to serve ads based on your prior visits to this Site or other sites.</p>
      <p><strong>Opting out of interest-based advertising:</strong> You may opt out of personalized advertising at any time using the following tools:</p>
      <ul style={{ paddingLeft: 24 }}>
        <li><a href="https://www.google.com/settings/ads" style={{ color: '#2563eb' }} target="_blank" rel="noopener noreferrer">Google Ads Settings</a></li>
        <li><a href="https://optout.networkadvertising.org/" style={{ color: '#2563eb' }} target="_blank" rel="noopener noreferrer">Network Advertising Initiative (NAI) Opt-Out</a></li>
        <li><a href="https://optout.aboutads.info/" style={{ color: '#2563eb' }} target="_blank" rel="noopener noreferrer">Digital Advertising Alliance (DAA) Opt-Out</a></li>
      </ul>
      <p>Opting out means you will no longer receive ads tailored to your interests, but you will still see ads.</p>

      <h2 style={{ fontSize: 22, fontWeight: 600, marginTop: 32, marginBottom: 12 }}>Third-Party Services</h2>
      <p>We may use third-party analytics services (such as Google Analytics or Vercel Analytics) that collect data subject to their own privacy policies. We do not sell your personal information to third parties.</p>

      <h2 style={{ fontSize: 22, fontWeight: 600, marginTop: 32, marginBottom: 12 }}>Data Retention</h2>
      <p>We retain email addresses for active subscribers until you unsubscribe. Analytics data is retained in accordance with the applicable third-party service's data retention policy.</p>

      <h2 style={{ fontSize: 22, fontWeight: 600, marginTop: 32, marginBottom: 12 }}>Children's Privacy</h2>
      <p>This Site is not directed to children under 13. We do not knowingly collect personal information from children under 13.</p>

      <h2 style={{ fontSize: 22, fontWeight: 600, marginTop: 32, marginBottom: 12 }}>Your Rights</h2>
      <p>Depending on your location, you may have rights to access, correct, or delete your personal data. To exercise these rights, contact us at the address below.</p>

      <h2 style={{ fontSize: 22, fontWeight: 600, marginTop: 32, marginBottom: 12 }}>Contact Us</h2>
      <p>
        Magic Media Group LLC<br />
        330 N Federal Hwy, Ste 200<br />
        Hollywood, FL 33024<br />
        Email: <a href="mailto:info@magicmediagroup.co" style={{ color: '#2563eb' }}>info@magicmediagroup.co</a>
      </p>

      <h2 style={{ fontSize: 22, fontWeight: 600, marginTop: 32, marginBottom: 12 }}>Changes to This Policy</h2>
      <p>We may update this Privacy Policy from time to time. We will post the updated policy on this page with a revised "Last updated" date.</p>
    </main>
  )
}
