import type { Metadata } from 'next'
import Link from 'next/link'
import { AUTHORS } from '@/lib/authors'

export const metadata: Metadata = {
  title: "About the Editor | What's the Grocery Bill?",
  description: 'Meet Michael Spitaleri, editor-in-chief of What\'s the Grocery Bill. Learn about our AI-assisted editorial process and data-driven grocery price coverage.',
}

export default function AuthorsPage() {
  const editor = AUTHORS[0]
  const bioParagraphs = editor.bio.split('\n\n').filter(Boolean)

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg, #f0f4f8)', color: '#0f172a', padding: '48px 20px 80px' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ display: 'inline-block', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 999, padding: '6px 18px', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#1d4ed8', marginBottom: 16 }}>
            Editorial Leadership
          </div>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(26px, 5vw, 40px)', fontWeight: 900, letterSpacing: '-0.02em', color: '#0f172a', margin: '0 0 14px' }}>
            About the Editor
          </h1>
          <p style={{ fontSize: 16, color: '#64748b', lineHeight: 1.7, maxWidth: 540, margin: '0 auto' }}>
            Our grocery price coverage is produced using AI-assisted drafting tools under the editorial oversight of a named, real editor. All content is reviewed and fact-checked against official data before publication.
          </p>
        </div>

        {/* Editor card */}
        <div id={editor.slug}
          style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '28px 28px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          {/* Top row */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 18, marginBottom: 20 }}>
            <div style={{ width: 72, height: 72, borderRadius: 14, flexShrink: 0, background: '#1e3a5f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#fff', fontSize: 24, fontWeight: 800 }}>MS</span>
            </div>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1e3a5f', margin: 0, letterSpacing: '-0.02em' }}>{editor.name}</h2>
              <p style={{ color: '#64748b', fontSize: 13, margin: '5px 0 0' }}>{editor.title}</p>
              <p style={{ color: '#94a3b8', fontSize: 12, margin: '3px 0 0' }}>{editor.credential}</p>
            </div>
          </div>

          {/* Bio */}
          <div style={{ color: '#374151', lineHeight: 1.75, fontSize: 14, marginBottom: 20 }}>
            {bioParagraphs.map((para, i) => (
              <p key={i} style={{ margin: i === 0 ? 0 : '10px 0 0' }}>{para}</p>
            ))}
          </div>

          {/* Expertise */}
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#94a3b8', marginBottom: 12 }}>Editorial Coverage</div>
            <ul style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 8, margin: 0, padding: 0, listStyle: 'none' }}>
              {editor.expertise.map((item, i) => (
                <li key={i} style={{ display: 'flex', gap: 7, alignItems: 'flex-start', fontSize: 13, color: '#4b5563' }}>
                  <span style={{ color: '#1d4ed8', flexShrink: 0, marginTop: 1 }}>&#10022;</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Person Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Person',
              name: editor.name,
              jobTitle: editor.credential,
              worksFor: {
                '@type': 'Organization',
                name: "What's the Grocery Bill",
                url: 'https://whatsthegrocerybill.com',
              },
            }),
          }}
        />

        {/* Disclosure */}
        <div style={{ marginTop: 40, padding: '20px 24px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, textAlign: 'center' }}>
          <p style={{ color: '#64748b', fontSize: 13, lineHeight: 1.7, margin: 0 }}>
            Content on What&apos;s the Grocery Bill is produced using AI-assisted drafting tools under editorial oversight.
            All price data is sourced from BLS, USDA, and EIA. We never fabricate statistics.
            Published by{' '}
            <a href="https://magicmediagroup.co" style={{ color: '#1d4ed8', textDecoration: 'underline' }} target="_blank" rel="noopener noreferrer">Magic Media Group LLC</a>.
          </p>
        </div>

        <div style={{ marginTop: 28, textAlign: 'center' }}>
          <Link href="/" style={{ color: '#1d4ed8', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
            &larr; Back to Grocery Prices
          </Link>
        </div>
      </div>
    </main>
  )
}
