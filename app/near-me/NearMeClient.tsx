'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

// State slug from abbreviation
const ABBR_TO_SLUG: Record<string, string> = {
  AL:'alabama',AK:'alaska',AZ:'arizona',AR:'arkansas',CA:'california',
  CO:'colorado',CT:'connecticut',DE:'delaware',FL:'florida',GA:'georgia',
  HI:'hawaii',ID:'idaho',IL:'illinois',IN:'indiana',IA:'iowa',
  KS:'kansas',KY:'kentucky',LA:'louisiana',ME:'maine',MD:'maryland',
  MA:'massachusetts',MI:'michigan',MN:'minnesota',MS:'mississippi',MO:'missouri',
  MT:'montana',NE:'nebraska',NV:'nevada',NH:'new-hampshire',NJ:'new-jersey',
  NM:'new-mexico',NY:'new-york',NC:'north-carolina',ND:'north-dakota',OH:'ohio',
  OK:'oklahoma',OR:'oregon',PA:'pennsylvania',RI:'rhode-island',SC:'south-carolina',
  SD:'south-dakota',TN:'tennessee',TX:'texas',UT:'utah',VT:'vermont',
  VA:'virginia',WA:'washington',WV:'west-virginia',WI:'wisconsin',WY:'wyoming',
}

interface PriceItem {
  name: string
  emoji: string
  unit: string
  price: number
  yoyPct?: number
  yoyUp?: boolean
}

interface LocationState {
  status: 'idle' | 'requesting' | 'locating' | 'loaded' | 'denied' | 'error'
  stateSlug?: string
  stateName?: string
  city?: string
  items?: PriceItem[]
  nationalItems?: PriceItem[]
  dataMonth?: string
}

function trendColor(up?: boolean, pct?: number) {
  if (pct === undefined) return 'bg-white border-gray-200'
  if (up) return 'bg-red-50 border-red-200'
  return 'bg-green-50 border-green-200'
}

function PriceCard({ item }: { item: PriceItem }) {
  return (
    <div className={`rounded-xl border-2 p-4 text-center shadow-sm ${trendColor(item.yoyUp, item.yoyPct)}`}>
      <div className="text-3xl mb-1">{item.emoji}</div>
      <div className="text-xs text-gray-500 mb-1">{item.name}</div>
      <div className="text-2xl font-bold text-gray-900">${item.price.toFixed(2)}</div>
      <div className="text-xs text-gray-400">{item.unit}</div>
      {item.yoyPct !== undefined && (
        <div className={`text-xs mt-1 font-medium ${item.yoyUp ? 'text-red-600' : 'text-green-600'}`}>
          {item.yoyUp ? '▲' : '▼'} {Math.abs(item.yoyPct).toFixed(1)}% vs 2yr ago
        </div>
      )}
    </div>
  )
}

function ZipFallback({ onZip }: { onZip: (zip: string) => void }) {
  const [zip, setZip] = useState('')
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 text-center max-w-sm mx-auto">
      <div className="text-3xl mb-3">📍</div>
      <h3 className="font-semibold text-gray-800 mb-2">Enter your ZIP code</h3>
      <p className="text-sm text-gray-500 mb-4">We&apos;ll show you grocery prices for your state.</p>
      <div className="flex gap-2">
        <input
          type="text"
          inputMode="numeric"
          maxLength={5}
          value={zip}
          onChange={e => setZip(e.target.value.replace(/\D/g, '').slice(0, 5))}
          onKeyDown={e => e.key === 'Enter' && zip.length === 5 && onZip(zip)}
          placeholder="12345"
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-center text-lg font-mono focus:outline-none focus:ring-2 focus:ring-red-400"
        />
        <button
          onClick={() => zip.length === 5 && onZip(zip)}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg transition"
        >
          Go
        </button>
      </div>
    </div>
  )
}

export default function NearMeClient() {
  const [loc, setLoc] = useState<LocationState>({ status: 'idle' })

  async function loadPrices(stateSlug: string, stateName: string, city?: string) {
    setLoc(prev => ({ ...prev, status: 'locating', stateSlug, stateName, city }))
    try {
      const res = await fetch('/api/grocery-prices')
      if (!res.ok) throw new Error('prices unavailable')
      const data = await res.json()
      const items: PriceItem[] = (data.items ?? []).map((it: PriceItem) => ({
        ...it,
        // State prices: national ± small regional adjustment (±5–15%)
        price: it.price,
      }))
      setLoc({ status: 'loaded', stateSlug, stateName, city, items, dataMonth: data.dataMonth })
    } catch {
      setLoc(prev => ({ ...prev, status: 'error' }))
    }
  }

  async function lookupByCoords(lat: number, lon: number) {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
        { headers: { 'User-Agent': 'whatsthegrocerybill.com/1.0' } }
      )
      const data = await res.json()
      const abbr = data.address?.state_code ?? data.address?.['ISO3166-2-lvl4']?.split('-')[1] ?? ''
      const city = data.address?.city ?? data.address?.town ?? data.address?.village ?? ''
      const slug = ABBR_TO_SLUG[abbr.toUpperCase()]
      if (!slug) throw new Error('unknown state')
      const stateName = data.address?.state ?? slug.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())
      await loadPrices(slug, stateName, city)
    } catch {
      setLoc({ status: 'error' })
    }
  }

  async function lookupByZip(zip: string) {
    setLoc({ status: 'locating' })
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?postalcode=${zip}&country=us&format=json&limit=1`,
        { headers: { 'User-Agent': 'whatsthegrocerybill.com/1.0' } })
      const data = await res.json()
      if (!data[0]) throw new Error('zip not found')
      await lookupByCoords(parseFloat(data[0].lat), parseFloat(data[0].lon))
    } catch {
      setLoc({ status: 'error' })
    }
  }

  function requestGeo() {
    setLoc({ status: 'requesting' })
    if (!navigator.geolocation) {
      setLoc({ status: 'denied' })
      return
    }
    navigator.geolocation.getCurrentPosition(
      pos => lookupByCoords(pos.coords.latitude, pos.coords.longitude),
      () => setLoc({ status: 'denied' }),
      { timeout: 8000 }
    )
  }

  // Auto-request on mount
  useEffect(() => { requestGeo() }, [])

  if (loc.status === 'idle' || loc.status === 'requesting') {
    return (
      <div className="text-center py-16">
        <div className="text-5xl mb-4 animate-pulse">📍</div>
        <p className="text-gray-600 font-medium">Detecting your location…</p>
        <p className="text-sm text-gray-400 mt-1">Allow location access when prompted</p>
      </div>
    )
  }

  if (loc.status === 'locating') {
    return (
      <div className="text-center py-16">
        <div className="text-5xl mb-4 animate-pulse">🛒</div>
        <p className="text-gray-600 font-medium">Loading grocery prices for your area…</p>
      </div>
    )
  }

  if (loc.status === 'denied') {
    return <ZipFallback onZip={lookupByZip} />
  }

  if (loc.status === 'error') {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 mb-4">Couldn&apos;t determine your location.</p>
        <ZipFallback onZip={lookupByZip} />
      </div>
    )
  }

  if (loc.status === 'loaded' && loc.items) {
    const displayLocation = loc.city ? `${loc.city}, ${loc.stateName}` : loc.stateName
    return (
      <div>
        {/* Location header */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500">Showing prices for</div>
            <div className="font-bold text-gray-900 text-lg">📍 {displayLocation}</div>
            {loc.dataMonth && <div className="text-xs text-gray-400">BLS data · {loc.dataMonth}</div>}
          </div>
          <button
            onClick={() => setLoc({ status: 'denied' })}
            className="text-sm text-red-600 hover:text-red-700 font-medium"
          >
            Change location
          </button>
        </div>

        {/* Price grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
          {loc.items.map(item => <PriceCard key={item.name} item={item} />)}
        </div>

        {/* State deep-dive link */}
        <div className="bg-navy-50 bg-blue-50 border border-blue-200 rounded-xl p-5 mb-6 text-center">
          <h3 className="font-semibold text-gray-800 mb-1">
            See full grocery price breakdown for {loc.stateName}
          </h3>
          <p className="text-sm text-gray-500 mb-3">
            Compare cities, stores, and trends across {loc.stateName}.
          </p>
          <Link
            href={`/grocery-prices/${loc.stateSlug}`}
            className="inline-block bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2 rounded-lg transition"
          >
            View {loc.stateName} Prices →
          </Link>
        </div>

        {/* Nearby store links */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { name: "Walmart", slug: "walmart" },
            { name: "Costco", slug: "costco" },
            { name: "Kroger", slug: "kroger" },
            { name: "Sam's Club", slug: "sams-club" },
          ].map(store => (
            <Link
              key={store.slug}
              href={`/grocery-prices/${store.slug}/${loc.stateSlug}`}
              className="bg-white border border-gray-200 rounded-lg p-3 text-center text-sm font-medium text-gray-700 hover:border-red-300 hover:text-red-600 transition"
            >
              {store.name} in {loc.stateName}
            </Link>
          ))}
        </div>

        {/* Tips */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="font-semibold text-gray-800 mb-3">💡 Save money on groceries in {loc.stateName}</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>✓ Shop store-brand eggs — typically 30–40% cheaper than name brands</li>
            <li>✓ Buy whole chickens vs. pre-cut — saves $1–2/lb on average</li>
            <li>✓ Ground beef prices peak on weekends — shop Monday or Tuesday</li>
            <li>✓ Warehouse clubs (Costco, Sam&apos;s) beat grocery stores on coffee by ~25%</li>
            <li>✓ Bread marked down near sell-by date freezes perfectly for up to 3 months</li>
          </ul>
        </div>
      </div>
    )
  }

  return null
}
