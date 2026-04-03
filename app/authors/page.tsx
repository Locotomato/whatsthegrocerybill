import type { Metadata } from 'next'
import Link from 'next/link'
import { AUTHORS } from '@/lib/authors'

export const metadata: Metadata = {
  title: "Our Cartoon Editorial Bureau | What's the Grocery Bill?",
  description: 'Meet Grub, Cluck, and Penny — the cartoon characters tracking grocery prices for whatsthegrocerybill.com.',
}

export default function AuthorsPage() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg, #f0f4f8)', color: '#0f172a', padding: '48px 20px 80px' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ display: 'inline-block', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 999, padding: '6px 18px', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#dc2626', marginBottom: 16 }}>
            Editorial Bureau
          </div>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(26px, 5vw, 40px)', fontWeight: 900, letterSpacing: '-0.02em', color: '#0f172a', margin: '0 0 14px' }}>
            Meet the Cartoon Bureau
          </h1>
          <p style={{ fontSize: 16, color: '#64748b', lineHeight: 1.7, maxWidth: 500, margin: '0 auto' }}>
            Our grocery price coverage is produced by AI-assisted cartoon editorial personas.
            They&apos;re not human — and honestly, that might be why you can trust them more.
          </p>
        </div>

        {/* Author cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          {AUTHORS.map(author => (
            <div key={author.slug} id={author.slug}
              style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '28px 28px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', scrollMarginTop: 80 }}>
              {/* Top row */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 18, marginBottom: 20 }}>
                <div style={{ width: 72, height: 72, borderRadius: 14, flexShrink: 0, overflow: 'hidden', border: `2px solid ${author.avatarColor}` }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={author.avatarUrl} alt={`${author.name} avatar`} width={72} height={72} style={{ width: '100%', height: '100%' }} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1e3a5f', margin: 0, letterSpacing: '-0.02em' }}>{author.name}</h2>
                    <span style={{ background: `${author.avatarColor}18`, color: author.avatarColor, fontSize: 11, fontWeight: 700, padding: '3px 11px', borderRadius: 999, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{author.credential}</span>
                  </div>
                  <p style={{ color: '#64748b', fontSize: 13, margin: '5px 0 0' }}>{author.title}</p>
                  <p style={{ color: '#94a3b8', fontSize: 12, margin: '3px 0 0', fontStyle: 'italic' }}>{author.tagline}</p>
                </div>
              </div>

              {/* Bio */}
              <div style={{ color: '#374151', lineHeight: 1.75, fontSize: 14, marginBottom: 20 }}>
                {author.bio.split('\n\n').map((para, i) => (
                  <p key={i} style={{ margin: i === 0 ? 0 : '10px 0 0' }}>{para}</p>
                ))}
              </div>

              {/* Expertise */}
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#94a3b8', marginBottom: 12 }}>Areas of Coverage</div>
                <ul style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 8, margin: 0, padding: 0, listStyle: 'none' }}>
                  {author.expertise.map((item, i) => (
                    <li key={i} style={{ display: 'flex', gap: 7, alignItems: 'flex-start', fontSize: 13, color: '#4b5563' }}>
                      <span style={{ color: author.avatarColor, flexShrink: 0, marginTop: 1 }}>✦</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Disclosure */}
        <div style={{ marginTop: 40, padding: '20px 24px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, textAlign: 'center' }}>
          <p style={{ color: '#94a3b8', fontSize: 13, lineHeight: 1.7, margin: 0 }}>
            Content on What&apos;s the Grocery Bill is produced by AI-assisted cartoon editorial personas.
            Our characters are not real humans — they represent specialized areas of coverage.
            All price data is sourced from BLS, USDA, and EIA. We never fabricate statistics.
          </p>
        </div>

        <div style={{ marginTop: 28, textAlign: 'center' }}>
          <Link href="/" style={{ color: '#dc2626', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
            ← Back to Grocery Prices
          </Link>
        </div>
      </div>
    </main>
  )
}
