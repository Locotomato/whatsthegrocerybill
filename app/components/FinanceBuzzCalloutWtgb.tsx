'use client'

// ── FinanceBuzz affiliate callout — client component so onClick works ──
function fbSubIdWtgb(slug: string): string {
  return `wtgb-${slug}`.slice(0, 100)
}

export default function FinanceBuzzCalloutWtgb({ slug }: { slug: string }) {
  const subid = fbSubIdWtgb(slug)
  const href = `/api/affiliate/click?subid=${encodeURIComponent(subid)}&slug=${encodeURIComponent(slug)}`

  function handleClick() {
    if (typeof window !== 'undefined' && (window as unknown as Record<string, unknown>).gtag) {
      ;(window as unknown as { gtag: (...args: unknown[]) => void }).gtag('event', 'affiliate_click', {
        affiliate: 'financebuzz',
        site: 'wtgb',
        article_slug: slug,
        subid,
      })
    }
  }

  return (
    <a href={href} target="_blank" rel="noopener noreferrer sponsored" onClick={handleClick} style={{
      display: 'block', margin: '28px 0', borderRadius: 12,
      border: '1px solid #fde68a',
      background: '#fffbeb', padding: '20px 24px',
      textDecoration: 'none', cursor: 'pointer',
    }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
        <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#92400e', fontWeight: 700 }}>Sponsored</span>
        <span style={{ fontSize: 10, background: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: 20, fontWeight: 700, textTransform: 'uppercase' }}>Free</span>
      </div>
      <p style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 700, color: '#1a1a2e', lineHeight: 1.4 }}>
        Grocery bills climbing? You may be missing other ways to save.
      </p>
      <p style={{ margin: '0 0 14px', fontSize: 14, color: '#374151', lineHeight: 1.6 }}>
        Lesser-known programs, discounts, and financial moves that help stretch every dollar at checkout and beyond.
      </p>
      <span style={{
        display: 'inline-block', background: '#1a1a2e', color: '#fff',
        fontWeight: 700, fontSize: 13, padding: '10px 20px',
        borderRadius: 8,
      }}>
        See What&apos;s Available →
      </span>
      <p style={{ margin: '10px 0 0', fontSize: 10, color: '#9ca3af' }}>Paid partner resource. Compensation may be received for clicks.</p>
    </a>
  )
}
