/**
 * GET /api/grocery-prices
 * Fetches national average grocery prices from BLS CPI API.
 * Caches in Vercel KV for 24 hours.
 */
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// BLS series IDs for key grocery items
const BLS_SERIES: Record<string, { name: string; unit: string; emoji: string; fallbackPrice: number }> = {
  APU0000708111: { name: 'Eggs (doz)',        unit: '/doz', emoji: '🥚', fallbackPrice: 4.82 },
  APU0000709112: { name: 'Milk (gal)',        unit: '/gal', emoji: '🥛', fallbackPrice: 3.94 },
  APU0000702111: { name: 'Bread (loaf)',      unit: '/lb',  emoji: '🍞', fallbackPrice: 1.98 },
  APU0000703112: { name: 'Ground Beef (lb)',  unit: '/lb',  emoji: '🥩', fallbackPrice: 5.43 },
  APU0000706111: { name: 'Chicken (lb)',      unit: '/lb',  emoji: '🐔', fallbackPrice: 2.11 },
  APU0000717311: { name: 'Coffee (lb)',       unit: '/lb',  emoji: '☕', fallbackPrice: 6.12 },
}

const SERIES_IDS = Object.keys(BLS_SERIES)
const CACHE_KEY  = 'grocery:prices:national:v5'
const CACHE_TTL  = 60 * 60 * 24 // 24 hours

async function kvGet(key: string): Promise<unknown> {
  try {
    const { kv } = await import('@vercel/kv')
    return await kv.get(key)
  } catch { return null }
}

async function kvSet(key: string, value: unknown, ttl: number) {
  try {
    const { kv } = await import('@vercel/kv')
    await kv.set(key, value, { ex: ttl })
  } catch { /* no-op if KV unavailable */ }
}

interface BLSResult {
  prices: Record<string, number>
  yoy: Record<string, { pct: number; up: boolean }>
  dataMonth: string // e.g. "February 2026"
}

async function fetchBLSPrices(): Promise<BLSResult> {
  const now         = new Date()
  const currentYear = now.getFullYear().toString()
  // Go back 2 years to guarantee prior-year data is available for YoY calc
  const twoYearsAgo = (now.getFullYear() - 2).toString()

  const res = await fetch('https://api.bls.gov/publicAPI/v2/timeseries/data/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      seriesid: SERIES_IDS,
      startyear: twoYearsAgo,
      endyear: currentYear,
      registrationkey: process.env.BLS_API_KEY ?? '',
    }),
  })

  if (!res.ok) throw new Error(`BLS API error: ${res.status}`)
  const data = await res.json()

  const prices: Record<string, number> = {}
  const yoy: Record<string, { pct: number; up: boolean }> = {}
  let dataMonth = ''

  for (const series of data.Results?.series ?? []) {
    const seriesId = series.seriesID
    const sorted = (series.data ?? []).sort((a: { year: string; period: string }, b: { year: string; period: string }) => {
      if (a.year !== b.year) return parseInt(b.year) - parseInt(a.year)
      return parseInt(b.period.replace('M', '')) - parseInt(a.period.replace('M', ''))
    })
    if (sorted.length === 0) continue

    const latest = sorted[0]
    const latestPrice = parseFloat(latest.value)
    prices[seriesId] = latestPrice

    // Build human-readable month label from most recent data point
    if (!dataMonth) {
      const monthNum = parseInt(latest.period.replace('M', ''))
      const monthName = new Date(parseInt(latest.year), monthNum - 1, 1)
        .toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      dataMonth = monthName
    }

    // Use 2-year comparison — avoids distortion from anomalous spikes (e.g. 2025 egg/avian flu peak)
    const priorYearStr = (parseInt(latest.year) - 2).toString()
    const priorMonthData = sorted.find(
      (d: { year: string; period: string }) => d.year === priorYearStr && d.period === latest.period
    )
    if (priorMonthData) {
      const priorPrice = parseFloat(priorMonthData.value)
      const pct = priorPrice > 0 ? ((latestPrice - priorPrice) / priorPrice) * 100 : 0
      yoy[seriesId] = { pct: Math.round(pct * 10) / 10, up: pct > 0 }
    }
  }

  return { prices, yoy, dataMonth }
}

export async function GET() {
  // Try cache first
  const cached = await kvGet(CACHE_KEY)
  if (cached) {
    return NextResponse.json({ ...cached as object, cached: true })
  }

  try {
    const { prices, yoy, dataMonth } = await fetchBLSPrices()

    // Build response items — always include all 6, fall back to hardcoded price if BLS has no data
    const items = SERIES_IDS.map(id => {
      const meta     = BLS_SERIES[id]
      const price    = prices[id] ?? meta.fallbackPrice
      const yoyData  = yoy[id]
      return {
        id,
        emoji:    meta.emoji,
        name:     meta.name,
        unit:     meta.unit,
        price:    `$${price.toFixed(2)}`,
        priceRaw: price,
        yoyPct:   yoyData ? yoyData.pct : null,
        yoyUp:    yoyData ? yoyData.up  : null,
      }
    })

    const payload = {
      items,
      source:    'BLS Avg Retail Price',
      dataMonth,
      updatedAt: new Date().toISOString(),
      cached:    false,
    }

    await kvSet(CACHE_KEY, payload, CACHE_TTL)
    return NextResponse.json(payload)
  } catch (err) {
    console.error('[grocery-prices] BLS fetch failed:', err)
    // Return hardcoded fallback with realistic current prices
    return NextResponse.json({
      items: [
        { id: 'APU0000708111', emoji: '🥚', name: 'Eggs (doz)',       unit: '/doz', price: '$4.82', priceRaw: 4.82, yoyPct: 61,  yoyUp: true  },
        { id: 'APU0000709112', emoji: '🥛', name: 'Milk (gal)',       unit: '/gal', price: '$3.94', priceRaw: 3.94, yoyPct: 3,   yoyUp: true  },
        { id: 'APU0000702111', emoji: '🍞', name: 'Bread (lb)',       unit: '/lb',  price: '$1.98', priceRaw: 1.98, yoyPct: 5,   yoyUp: true  },
        { id: 'APU0000703112', emoji: '🥩', name: 'Ground Beef (lb)', unit: '/lb',  price: '$5.43', priceRaw: 5.43, yoyPct: 8,   yoyUp: true  },
        { id: 'APU0000706111', emoji: '🐔', name: 'Chicken (lb)',     unit: '/lb',  price: '$2.11', priceRaw: 2.11, yoyPct: -1,  yoyUp: false },
        { id: 'APU0000717311', emoji: '☕', name: 'Coffee (lb)',      unit: '/lb',  price: '$6.12', priceRaw: 6.12, yoyPct: 18,  yoyUp: true  },
      ],
      source:    'fallback',
      dataMonth: '',
      updatedAt: new Date().toISOString(),
      cached:    false,
    })
  }
}
