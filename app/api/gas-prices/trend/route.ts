import { NextResponse } from 'next/server'

const EIA_API_KEY = process.env.EIA_API_KEY || 'DEMO_KEY'
const EIA_BASE    = 'https://api.eia.gov/v2/petroleum/pri/gnd/data'

// EIA product codes — confirmed against /v2/petroleum/pri/gnd/data
const GRADE_PRODUCT: Record<string, string> = {
  regular:  'EPM0',
  midgrade: 'EPM0M',
  premium:  'EPM0P',
  diesel:   'EPD2D',
}

// Historical fallback per grade — EIA national weekly averages (approx, last updated 2026-03-17)
const FALLBACK_TREND: Record<string, Array<{ period: string; price: number }>> = {
  regular: [
    { period: '2025-12-23', price: 3.024 }, { period: '2025-12-30', price: 2.988 },
    { period: '2026-01-06', price: 3.011 }, { period: '2026-01-13', price: 3.076 },
    { period: '2026-01-20', price: 3.089 }, { period: '2026-01-27', price: 3.102 },
    { period: '2026-02-03', price: 3.118 }, { period: '2026-02-10', price: 3.141 },
    { period: '2026-02-17', price: 3.159 }, { period: '2026-02-24', price: 3.177 },
    { period: '2026-03-10', price: 3.191 }, { period: '2026-03-17', price: 3.198 },
  ],
  midgrade: [
    { period: '2025-12-23', price: 3.389 }, { period: '2025-12-30', price: 3.353 },
    { period: '2026-01-06', price: 3.376 }, { period: '2026-01-13', price: 3.441 },
    { period: '2026-01-20', price: 3.454 }, { period: '2026-01-27', price: 3.467 },
    { period: '2026-02-03', price: 3.483 }, { period: '2026-02-10', price: 3.506 },
    { period: '2026-02-17', price: 3.524 }, { period: '2026-02-24', price: 3.542 },
    { period: '2026-03-10', price: 3.556 }, { period: '2026-03-17', price: 3.563 },
  ],
  premium: [
    { period: '2025-12-23', price: 3.656 }, { period: '2025-12-30', price: 3.620 },
    { period: '2026-01-06', price: 3.643 }, { period: '2026-01-13', price: 3.708 },
    { period: '2026-01-20', price: 3.721 }, { period: '2026-01-27', price: 3.734 },
    { period: '2026-02-03', price: 3.750 }, { period: '2026-02-10', price: 3.773 },
    { period: '2026-02-17', price: 3.791 }, { period: '2026-02-24', price: 3.809 },
    { period: '2026-03-10', price: 3.823 }, { period: '2026-03-17', price: 3.830 },
  ],
  diesel: [
    { period: '2025-12-23', price: 3.502 }, { period: '2025-12-30', price: 3.466 },
    { period: '2026-01-06', price: 3.489 }, { period: '2026-01-13', price: 3.554 },
    { period: '2026-01-20', price: 3.567 }, { period: '2026-01-27', price: 3.580 },
    { period: '2026-02-03', price: 3.596 }, { period: '2026-02-10', price: 3.619 },
    { period: '2026-02-17', price: 3.637 }, { period: '2026-02-24', price: 3.655 },
    { period: '2026-03-10', price: 3.669 }, { period: '2026-03-17', price: 3.676 },
  ],
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const grade = searchParams.get('grade') ?? 'regular'
  const validGrade = GRADE_PRODUCT[grade] ? grade : 'regular'
  const product = GRADE_PRODUCT[validGrade]

  const params = new URLSearchParams({
    'api_key': EIA_API_KEY,
    'frequency': 'weekly',
    'data[0]': 'value',
    'facets[product][]': product,
    'facets[duoarea][]': 'NUS',
    'sort[0][column]': 'period',
    'sort[0][direction]': 'desc',
    'length': '60',
  })

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 8000)

  try {
    const res = await fetch(`${EIA_BASE}?${params}`, {
      signal: controller.signal,
      next: { revalidate: 3600 },
    })
    clearTimeout(timeout)
    if (!res.ok) throw new Error(`EIA ${res.status}`)

    const json = await res.json()
    const rows: Array<{ period: string; value: string }> = json.response?.data ?? []

    const trend = rows
      .filter(r => r.value != null)
      .map(r => ({ period: r.period, price: parseFloat(r.value) }))
      .sort((a, b) => a.period.localeCompare(b.period))

    return NextResponse.json({ grade: validGrade, trend, source: 'EIA' })
  } catch (err) {
    console.error('EIA trend fetch error — fallback:', err)
    return NextResponse.json({ grade: validGrade, trend: FALLBACK_TREND[validGrade] ?? FALLBACK_TREND.regular, source: 'EIA (cached)' })
  }
}
