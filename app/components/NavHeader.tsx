import Link from 'next/link'

export default function NavHeader({ active }: { active?: 'prices' | 'grocery-prices' | 'news' | 'guides' | 'near-me' }) {
  const linkStyle = (page: string) => ({
    fontSize: 12, fontWeight: 600 as const,
    color: active === page ? '#fff' : '#cbd5e1',
    textDecoration: 'none' as const,
    padding: '4px 10px',
    borderBottom: active === page ? '2px solid var(--red)' : '2px solid transparent',
  })

  return (
    <header style={{ background: 'var(--navy)', borderBottom: '3px solid var(--red)', padding: '0 20px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 54 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <span style={{ fontSize: 20 }}>🛒</span>
          <span style={{ fontSize: 15, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>
            What&apos;s the Grocery Bill?
          </span>
        </Link>
        <nav style={{ display: 'flex', gap: 2 }}>
          <Link href="/grocery-prices" style={linkStyle('prices')}>By State</Link>
          <Link href="/near-me"        style={linkStyle('near-me')}>Near Me</Link>
          <Link href="/news"           style={linkStyle('news')}>News</Link>
          <Link href="/guides"         style={linkStyle('guides')}>Guides</Link>
        </nav>
      </div>
    </header>
  )
}
