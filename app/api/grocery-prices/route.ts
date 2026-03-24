/**
 * GET /api/grocery-prices
 * Fetches national average grocery prices from BLS CPI API.
 * Caches in Vercel KV for 24 hours.
 */
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// BLS series IDs for key grocery items
const BLS_SERIES: Record<string, { name: string; unit: string; emoji: string }> = {
  APU0000708111: { name: 'Eggs (doz)',      unit: '/doz', emoji: '🥚' },
  APU0000709112: { name: 'Milk (gal)',      unit: '/gal', emoji: '🥛' },
  APU0000702111: { name: 'Bread (loaf)',    unit: '/lb',  emoji: '🍞' },
  APU0000703112: { name: 'Ground Beef (lb)',unit: '/lb',  emoji: '🥩' },
  APU0000706111: { name: 'Chicken (lb)',    unit: '/lb',  emoji: '🐔' },
  APU0000714111: { name: 'Butter (lb)',     unit: '/lb',  emoji: '🧈' },
}

const SERIES_IDS = Object.keys(BLS_SERIES)
const CACHE_KEY  = 'grocery:prices:national'
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

async function fetchBLSPrices(): Promise<Record<string, number>> {
  const currentYear = new Date().getFullYear().toString()
  const lastYear    = (new Date().getFullYear() - 1).toString()

  const res = await fetch('https://api.bls.gov/publicAPI/v2/timeseries/data/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      seriesid: SERIES_IDS,
      startyear: lastYear,
      endyear: currentYear,
      registrationkey: process.env.BLS_API_KEY ?? '',
    }),
  })

  if (!res.ok) throw new Error(`BLS API error: ${res.status}`)
  const data = await res.json()

  const prices: Record<string, number> = {}

  for (const series of data.Results?.series ?? []) {
    const seriesId = series.seriesID
    // Get the most recent data point
    const sorted = (series.data ?? []).sort((a: { year: string; period: string }, b: { year: string; period: string }) => {
      if (a.year !== b.year) return parseInt(b.year) - parseInt(a.year)
      return parseInt(b.period.replace('M', '')) - parseInt(a.period.replace('M', ''))
    })
    if (sorted.length > 0) {
      prices[seriesId] = parseFloat(sorted[0].value)
    }
  }

  return prices
}

export async function GET() {
  // Try cache first
  const cached = await kvGet(CACHE_KEY)
  if (cached) {
    return NextResponse.json({ ...cached as object, cached: true })
  }

  try {
    const prices = await fetchBLSPrices()

    // Build response items
    const items = SERIES_IDS.map(id => {
      const meta  = BLS_SERIES[id]
      const price = prices[id]
      return {
        id,
        emoji: meta.emoji,
        name:  meta.name,
        unit:  meta.unit,
        price: price ? `$${price.toFixed(2)}` : null,
        priceRaw: price ?? null,
      }
    }).filter(item => item.priceRaw !== null)

    const payload = {
      items,
      source:    'BLS CPI',
      updatedAt: new Date().toISOString(),
      cached:    false,
    }

    await kvSet(CACHE_KEY, payload, CACHE_TTL)
    return NextResponse.json(payload)
  } catch (err) {
    console.error('[grocery-prices] BLS fetch failed:', err)
    // Return hardcoded fallback
    return NextResponse.json({
      items: [
        { id: 'APU0000708111', emoji: '🥚', name: 'Eggs (doz)',       unit: '/doz', price: '$4.82', priceRaw: 4.82 },
        { id: 'APU0000709112', emoji: '🥛', name: 'Milk (gal)',       unit: '/gal', price: '$3.94', priceRaw: 3.94 },
        { id: 'APU0000702111', emoji: '🍞', name: 'Bread (loaf)',     unit: '/lb',  price: '$3.98', priceRaw: 3.98 },
        { id: 'APU0000703112', emoji: '🥩', name: 'Ground Beef (lb)', unit: '/lb',  price: '$5.43', priceRaw: 5.43 },
        { id: 'APU0000706111', emoji: '🐔', name: 'Chicken (lb)',     unit: '/lb',  price: '$2.11', priceRaw: 2.11 },
        { id: 'APU0000714111', emoji: '🧈', name: 'Butter (lb)',      unit: '/lb',  price: '$5.11', priceRaw: 5.11 },
      ],
      source:    'fallback',
      updatedAt: new Date().toISOString(),
      cached:    false,
    })
  }
}
