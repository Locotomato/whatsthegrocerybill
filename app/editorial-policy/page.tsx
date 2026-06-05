import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Editorial Policy | What's the Grocery Bill?",
  description: 'Editorial standards, review process, and AI disclosure practices at whatsthegrocerybill.com.',
}

export default function EditorialPolicyPage() {
  const siteName = "What's the Grocery Bill?"
  const company = 'Magic Media Group LLC'
  const contactEmail = 'info@magicmediagroup.co'

  return (
    <main style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px', fontFamily: 'Inter, sans-serif', color: '#1a1a1a', lineHeight: 1.7 }}>
      <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>Editorial Policy</h1>
      <p style={{ color: '#666', marginBottom: 32 }}>Last updated: June 5, 2026</p>

      <h2 style={{ fontSize: 22, fontWeight: 600, marginTop: 32, marginBottom: 12 }}>Responsible Editor</h2>
      <p>All editorial content published on {siteName} is overseen by <strong>Michael Spitaleri</strong>, Founder and Editor-in-Chief, who is responsible for ensuring accuracy, fairness, and adherence to the standards described on this page.</p>

      <h2 style={{ fontSize: 22, fontWeight: 600, marginTop: 32, marginBottom: 12 }}>Our Editorial Mission</h2>
      <p>{siteName} provides independent editorial coverage of U.S. grocery prices, food-cost trends, and consumer spending analysis. Our goal is to give consumers clear, data-driven information about grocery costs — what they are, why they change, and how to save money on food.</p>
      <p>We are not affiliated with any grocery retailer, food manufacturer, or government agency. Our content is for informational purposes only.</p>

      <h2 style={{ fontSize: 22, fontWeight: 600, marginTop: 32, marginBottom: 12 }}>Content Standards</h2>
      <ul style={{ paddingLeft: 24 }}>
        <li><strong>Data-driven:</strong> Our grocery-price reporting draws on publicly available data from the Bureau of Labor Statistics (BLS), USDA Economic Research Service, retailer-published pricing, and industry research.</li>
        <li><strong>Source-cited:</strong> We cite data sources within articles and link to primary datasets when available. We do not publish price claims without a verifiable source.</li>
        <li><strong>Current and reviewed:</strong> Each article includes a review date. Grocery prices change frequently; we update content regularly to reflect current market conditions.</li>
        <li><strong>No misleading claims:</strong> We do not predict future grocery prices with certainty, guarantee savings at specific stores, or make unsupported claims about food costs. We use qualified language and present data in context.</li>
      </ul>

      <h2 style={{ fontSize: 22, fontWeight: 600, marginTop: 32, marginBottom: 12 }}>AI Disclosure</h2>
      <p>Our editorial team uses AI writing tools to assist with data analysis, research, and initial content drafting. All AI-assisted content is reviewed and edited by our editorial team against our content standards before publication. AI tools are never used as the sole author of published content. We disclose AI assistance on our <a href="/authors" style={{ color: '#2563eb' }}>Authors page</a>.</p>

      <h2 style={{ fontSize: 22, fontWeight: 600, marginTop: 32, marginBottom: 12 }}>Review Process</h2>
      <p>Every article published on {siteName} goes through a multi-step review process:</p>
      <ol style={{ paddingLeft: 24 }}>
        <li><strong>Research:</strong> Topics are sourced from BLS data releases, USDA reports, retailer pricing trends, reader questions, and current food-market developments.</li>
        <li><strong>Drafting:</strong> Content is drafted by our editorial team, sometimes with AI assistance for data analysis and structuring.</li>
        <li><strong>Fact-check:</strong> Price data and market claims are verified against primary sources (BLS, USDA, retailer data) before publication.</li>
        <li><strong>Editorial review:</strong> The Managing Editor reviews each article for accuracy, clarity, and compliance with our editorial standards.</li>
        <li><strong>Ongoing updates:</strong> Published articles are reviewed periodically and updated when grocery prices, market conditions, or retailer data change.</li>
      </ol>

      <h2 style={{ fontSize: 22, fontWeight: 600, marginTop: 32, marginBottom: 12 }}>Editorial Independence</h2>
      <p>We work with third-party advertising partners, including Google, to display advertisements on the Site. This advertising revenue never influences our editorial content, the topics we cover, or the conclusions we reach. Our editorial team operates independently from our advertising relationships. See our <a href="/privacy" style={{ color: '#2563eb' }}>Privacy Policy</a> for details on advertising and data practices.</p>

      <h2 style={{ fontSize: 22, fontWeight: 600, marginTop: 32, marginBottom: 12 }}>Contact</h2>
      <p>
        For editorial questions, concerns, or to report an error, contact us at <a href={`mailto:${contactEmail}`} style={{ color: '#2563eb' }}>{contactEmail}</a>. See our <a href="/corrections" style={{ color: '#2563eb' }}>Corrections Policy</a> for details on how we handle factual errors.
      </p>
      <p>
        {company}<br />
        330 N Federal Hwy, Ste 200<br />
        Hollywood, FL 33024
      </p>
    </main>
  )
}
