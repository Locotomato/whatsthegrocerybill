import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Corrections Policy | What's the Grocery Bill?",
  description: 'How whatsthegrocerybill.com handles corrections, updates, and factual errors in published content.',
}

export default function CorrectionsPage() {
  const siteName = "What's the Grocery Bill?"
  const company = 'Magic Media Group LLC'
  const contactEmail = 'info@magicmediagroup.co'

  return (
    <main style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px', fontFamily: 'Inter, sans-serif', color: '#1a1a1a', lineHeight: 1.7 }}>
      <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>Corrections Policy</h1>
      <p style={{ color: '#666', marginBottom: 32 }}>Last updated: June 5, 2026</p>

      <h2 style={{ fontSize: 22, fontWeight: 600, marginTop: 32, marginBottom: 12 }}>Our Commitment to Accuracy</h2>
      <p>{siteName} is committed to publishing accurate, data-driven information about U.S. grocery prices, food-cost trends, and consumer spending. When we get something wrong, we correct it promptly and transparently. We take every factual error seriously because our readers rely on our content for reliable grocery-price information.</p>

      <h2 style={{ fontSize: 22, fontWeight: 600, marginTop: 32, marginBottom: 12 }}>How to Report an Error</h2>
      <p>If you believe you have found a factual error in any article on {siteName}, please contact us at <a href={`mailto:${contactEmail}`} style={{ color: '#2563eb' }}>{contactEmail}</a> with the following information:</p>
      <ul style={{ paddingLeft: 24 }}>
        <li>The URL or title of the article</li>
        <li>The specific claim or data point you believe is incorrect</li>
        <li>The correct information (with a source, if available)</li>
      </ul>
      <p>We review all correction requests and respond within two business days.</p>

      <h2 style={{ fontSize: 22, fontWeight: 600, marginTop: 32, marginBottom: 12 }}>How We Handle Corrections</h2>
      <p>When a factual error is confirmed, we follow this process:</p>
      <ol style={{ paddingLeft: 24 }}>
        <li><strong>Verification:</strong> Our editorial team verifies the reported error against primary data sources (BLS, USDA, retailer data).</li>
        <li><strong>Correction:</strong> If the error is confirmed, we correct the article text as soon as possible — typically within 48 hours.</li>
        <li><strong>Correction notice:</strong> We add a dated correction note to the article explaining what was changed and when.</li>
        <li><strong>Date update:</strong> The article&apos;s review date is updated to reflect the correction.</li>
      </ol>

      <h2 style={{ fontSize: 22, fontWeight: 600, marginTop: 32, marginBottom: 12 }}>Types of Updates</h2>
      <p>We distinguish between the following types of content changes:</p>
      <ul style={{ paddingLeft: 24 }}>
        <li><strong>Corrections:</strong> Fixes to factual errors — incorrect grocery prices, wrong retailer comparisons, inaccurate cost data. These always include a correction notice.</li>
        <li><strong>Updates:</strong> Changes to reflect new data — revised grocery prices, updated BLS CPI figures, new retailer pricing. These update the review date.</li>
        <li><strong>Clarifications:</strong> Minor wording changes to improve clarity without changing the underlying facts. These do not require a correction notice.</li>
      </ul>

      <h2 style={{ fontSize: 22, fontWeight: 600, marginTop: 32, marginBottom: 12 }}>Contact</h2>
      <p>
        Send corrections or editorial concerns to <a href={`mailto:${contactEmail}`} style={{ color: '#2563eb' }}>{contactEmail}</a>. Learn more about our standards on our <a href="/editorial-policy" style={{ color: '#2563eb' }}>Editorial Policy</a> page.
      </p>
      <p>
        {company}<br />
        330 N Federal Hwy, Ste 200<br />
        Hollywood, FL 33024
      </p>
    </main>
  )
}
