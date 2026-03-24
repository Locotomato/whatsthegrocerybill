# CHANGELOG — whatsthegrocerybill.com

All notable changes to this project are documented here.
Format: `[YYYY-MM-DD] Type: Description`

---

## [2026-03-24]

### Fixed
- **KV namespace collision (critical)** — WTGB and WTPOG share a Vercel KV store; WTGB was reading/writing `articles:latest` (same key as WTPOG), causing gas articles to appear in the "Grocery Price Trends" section. All WTGB KV keys are now namespaced with `wtgb:` prefix:
  - `wtgb:articles:latest` (homepage cache)
  - `wtgb:articles:index` (archive slug list)
  - `wtgb:article:{slug}` (individual articles)
  - `wtgb:tweet:seen:{id}` (dedup)
- **Archive rebuild on cold start** — articles route now reconstructs `wtgb:articles:latest` from `wtgb:articles:index` when the homepage cache is empty, preventing blank article sections after deploys
- **Mobile price grid** — changed from `minmax(150px, 1fr)` (forced single column on ~375px phones due to inner card padding) to explicit `repeat(2, 1fr)` on mobile, `auto-fill minmax(150px, 1fr)` on 480px+ screens

### Changed
- Generate cron changed from hourly to every 2 hours (Vercel Pro rate limit headroom)

---

## [2026-03-24 morning]

### Added
- **Walmart price scraper** (`scripts/walmart_scraper.py`) — bypasses Akamai bot protection via ScraperAPI; pulls live shelf prices for 50 stores × 6 items (eggs, milk, bread, beef, chicken, butter)

### Fixed
- State price pages: now use USDA monthly estimate × state cost-of-living index instead of a flat fallback; summary cards updated
- Null safety on `yoyPct`/`yoyUp` in price grid — was crashing prerender when BLS data partially missing
- Removed stale WTPOG gas-prices API routes that were breaking Turbopack build
- Real BLS YoY% calculation — accurate source label with data month displayed
- Article page null safety: `generated_at` fallback, fixed `about` schema (was referencing gas, now grocery), YouTube KV namespace collision fixed (`wtgb:youtube:*`)

---

## [2026-03-23]

### Added
- **Grocery Engagement Cron** (`/api/cron/engage`) — follows/unfollows/replies/likes targeting grocery price conversations on Twitter (@wtgbofficial)
- **6 Evergreen Grocery Guides**:
  - Why Are Egg Prices So High?
  - How to Save Money on Groceries
  - Cheapest Grocery Stores Compared
  - Inflation and Your Grocery Bill
  - Grocery Prices by State
  - What Affects Grocery Prices?
- **BLS CPI Grocery Prices API** — live national averages for eggs, milk, beef, chicken, bread, butter pulled directly from BLS
- **YouTube video embeds** on article pages (KV-cached 7 days, namespaced `wtgb:youtube:*`)

### Fixed
- Full gas content purge: renamed email banner component, rewrote all state page copy, fixed sitemap, redirected gas station brand pages to `/grocery-prices`, grocery-only cron queries
- Twitter search query corrected from gas prices → grocery prices; sentiment words updated
- Tweet cron: now posts latest unposted grocery article from KV (was incorrectly pulling gas price signals)
- Article page null safety: `source_tweet` optional — seeded content without a source tweet no longer crashes
- OAuth PKCE cookies: `sameSite=none` to survive Twitter redirect through Cloudflare proxy

### Changed
- Dark green brand identity applied sitewide (`#0c1409` background, `#16a34a`/`#4ade80` accents)
- Hero redesigned: item price grid (eggs/milk/beef/chicken/bread/butter) replaces gas map

---

## [2026-03-23] — Fork & Launch

### Added
- **Initial fork from WTPOG** — brand swap to grocery, article generation prompt rewritten for grocery content, IndexNow key configured (`1aad7dfecb3488df56e98b3335b912a3`)
- Grocery article generation engine: Twitter grocery signals → Claude Haiku → KV → IndexNow → auto-tweet
- State grocery price pages (`/grocery-prices/[state]`)
- City grocery price pages (`/grocery-prices/[state]/[city]`)
- Warehouse club pages: BJ's, Walmart, Wawa (states they operate in)
- `/grocery-prices/near-me` — GPS-based nearest city page
- Email capture with Resend integration
- Sitemap auto-generation
- @wtgbofficial Twitter account connected via OAuth 2.0

---

## Agent Ownership

**Grove** 🌿 is the dedicated agent for this repo.
Scope: all WTGB features, article content, SEO, mobile/UX, data pipeline.
Config: `memory/grove-agent.md` in the OpenClaw workspace.
