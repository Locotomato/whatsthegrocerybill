'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { STATE_CITIES } from '../../../lib/cities'
import NavHeader from '../../components/NavHeader'

// State slug map — reverse lookup from abbr to slug
const STATE_ABBR_TO_SLUG: Record<string, string> = {
  AL: 'alabama', AK: 'alaska', AZ: 'arizona', AR: 'arkansas',
  CA: 'california', CO: 'colorado', CT: 'connecticut', DE: 'delaware',
  FL: 'florida', GA: 'georgia', HI: 'hawaii', ID: 'idaho',
  IL: 'illinois', IN: 'indiana', IA: 'iowa', KS: 'kansas',
  KY: 'kentucky', LA: 'louisiana', ME: 'maine', MD: 'maryland',
  MA: 'massachusetts', MI: 'michigan', MN: 'minnesota', MS: 'mississippi',
  MO: 'missouri', MT: 'montana', NE: 'nebraska', NV: 'nevada',
  NH: 'new-hampshire', NJ: 'new-jersey', NM: 'new-mexico', NY: 'new-york',
  NC: 'north-carolina', ND: 'north-dakota', OH: 'ohio', OK: 'oklahoma',
  OR: 'oregon', PA: 'pennsylvania', RI: 'rhode-island', SC: 'south-carolina',
  SD: 'south-dakota', TN: 'tennessee', TX: 'texas', UT: 'utah',
  VT: 'vermont', VA: 'virginia', WA: 'washington', WV: 'west-virginia',
  WI: 'wisconsin', WY: 'wyoming',
}

type Status = 'idle' | 'requesting' | 'locating' | 'denied' | 'error' | 'found'

export default function NearMePage() {
  const router = useRouter()
  const [status, setStatus] = useState<Status>('idle')
  const [message, setMessage] = useState('')

  useEffect(() => {
    // Auto-trigger on mount
    requestLocation()
  }, [])

  async function requestLocation() {
    if (!navigator.geolocation) {
      setStatus('error')
      setMessage('Geolocation is not supported by your browser.')
      return
    }

    setStatus('requesting')
    setMessage('Finding your location…')

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setStatus('locating')
        setMessage('Looking up Grocery Prices near you…')

        try {
          const { latitude, longitude } = pos.coords
          // Reverse geocode using free bigdatacloud API (no key needed)
          const res = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          )
          const data = await res.json()

          const stateAbbr: string = data.principalSubdivisionCode?.replace('US-', '') ?? ''
          const city: string      = data.city || data.locality || ''

          const stateSlug = STATE_ABBR_TO_SLUG[stateAbbr]
          if (!stateSlug) {
            setStatus('error')
            setMessage(`We don't have data for ${stateAbbr || 'your state'} yet. Try browsing by state.`)
            return
          }

          // Try to match a known city
          const stateCities = STATE_CITIES[stateSlug] ?? []
          const cityMatch = stateCities.find(c =>
            c.name.toLowerCase() === city.toLowerCase() ||
            c.slug === city.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
          )

          setStatus('found')
          if (cityMatch) {
            setMessage(`Found you — redirecting to ${city}, ${stateAbbr}…`)
            router.push(`/grocery-prices/${stateSlug}/${cityMatch.slug}`)
          } else {
            setMessage(`Redirecting to ${stateAbbr} Grocery Prices…`)
            router.push(`/grocery-prices/${stateSlug}`)
          }
        } catch {
          setStatus('error')
          setMessage('Could not determine your location. Browse by state below.')
        }
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setStatus('denied')
          setMessage('Location access denied. Browse by state below.')
        } else {
          setStatus('error')
          setMessage('Could not get your location. Browse by state below.')
        }
      },
      { timeout: 10000, maximumAge: 300000 }
    )
  }

  const spinnerVisible = status === 'requesting' || status === 'locating' || status === 'found'

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 20px 40px' }}>
      <NavHeader active="prices" />

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🛒</div>
        <h1 style={{ fontSize: 28, fontWeight: 900, margin: '0 0 8px' }}>
          Grocery Prices Near Me
        </h1>
        <p style={{ color: 'var(--subtle)', fontSize: 14, margin: 0 }}>
          Real-time Grocery Prices for your location
        </p>
      </div>

      {/* Status card */}
      <div style={{
        background: '#fff',
        border: '1px solid var(--border)',
        borderRadius: 16,
        padding: '32px 40px',
        textAlign: 'center',
        maxWidth: 400,
        width: '100%',
        marginBottom: 40,
      }}>
        {spinnerVisible && (
          <div style={{
            width: 40, height: 40, border: '3px solid rgba(255,255,255,0.1)',
            borderTopColor: '#ef4444', borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 16px',
          }} />
        )}

        {status === 'denied' && (
          <div style={{ fontSize: 32, marginBottom: 12 }}>🚫</div>
        )}
        {status === 'error' && (
          <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
        )}

        <p style={{ color: 'var(--text)', fontSize: 15, margin: '0 0 20px', lineHeight: 1.5 }}>
          {message || 'Tap below to find Grocery Prices in your area.'}
        </p>

        {(status === 'idle' || status === 'denied' || status === 'error') && (
          <button
            onClick={requestLocation}
            style={{
              background: '#ef4444',
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              padding: '12px 28px',
              fontSize: 15,
              fontWeight: 700,
              cursor: 'pointer',
              marginBottom: 12,
            }}
          >
            📍 Use My Location
          </button>
        )}
      </div>

      {/* Browse by state fallback */}
      {(status === 'denied' || status === 'error' || status === 'idle') && (
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 16 }}>
            or browse all states:
          </p>
          <a
            href="/grocery-prices"
            style={{
              display: 'inline-block',
              background: '#f8fafc',
              border: '1px solid var(--border)',
              borderRadius: 10,
              padding: '10px 24px',
              color: 'var(--subtle)',
              textDecoration: 'none',
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            🗺 View All State Grocery Prices →
          </a>
        </div>
      )}

      {/* CSS for spinner */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </main>
  )
}
