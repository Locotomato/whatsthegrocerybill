import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{
      minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '48px 24px',
    }}>
      <div style={{ textAlign: 'center', maxWidth: 480 }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🛒</div>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: '#f8fafc', margin: '0 0 12px', letterSpacing: '-0.02em' }}>
          Page Not Found
        </h1>
        <p style={{ color: '#94a3b8', fontSize: 16, margin: '0 0 32px', lineHeight: 1.6 }}>
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Check the latest grocery prices below.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            href="/grocery-prices"
            style={{
              background: '#16a34a', color: '#fff', fontWeight: 700,
              padding: '12px 24px', borderRadius: 8, textDecoration: 'none', fontSize: 15,
            }}
          >
            Grocery Prices by State
          </Link>
          <Link
            href="/"
            style={{
              background: 'rgba(255,255,255,0.07)', color: '#f8fafc', fontWeight: 600,
              padding: '12px 24px', borderRadius: 8, textDecoration: 'none', fontSize: 15,
              border: '1px solid rgba(255,255,255,0.12)',
            }}
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  )
}
