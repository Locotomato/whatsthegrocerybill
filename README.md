# ⛽ What's the Grocery Bill?

Live US retail gasoline prices as a state choropleth map with county drill-down.

## Features
- 🗺️ **State choropleth** — color-coded map of all 50 states, green (cheap) → red (expensive)
- 🔍 **County drill-down** — click any state to view county-level price breakdown
- 📊 **National average** — live US avg prominently displayed
- 🔄 **Live data** — pulls from EIA (US Energy Information Administration), updated weekly
- 🖱️ **Hover tooltips** — see exact price on mouseover

## Data Source
[EIA Retail Gasoline Prices API](https://www.eia.gov/opendata/) — free, official US government data, updated every Monday.

County-level data: EIA provides state-level prices. County prices are estimated from state averages with local variance modeling. Phase 2 will wire up GasBuddy API for true county-level data.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

```
EIA_API_KEY=DEMO_KEY  # Get a free key at https://www.eia.gov/opendata/
```

DEMO_KEY works out of the box but is rate-limited (30 req/hr). Register for a free key to remove limits.

## Stack
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- react-simple-maps
- EIA Open Data API

## Roadmap
- [ ] County prices via GasBuddy API (true data, not estimates)
- [ ] Price history chart per state (7d / 30d / 90d)
- [ ] Fuel type toggle (regular / midgrade / premium / diesel)
- [ ] Mobile-optimized touch interactions
- [ ] Vercel deploy + custom domain
