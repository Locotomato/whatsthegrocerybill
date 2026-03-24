import { NextResponse } from 'next/server'
import { COUNTY_FIPS } from '@/app/data/county-fips'

const COUNTY_VARIANCE = 0.15 // ± $0.15 seed-based variance

// ── Seed-based county price estimates ────────────────────────────────────
// Each county gets a deterministic price derived from state average + FIPS-seeded variance.
// Real county data (via Turso cloud DB) can overlay this later without changing this structure.

function buildEstimates(
  state: string,
  stateAvg: number,
  period: string,
): Record<string, { fips: string; name: string; price: number; period: string; source: string }> {
  const result: Record<string, { fips: string; name: string; price: number; period: string; source: string }> = {}
  for (const county of COUNTY_FIPS[state] ?? []) {
    const seed     = county.fips.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
    const variance = ((seed % 100) / 100 - 0.5) * 2 * COUNTY_VARIANCE
    result[county.fips] = {
      fips:   county.fips,
      name:   county.name,
      price:  Math.round((stateAvg + variance) * 1000) / 1000,
      period,
      source: 'ESTIMATED',
    }
  }
  return result
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const state = searchParams.get('state')?.toUpperCase()
  const grade = searchParams.get('grade') ?? 'regular'

  if (!state) {
    return NextResponse.json({ error: 'state param required' }, { status: 400 })
  }

  // Fetch state average from our own EIA-backed route (respect grade)
  const baseUrl  = request.url.split('/api/')[0]
  const stateRes = await fetch(`${baseUrl}/api/grocery-prices?grade=${grade}`, { cache: 'no-store' })
  const stateData = await stateRes.json()
  const stateAvg: number = stateData.states?.[state]?.price ?? stateData.nationalAvg ?? 3.50
  const period: string   = stateData.updatedAt ?? new Date().toISOString().split('T')[0]

  const countyMap = buildEstimates(state, stateAvg, period)
  const counties  = Object.values(countyMap).sort((a, b) => a.name.localeCompare(b.name))

  return NextResponse.json({
    state,
    stateAvg,
    period,
    source: 'ESTIMATED',
    counties,
  })
}
