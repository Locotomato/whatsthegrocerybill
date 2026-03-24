'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  ComposableMap,
  Geographies,
  Geography,
} from 'react-simple-maps'

type Grade = 'regular' | 'midgrade' | 'premium'

// ── Trend Chart ───────────────────────────────────────────────────────────────
'use client'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts'

interface TrendPoint { period: string; price: number }

function fmt(period: string) {
  // "2026-03-17" → "Mar 17"
  const [, m, d] = period.split('-')
  const months = ['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${months[parseInt(m)]} ${parseInt(d)}`
}

function TrendChart({ data }: { data: TrendPoint[] }) {
  if (data.length < 2) return <div className="text-xs text-gray-600 h-[110px] flex items-center">Loading…</div>

  const last  = data[data.length - 1]
  const prev  = data[data.length - 2]
  const up    = last.price >= prev.price
  const color = up ? '#f87171' : '#4ade80'
  const gradId = up ? 'grad-up' : 'grad-dn'

  const prices  = data.map(d => d.price)
  const minP    = Math.min(...prices)
  const maxP    = Math.max(...prices)
  const pad     = (maxP - minP) * 0.15 || 0.05
  const domain  = [minP - pad, maxP + pad]

  const chartData = data.map(d => ({ date: fmt(d.period), price: d.price, raw: d.period }))

  // show ~4 evenly spaced x-axis ticks
  const step  = Math.max(1, Math.floor(chartData.length / 4))
  const ticks = chartData.filter((_, i) => i % step === 0 || i === chartData.length - 1).map(d => d.date)

  return (
    <div style={{ width: '100%', height: 120 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor={color} stopOpacity={0.30} />
              <stop offset="100%" stopColor={color} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            ticks={ticks}
            tick={{ fill: '#6b7280', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={domain}
            tickFormatter={(v: number) => `$${v.toFixed(2)}`}
            tick={{ fill: '#6b7280', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            width={44}
            tickCount={4}
          />
          <Tooltip
            contentStyle={{
              background: '#13151f',
              border: '1px solid #1e2235',
              borderRadius: 8,
              fontSize: 12,
              color: '#fff',
              padding: '6px 10px',
            }}
            labelStyle={{ color: 'var(--subtle)', marginBottom: 2 }}
            formatter={(v: unknown) => [`$${(v as number).toFixed(3)}`, 'Avg price']}
            cursor={{ stroke: color, strokeWidth: 1, strokeDasharray: '4 2' }}
          />
          <ReferenceLine y={last.price} stroke={color} strokeDasharray="3 3" strokeOpacity={0.3} />
          <Area
            type="monotone"
            dataKey="price"
            stroke={color}
            strokeWidth={2.5}
            fill={`url(#${gradId})`}
            dot={false}
            activeDot={{ r: 5, fill: color, stroke: '#13151f', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
// ─────────────────────────────────────────────────────────────────────────────

const GRADES: { key: Grade; label: string; octane: string }[] = [
  { key: 'regular',  label: 'Regular',  octane: '87' },
  { key: 'midgrade', label: 'Midgrade', octane: '89' },
  { key: 'premium',  label: 'Premium',  octane: '91+' },
]

const US_TOPO_URL = 'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json'
const COUNTY_TOPO_URL = 'https://cdn.jsdelivr.net/npm/us-atlas@3/counties-10m.json'

// FIPS → state abbrev mapping
// Per-state projection config for county drill-down (center [lon,lat] + scale)
const STATE_PROJECTION: Record<string, { center: [number, number]; scale: number }> = {
  AL: { center: [-86.8, 32.8], scale: 4000 },
  AK: { center: [-153.0, 64.0], scale: 700 },
  AZ: { center: [-111.7, 34.3], scale: 3200 },
  AR: { center: [-92.4, 34.9], scale: 4200 },
  CA: { center: [-119.7, 37.2], scale: 2200 },
  CO: { center: [-105.5, 39.0], scale: 3200 },
  CT: { center: [-72.7, 41.6], scale: 14000 },
  DC: { center: [-77.0, 38.9], scale: 70000 },
  DE: { center: [-75.5, 39.0], scale: 16000 },
  FL: { center: [-81.5, 27.8], scale: 3000 },
  GA: { center: [-83.4, 32.7], scale: 3500 },
  HI: { center: [-156.5, 20.3], scale: 3500 },
  ID: { center: [-114.5, 44.4], scale: 2500 },
  IL: { center: [-89.2, 40.1], scale: 3000 },
  IN: { center: [-86.3, 39.8], scale: 4500 },
  IA: { center: [-93.1, 42.1], scale: 3800 },
  KS: { center: [-98.4, 38.5], scale: 3500 },
  KY: { center: [-84.9, 37.5], scale: 4500 },
  LA: { center: [-91.8, 30.9], scale: 3800 },
  ME: { center: [-69.2, 45.4], scale: 3500 },
  MD: { center: [-76.8, 39.0], scale: 7000 },
  MA: { center: [-71.5, 42.2], scale: 8000 },
  MI: { center: [-85.4, 44.3], scale: 2800 },
  MN: { center: [-94.3, 46.4], scale: 2800 },
  MS: { center: [-89.7, 32.7], scale: 3800 },
  MO: { center: [-92.5, 38.3], scale: 3500 },
  MT: { center: [-110.5, 47.0], scale: 2500 },
  NE: { center: [-99.9, 41.5], scale: 3500 },
  NV: { center: [-116.4, 39.3], scale: 2500 },
  NH: { center: [-71.5, 43.7], scale: 6000 },
  NJ: { center: [-74.4, 40.1], scale: 8000 },
  NM: { center: [-106.1, 34.4], scale: 2800 },
  NY: { center: [-75.5, 43.0], scale: 3000 },
  NC: { center: [-79.4, 35.6], scale: 3800 },
  ND: { center: [-100.5, 47.5], scale: 3500 },
  OH: { center: [-82.8, 40.4], scale: 4000 },
  OK: { center: [-97.5, 35.5], scale: 3500 },
  OR: { center: [-120.6, 44.0], scale: 2800 },
  PA: { center: [-77.2, 41.2], scale: 4000 },
  RI: { center: [-71.5, 41.7], scale: 22000 },
  SC: { center: [-80.9, 33.9], scale: 5000 },
  SD: { center: [-100.2, 44.4], scale: 3500 },
  TN: { center: [-86.7, 35.9], scale: 4800 },
  TX: { center: [-99.3, 31.5], scale: 1800 },
  UT: { center: [-111.9, 39.3], scale: 3000 },
  VT: { center: [-72.7, 44.1], scale: 7000 },
  VA: { center: [-78.5, 37.5], scale: 4000 },
  WA: { center: [-120.5, 47.4], scale: 3000 },
  WV: { center: [-80.5, 38.6], scale: 5000 },
  WI: { center: [-89.8, 44.6], scale: 3200 },
  WY: { center: [-107.6, 43.0], scale: 3000 },
}

const FIPS_TO_STATE: Record<string, string> = {
  '01':'AL','02':'AK','04':'AZ','05':'AR','06':'CA','08':'CO','09':'CT',
  '10':'DE','11':'DC','12':'FL','13':'GA','15':'HI','16':'ID','17':'IL',
  '18':'IN','19':'IA','20':'KS','21':'KY','22':'LA','23':'ME','24':'MD',
  '25':'MA','26':'MI','27':'MN','28':'MS','29':'MO','30':'MT','31':'NE',
  '32':'NV','33':'NH','34':'NJ','35':'NM','36':'NY','37':'NC','38':'ND',
  '39':'OH','40':'OK','41':'OR','42':'PA','44':'RI','45':'SC','46':'SD',
  '47':'TN','48':'TX','49':'UT','50':'VT','51':'VA','53':'WA','54':'WV',
  '55':'WI','56':'WY',
}

const STATE_TO_NAME: Record<string, string> = {
  AL:'Alabama',AK:'Alaska',AZ:'Arizona',AR:'Arkansas',CA:'California',
  CO:'Colorado',CT:'Connecticut',DE:'Delaware',DC:'Washington D.C.',FL:'Florida',
  GA:'Georgia',HI:'Hawaii',ID:'Idaho',IL:'Illinois',IN:'Indiana',IA:'Iowa',
  KS:'Kansas',KY:'Kentucky',LA:'Louisiana',ME:'Maine',MD:'Maryland',
  MA:'Massachusetts',MI:'Michigan',MN:'Minnesota',MS:'Mississippi',MO:'Missouri',
  MT:'Montana',NE:'Nebraska',NV:'Nevada',NH:'New Hampshire',NJ:'New Jersey',
  NM:'New Mexico',NY:'New York',NC:'North Carolina',ND:'North Dakota',OH:'Ohio',
  OK:'Oklahoma',OR:'Oregon',PA:'Pennsylvania',RI:'Rhode Island',SC:'South Carolina',
  SD:'South Dakota',TN:'Tennessee',TX:'Texas',UT:'Utah',VT:'Vermont',
  VA:'Virginia',WA:'Washington',WV:'West Virginia',WI:'Wisconsin',WY:'Wyoming',
}

// Green (#16a34a) → Red (#15803d), dark-theme-friendly saturated shades
function priceToColor(price: number, min: number, max: number): string {
  const t = Math.max(0, Math.min(1, (price - min) / (max - min)))
  // Interpolate RGB: green [22,163,74] → red [220,38,38]
  const r = Math.round(22  + t * (220 - 22))
  const g = Math.round(163 + t * (38  - 163))
  const b = Math.round(74  + t * (38  - 74))
  // Boost brightness slightly so colors pop on dark bg
  const boost = 1.15
  return `rgb(${Math.min(255, Math.round(r * boost))}, ${Math.min(255, Math.round(g * boost))}, ${Math.min(255, Math.round(b * boost))})`
}

interface StatePrice { price: number; period: string; stateCode: string }
interface CountyPrice { fips: string; name: string; price: number; period: string }

export default function GasMap() {
  const [grade, setGrade] = useState<Grade>('regular')
  const [statePrices, setStatePrices] = useState<Record<string, StatePrice>>({})
  const [nationalAvg, setNationalAvg] = useState<number | null>(null)
  const [updatedAt, setUpdatedAt] = useState<string>('')
  const [dataSource, setDataSource] = useState<string>('AAA')
  const [loading, setLoading] = useState(true)
  const [selectedState, setSelectedState] = useState<string | null>(null)
  const [countyPrices, setCountyPrices] = useState<CountyPrice[]>([])
  const [countyLoading, setCountyLoading] = useState(false)
  const [tooltip, setTooltip] = useState<{ x: number; y: number; label: string } | null>(null)
  const [trendData, setTrendData] = useState<TrendPoint[]>([])

  useEffect(() => {
    setLoading(true)
    Promise.all([
      fetch(`/api/grocery-prices?grade=${grade}`).then(r => r.json()),
      fetch(`/api/grocery-prices/trend?grade=${grade}`).then(r => r.json()),
    ]).then(([priceData, trendResp]) => {
      setStatePrices(priceData.states ?? {})
      setNationalAvg(priceData.nationalAvg)
      setUpdatedAt(priceData.updatedAt ?? '')
      setDataSource(priceData.source ?? 'AAA')

      // Anchor the trend chart's final point to today's AAA price so the
      // historical EIA shape flows into the current real price seamlessly.
      const rawTrend: TrendPoint[] = trendResp.trend ?? []
      const todayDate = priceData.updatedAt ?? new Date().toISOString().slice(0, 10)
      const todayPrice: number | null = priceData.nationalAvg ?? null
      let trend = rawTrend
      if (todayPrice && rawTrend.length > 0) {
        // Remove any existing entry for the same date, then append current
        trend = [
          ...rawTrend.filter((d: TrendPoint) => d.period < todayDate),
          { period: todayDate, price: todayPrice },
        ]
      }
      setTrendData(trend)
      setLoading(false)
    })
  }, [grade])

  const handleStateClick = useCallback(async (stateCode: string) => {
    if (selectedState === stateCode) {
      setSelectedState(null)
      setCountyPrices([])
      return
    }
    setSelectedState(stateCode)
    setCountyLoading(true)
    setCountyPrices([])
    const res = await fetch(`/api/grocery-prices/county?state=${stateCode}&grade=${grade}`)
    const data = await res.json()
    setCountyPrices(data.counties ?? [])
    setCountyLoading(false)
  }, [selectedState, grade])

  // Re-fetch county data when grade changes while a state is already selected
  useEffect(() => {
    if (!selectedState) return
    setCountyLoading(true)
    setCountyPrices([])
    fetch(`/api/grocery-prices/county?state=${selectedState}&grade=${grade}`)
      .then(r => r.json())
      .then(data => {
        setCountyPrices(data.counties ?? [])
        setCountyLoading(false)
      })
  }, [grade]) // eslint-disable-line react-hooks/exhaustive-deps

  const prices = Object.values(statePrices).map(s => s.price).filter(Boolean)
  const minPrice = prices.length ? Math.min(...prices) : 2.5
  const maxPrice = prices.length ? Math.max(...prices) : 5.5

  const countyPriceVals = countyPrices.map(c => c.price)
  const cMin = countyPriceVals.length ? Math.min(...countyPriceVals) : minPrice
  const cMax = countyPriceVals.length ? Math.max(...countyPriceVals) : maxPrice

  return (
    <div className="relative w-full">

      {/* National avg + grade switcher */}
      <div className="flex flex-col items-center mb-6 gap-4">
        {/* Grade tabs */}
        <div className="flex bg-[#13151f] border border-[#1e2235] rounded-xl p-1 gap-1">
          {GRADES.map(g => (
            <button
              key={g.key}
              onClick={() => setGrade(g.key)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                grade === g.key
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {g.label}
              <span className="ml-1.5 text-xs font-normal opacity-60">{g.octane}</span>
            </button>
          ))}
        </div>

        {/* National avg card */}
        {(() => {
          const prevWeek = trendData.length >= 2 ? trendData[trendData.length - 2] : null
          const delta = nationalAvg && prevWeek ? nationalAvg - prevWeek.price : null
          const isUp = delta !== null && delta > 0
          const isDown = delta !== null && delta < 0

          // YTD sparkline: all weeks in the current calendar year
          const now = updatedAt || new Date().toISOString().slice(0, 10)
          const currentYear = now.slice(0, 4) // "YYYY"
          const ytdPoints = trendData.filter(d => d.period.startsWith(currentYear))
          // Fallback to last 8 weeks if YTD data is thin
          const sparkPoints = ytdPoints.length >= 2
            ? ytdPoints
            : trendData.slice(-8)

          return (
            <div className="bg-[#13151f] border border-[#1e2235] rounded-2xl shadow-xl flex flex-col sm:flex-row items-stretch overflow-hidden">
              {/* Top (mobile) / Left (desktop): price + WoW */}
              <div className="px-8 py-5 flex flex-col items-center justify-center">
                <div className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mb-1">US National Average</div>
                <div className="text-5xl font-black text-white tabular-nums">
                  {nationalAvg ? `$${nationalAvg.toFixed(3)}` : '—'}
                </div>
                {/* WoW delta */}
                <div className={`mt-2 flex items-center gap-1 text-sm font-semibold ${
                  isUp ? 'text-red-400' : isDown ? 'text-green-400' : 'text-gray-500'
                }`}>
                  {delta !== null ? (
                    <>
                      <span>{isUp ? '▲' : isDown ? '▼' : '—'}</span>
                      <span>${Math.abs(delta).toFixed(3)}</span>
                      <span className="text-xs font-normal text-gray-500">vs last week</span>
                    </>
                  ) : (
                    <span className="text-gray-600 text-xs">— vs last week</span>
                  )}
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  per gallon · {updatedAt ? `as of ${updatedAt}` : ''}
                </div>
              </div>

              {/* Divider — horizontal on mobile, vertical on desktop */}
              <div className="h-px sm:h-auto sm:w-px bg-[#1e2235] sm:my-4" />

              {/* Bottom (mobile) / Right (desktop): trend chart */}
              <div className="px-4 py-5 flex flex-col justify-center flex-1 min-w-0">
                <div className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mb-2">
                  {currentYear} Week by Week
                </div>
                <TrendChart data={sparkPoints} />
              </div>
            </div>
          )
        })()}
      </div>

      {/* Sub-header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          {selectedState ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => { setSelectedState(null); setCountyPrices([]) }}
                className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                ← All States
              </button>
              <h2 className="text-xl font-bold text-white">
                {STATE_TO_NAME[selectedState]} — County View
              </h2>
              {statePrices[selectedState] && (
                <span className="text-sm text-gray-400">
                  State avg: <span className="text-white font-semibold">
                    ${statePrices[selectedState].price.toFixed(3)}/gal
                  </span>
                </span>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-400">
              Click any state to drill into county-level prices
            </p>
          )}
        </div>
        {!loading && (
          <div className="text-xs text-gray-500">
            Avg prices · as of {updatedAt}
          </div>
        )}
      </div>

      {/* Map */}
      <div className="relative bg-[#0d0f1a] rounded-xl overflow-hidden border border-[#1e2235]"
        style={{ aspectRatio: '16/9', touchAction: 'manipulation' }}>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="text-gray-400 animate-pulse">Loading Grocery Prices...</div>
          </div>
        )}

        {!selectedState ? (
          // State choropleth
          <ComposableMap
            projection="geoAlbersUsa"
            style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, touchAction: 'none' }}
            projectionConfig={{ scale: 1000 }}
          >
            <Geographies geography={US_TOPO_URL}>
              {({ geographies }: { geographies: any[] }) =>
                geographies.map((geo: any) => {
                  const fips = geo.id?.toString().padStart(2, '0') ?? ''
                  const stateCode = FIPS_TO_STATE[fips]
                  const data = stateCode ? statePrices[stateCode] : null
                  const color = data
                    ? priceToColor(data.price, minPrice, maxPrice)
                    : '#1e2235'

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={color}
                      stroke="#0f1120"
                      strokeWidth={0.8}
                      style={{
                        default: { outline: 'none', cursor: 'pointer' },
                        hover: { outline: 'none', filter: 'brightness(1.2)', cursor: 'pointer' },
                        pressed: { outline: 'none' },
                      }}
                      onClick={() => stateCode && handleStateClick(stateCode)}
                      onMouseEnter={(e: React.MouseEvent) => {
                        if (!stateCode || !data) return
                        setTooltip({
                          x: e.clientX,
                          y: e.clientY,
                          label: `${STATE_TO_NAME[stateCode]}\n$${data.price.toFixed(3)}/gal`,
                        })
                      }}
                      onMouseLeave={() => setTooltip(null)}
                    />
                  )
                })
              }
            </Geographies>
          </ComposableMap>
        ) : (
          // County choropleth — zoomed to state
          <div style={{ position: 'absolute', inset: 0 }}>
            {countyLoading && (
              <div className="absolute inset-0 flex items-center justify-center z-10 bg-gray-900/80">
                <div className="text-gray-400 animate-pulse">Loading county data...</div>
              </div>
            )}
            {(() => {
              const proj = selectedState ? STATE_PROJECTION[selectedState] : null
              return (
                <ComposableMap
                  projection="geoMercator"
                  style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, touchAction: 'none' }}
                  projectionConfig={proj
                    ? { center: proj.center, scale: proj.scale }
                    : { center: [-96, 38], scale: 800 }
                  }
                >
                  <Geographies geography={COUNTY_TOPO_URL}>
                    {({ geographies }: { geographies: any[] }) => {
                      const stateFips = Object.entries(FIPS_TO_STATE).find(([, s]) => s === selectedState)?.[0]
                      const countyMap = Object.fromEntries(countyPrices.map(c => [c.fips, c]))

                      return geographies
                        .filter((geo: any) => {
                          const geoFips = geo.id?.toString().padStart(5, '0') ?? ''
                          return stateFips && geoFips.startsWith(stateFips)
                        })
                        .map((geo: any) => {
                          const fips = geo.id?.toString().padStart(5, '0') ?? ''
                          const county = countyMap[fips]
                          const color = county
                            ? priceToColor(county.price, cMin, cMax)
                            : '#2a2a3e'

                          return (
                            <Geography
                              key={geo.rsmKey}
                              geography={geo}
                              fill={color}
                              stroke="#1a1a2e"
                              strokeWidth={0.5}
                              style={{
                                default: { outline: 'none' },
                                hover: { outline: 'none', filter: 'brightness(1.2)' },
                                pressed: { outline: 'none' },
                              }}
                              onMouseEnter={(e: React.MouseEvent) => {
                                if (!county) return
                                setTooltip({ x: e.clientX, y: e.clientY, label: `${county.name} County\n$${county.price.toFixed(3)}/gal` })
                              }}
                              onTouchStart={(e: React.TouchEvent) => {
                                if (!county) return
                                const t = e.touches[0]
                                setTooltip({ x: t.clientX, y: t.clientY, label: `${county.name} County\n$${county.price.toFixed(3)}/gal` })
                                setTimeout(() => setTooltip(null), 2500)
                              }}
                              onMouseLeave={() => setTooltip(null)}
                            />
                          )
                        })
                    }}
                  </Geographies>
                </ComposableMap>
              )
            })()}
          </div>
        )}
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 pointer-events-none bg-gray-800 text-white text-sm px-3 py-2 rounded-lg shadow-xl border border-gray-600 whitespace-pre"
          style={{ left: Math.min(tooltip.x + 12, window.innerWidth - 180), top: Math.max(tooltip.y - 40, 10) }}
        >
          {tooltip.label}
        </div>
      )}

      {/* Legend */}
      <div className="mt-4 flex items-center gap-4 justify-center">
        <span className="text-xs text-gray-500">Cheaper</span>
        <div className="flex rounded overflow-hidden h-3 w-48">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="flex-1"
              style={{ background: priceToColor(minPrice + (i / 19) * (maxPrice - minPrice), minPrice, maxPrice) }}
            />
          ))}
        </div>
        <span className="text-xs text-gray-500">More Expensive</span>
      </div>
      <div className="flex justify-center gap-8 mt-1">
        <span className="text-xs text-gray-500">${minPrice.toFixed(3)}</span>
        <span className="text-xs text-gray-500">${maxPrice.toFixed(3)}</span>
      </div>

      {/* County price table (when drilled in) */}
      {selectedState && countyPrices.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-gray-300 mb-2">
            County Breakdown — {STATE_TO_NAME[selectedState]}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-64 overflow-y-auto pr-1">
            {[...countyPrices].sort((a, b) => a.name.localeCompare(b.name)).map(c => (
              <div
                key={c.fips}
                className="bg-gray-800 rounded-lg px-3 py-2 flex justify-between items-center"
              >
                <span className="text-xs text-gray-300 truncate">{c.name}</span>
                <span
                  className="text-xs font-bold ml-2"
                  style={{ color: priceToColor(c.price, cMin, cMax) }}
                >
                  ${c.price.toFixed(3)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
