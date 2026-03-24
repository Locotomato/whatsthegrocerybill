import { NextResponse } from 'next/server'

// ── AAA Fuel Gauge Report scraper ─────────────────────────────────────────
// Daily state averages — all grades, all 50 states + DC
// Fallback: EIA weekly survey (if AAA scrape fails)

const AAA_URL = 'https://gasprices.aaa.com/state-gas-price-averages/'

const EIA_API_KEY = process.env.EIA_API_KEY || 'DEMO_KEY'
const EIA_BASE    = 'https://api.eia.gov/v2/petroleum/pri/gnd/data'

// AAA grade column index (0=State, 1=Regular, 2=Mid-Grade, 3=Premium, 4=Diesel)
const AAA_GRADE_IDX: Record<string, number> = {
  regular:  1,
  midgrade: 2,
  premium:  3,
  diesel:   4,
}

// EIA product codes (fallback)
const EIA_PRODUCT: Record<string, string> = {
  regular:  'EPM0',
  midgrade: 'EPM0M',
  premium:  'EPM0P',
  diesel:   'EPD2D',
}

// EIA duoarea codes → state abbreviations
const EIA_STATE_CODES: Record<string, string> = {
  'S-AL': 'AL', 'S-AK': 'AK', 'S-AZ': 'AZ', 'S-AR': 'AR', 'S-CA': 'CA',
  'S-CO': 'CO', 'S-CT': 'CT', 'S-DE': 'DE', 'S-FL': 'FL', 'S-GA': 'GA',
  'S-HI': 'HI', 'S-ID': 'ID', 'S-IL': 'IL', 'S-IN': 'IN', 'S-IA': 'IA',
  'S-KS': 'KS', 'S-KY': 'KY', 'S-LA': 'LA', 'S-ME': 'ME', 'S-MD': 'MD',
  'S-MA': 'MA', 'S-MI': 'MI', 'S-MN': 'MN', 'S-MS': 'MS', 'S-MO': 'MO',
  'S-MT': 'MT', 'S-NE': 'NE', 'S-NV': 'NV', 'S-NH': 'NH', 'S-NJ': 'NJ',
  'S-NM': 'NM', 'S-NY': 'NY', 'S-NC': 'NC', 'S-ND': 'ND', 'S-OH': 'OH',
  'S-OK': 'OK', 'S-OR': 'OR', 'S-PA': 'PA', 'S-RI': 'RI', 'S-SC': 'SC',
  'S-SD': 'SD', 'S-TN': 'TN', 'S-TX': 'TX', 'S-UT': 'UT', 'S-VT': 'VT',
  'S-VA': 'VA', 'S-WA': 'WA', 'S-WV': 'WV', 'S-WI': 'WI', 'S-WY': 'WY',
  'S-DC': 'DC',
}

// AAA state name → abbreviation
const STATE_NAME_TO_ABBR: Record<string, string> = {
  'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR',
  'California': 'CA', 'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE',
  'District of Columbia': 'DC', 'Florida': 'FL', 'Georgia': 'GA', 'Hawaii': 'HI',
  'Idaho': 'ID', 'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA',
  'Kansas': 'KS', 'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME',
  'Maryland': 'MD', 'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN',
  'Mississippi': 'MS', 'Missouri': 'MO', 'Montana': 'MT', 'Nebraska': 'NE',
  'Nevada': 'NV', 'New Hampshire': 'NH', 'New Jersey': 'NJ', 'New Mexico': 'NM',
  'New York': 'NY', 'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH',
  'Oklahoma': 'OK', 'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI',
  'South Carolina': 'SC', 'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX',
  'Utah': 'UT', 'Vermont': 'VT', 'Virginia': 'VA', 'Washington': 'WA',
  'West Virginia': 'WV', 'Wisconsin': 'WI', 'Wyoming': 'WY',
}

// Hard-coded fallback (EIA week of 2026-03-17) — last resort only
const FALLBACK_PRICES: Record<string, number> = {
  AL:3.61, AK:4.12, AZ:4.47, AR:3.38, CA:5.70, CO:3.92, CT:3.80, DE:3.77,
  DC:4.04, FL:3.94, GA:3.73, HI:5.17, ID:4.09, IL:4.14, IN:3.82, IA:3.33,
  KS:3.26, KY:3.74, LA:3.56, ME:3.76, MD:3.85, MA:3.68, MI:3.92, MN:3.44,
  MS:3.53, MO:3.41, MT:3.53, NE:3.38, NV:4.71, NH:3.66, NJ:3.84, NM:3.83,
  NY:3.81, NC:3.69, ND:3.38, OH:3.72, OK:3.26, OR:4.82, PA:3.92, RI:3.70,
  SC:3.63, SD:3.38, TN:3.63, TX:3.61, UT:3.91, VT:3.80, VA:3.80, WA:5.25,
  WV:3.69, WI:3.64, WY:3.71,
}

// ── AAA scraper ────────────────────────────────────────────────────────────
async function fetchFromAAA(grade: string): Promise<{
  states: Record<string, { price: number; period: string; stateCode: string }>
  nationalAvg: number
  updatedAt: string
  source: string
} | null> {
  try {
    const res = await fetch(AAA_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; GasPriceBot/1.0)',
        'Accept': 'text/html',
      },
      next: { revalidate: 3600 }, // cache 1 hour on the CDN edge
    })
    if (!res.ok) return null

    const html = await res.text()
    const colIdx = AAA_GRADE_IDX[grade] ?? 1

    // Parse table rows: <td>StateName</td><td>$X.XXX</td>...
    const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi
    const cellRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi
    const stripTags = (s: string) => s.replace(/<[^>]+>/g, '').trim()

    const stateMap: Record<string, { price: number; period: string; stateCode: string }> = {}
    let totalPrice = 0
    let count = 0

    // Get today's date in ET as the "period"
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' }) // YYYY-MM-DD

    let rowMatch: RegExpExecArray | null
    while ((rowMatch = rowRegex.exec(html)) !== null) {
      const rowHtml = rowMatch[1]
      const cells: string[] = []
      let cellMatch: RegExpExecArray | null
      const cellRe = /<td[^>]*>([\s\S]*?)<\/td>/gi
      while ((cellMatch = cellRe.exec(rowHtml)) !== null) {
        cells.push(stripTags(cellMatch[1]))
      }
      if (cells.length < 5) continue

      const stateName = cells[0]
      const abbr = STATE_NAME_TO_ABBR[stateName]
      if (!abbr) continue

      const raw = cells[colIdx]?.replace(/[$,]/g, '') ?? ''
      const price = parseFloat(raw)
      if (isNaN(price)) continue

      stateMap[abbr] = { price, period: today, stateCode: abbr }
      totalPrice += price
      count++
    }

    if (count < 40) return null // too few states parsed — something went wrong

    const nationalAvg = Math.round((totalPrice / count) * 1000) / 1000

    return {
      states: stateMap,
      nationalAvg,
      updatedAt: today,
      source: 'AAA',
    }
  } catch {
    return null
  }
}

// ── EIA fallback ───────────────────────────────────────────────────────────
async function fetchFromEIA(grade: string) {
  const product = EIA_PRODUCT[grade] ?? 'EPM0'
  const params = new URLSearchParams({
    'api_key': EIA_API_KEY,
    'frequency': 'weekly',
    'data[0]': 'value',
    'facets[product][]': product,
    'sort[0][column]': 'period',
    'sort[0][direction]': 'desc',
    'length': '55',
  })

  const res = await fetch(`${EIA_BASE}?${params}`, {
    next: { revalidate: 3600 },
  })
  if (!res.ok) throw new Error(`EIA returned ${res.status}`)

  const rows: Array<{ period: string; duoarea: string; value: string }> =
    (await res.json())?.response?.data ?? []

  const latestDate = rows[0]?.period ?? null
  const stateMap: Record<string, { price: number; period: string; stateCode: string }> = {}

  for (const row of rows) {
    const stateCode = EIA_STATE_CODES[row.duoarea]
    if (!stateCode || !row.value) continue
    if (!stateMap[stateCode]) {
      stateMap[stateCode] = { price: parseFloat(row.value), period: row.period, stateCode }
    }
  }

  const nationalRow = rows.find(r => r.duoarea === 'NUS' && r.period === latestDate)
  return {
    states: stateMap,
    nationalAvg: nationalRow ? parseFloat(nationalRow.value) : 3.5,
    updatedAt: latestDate,
    source: 'EIA',
  }
}

// ── Handler ────────────────────────────────────────────────────────────────
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const grade = searchParams.get('grade') ?? 'regular'
  const validGrade = ['regular', 'midgrade', 'premium', 'diesel'].includes(grade) ? grade : 'regular'

  // 1. Try AAA (daily, most accurate)
  const aaa = await fetchFromAAA(validGrade)
  if (aaa) return NextResponse.json(aaa)

  // 2. Try EIA (weekly fallback)
  try {
    const eia = await fetchFromEIA(validGrade)
    return NextResponse.json(eia)
  } catch (err) {
    console.error('EIA fetch error — serving hard-coded fallback:', err)
  }

  // 3. Hard-coded last-resort fallback
  const states = Object.fromEntries(
    Object.entries(FALLBACK_PRICES).map(([k, v]) => [k, { price: v, period: '2026-03-17', stateCode: k }])
  )
  return NextResponse.json({
    states,
    nationalAvg: 3.79,
    updatedAt: '2026-03-17',
    source: 'EIA (cached)',
  })
}
