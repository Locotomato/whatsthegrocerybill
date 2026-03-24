#!/usr/bin/env python3
"""
Walmart Grocery Price Scraper
-------------------------------
Scrapes real prices for key grocery items from representative Walmart stores
(1-2 per state). Uses ScraperAPI to bypass Akamai bot detection.

Usage:
  SCRAPERAPI_KEY=your_key python3 walmart_scraper.py

Cost: ~300 ScraperAPI credits/day (6 items × 50 stores)
ScraperAPI: $29/mo for 250k credits = months of headroom
Sign up: https://scraperapi.com
"""

import os, re, json, time, sqlite3, datetime
import urllib.request, urllib.parse

SCRAPERAPI_KEY = os.getenv("SCRAPERAPI_KEY", "")
DB_PATH = os.path.join(os.path.dirname(__file__), "../data/walmart_prices.db")

# Key grocery items: Great Value (Walmart store brand) — most representative
# Product IDs confirmed March 2026
ITEMS = {
    "eggs_doz":      {"id": "145051978",  "name": "Great Value Large Eggs 12ct",    "label": "Eggs (doz)"},
    "milk_gal":      {"id": "10450114",   "name": "Great Value Whole Milk 1gal",    "label": "Milk (gal)"},
    "bread_loaf":    {"id": "10534516",   "name": "Great Value White Bread",        "label": "Bread (loaf)"},
    "ground_beef_lb":{"id": "169426473",  "name": "Ground Beef 73/27 1lb",         "label": "Ground Beef (lb)"},
    "chicken_lb":    {"id": "14808946",   "name": "Tyson Fresh Chicken Breast 1lb", "label": "Chicken Breast (lb)"},
    "butter_lb":     {"id": "10401783",   "name": "Great Value Unsalted Butter 1lb","label": "Butter (lb)"},
}

# One representative Walmart store per state (store IDs)
# Format: state_abbr: (store_id, city)
STATE_STORES = {
    "AL": ("706",  "Birmingham"),
    "AK": ("2780", "Anchorage"),
    "AZ": ("1509", "Phoenix"),
    "AR": ("100",  "Rogers"),
    "CA": ("5260", "Los Angeles"),
    "CO": ("1434", "Denver"),
    "CT": ("2108", "Hartford"),
    "DE": ("2072", "Wilmington"),
    "FL": ("928",  "Orlando"),
    "GA": ("836",  "Atlanta"),
    "HI": ("4615", "Honolulu"),
    "ID": ("1578", "Boise"),
    "IL": ("1672", "Chicago"),
    "IN": ("1624", "Indianapolis"),
    "IA": ("1530", "Des Moines"),
    "KS": ("1078", "Wichita"),
    "KY": ("546",  "Louisville"),
    "LA": ("428",  "New Orleans"),
    "ME": ("2170", "Portland"),
    "MD": ("2152", "Baltimore"),
    "MA": ("1979", "Boston"),
    "MI": ("1636", "Detroit"),
    "MN": ("1550", "Minneapolis"),
    "MS": ("318",  "Jackson"),
    "MO": ("1050", "St. Louis"),
    "MT": ("1844", "Billings"),
    "NE": ("1546", "Omaha"),
    "NV": ("3563", "Las Vegas"),
    "NH": ("2154", "Manchester"),
    "NJ": ("2096", "Newark"),
    "NM": ("744",  "Albuquerque"),
    "NY": ("3514", "New York"),
    "NC": ("1040", "Charlotte"),
    "ND": ("2094", "Bismarck"),
    "OH": ("1614", "Columbus"),
    "OK": ("624",  "Oklahoma City"),
    "OR": ("2356", "Portland"),
    "PA": ("2086", "Philadelphia"),
    "RI": ("2116", "Providence"),
    "SC": ("972",  "Columbia"),
    "SD": ("1930", "Sioux Falls"),
    "TN": ("802",  "Nashville"),
    "TX": ("648",  "Houston"),
    "UT": ("1630", "Salt Lake City"),
    "VT": ("3439", "Burlington"),
    "VA": ("1630", "Richmond"),
    "WA": ("2382", "Seattle"),
    "WV": ("1614", "Charleston"),
    "WI": ("1562", "Milwaukee"),
    "WY": ("1846", "Casper"),
}

def init_db():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS walmart_prices (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT NOT NULL,
            state TEXT NOT NULL,
            store_id TEXT NOT NULL,
            city TEXT NOT NULL,
            item_key TEXT NOT NULL,
            item_label TEXT NOT NULL,
            price REAL,
            scraped_at TEXT NOT NULL
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS national_averages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT NOT NULL,
            item_key TEXT NOT NULL,
            item_label TEXT NOT NULL,
            avg_price REAL,
            min_price REAL,
            max_price REAL,
            store_count INTEGER,
            computed_at TEXT NOT NULL
        )
    """)
    conn.execute("CREATE INDEX IF NOT EXISTS idx_date_state ON walmart_prices(date, state)")
    conn.execute("CREATE INDEX IF NOT EXISTS idx_natavg_date ON national_averages(date, item_key)")
    conn.commit()
    conn.close()

def scrape_walmart_price(item_id: str, store_id: str) -> float | None:
    """Fetch price via ScraperAPI with render=true to bypass Akamai."""
    if not SCRAPERAPI_KEY:
        raise RuntimeError("SCRAPERAPI_KEY not set")
    
    target_url = f"https://www.walmart.com/ip/{item_id}?store={store_id}"
    api_url = (
        f"https://api.scraperapi.com?"
        f"api_key={SCRAPERAPI_KEY}"
        f"&url={urllib.parse.quote(target_url)}"
        f"&render=true"           # renders JS, bypasses Akamai
        f"&country_code=us"
    )
    
    req = urllib.request.Request(api_url, headers={"Accept": "text/html"})
    try:
        resp = urllib.request.urlopen(req, timeout=60)
        html = resp.read().decode("utf-8", errors="ignore")
        
        # Try multiple price extraction patterns (Walmart page structure)
        patterns = [
            r'itemprop="price"[^>]*content="([\d.]+)"',
            r'"currentPrice":\{"price":([\d.]+)',
            r'"price":([\d.]+),"priceString"',
            r'"priceDisplay":"\$([\d.]+)"',
            r'data-testid="price-wrap"[^>]*>\s*\$\s*([\d.]+)',
        ]
        for pat in patterns:
            m = re.search(pat, html)
            if m:
                price = float(m.group(1))
                if 0.50 < price < 100:  # sanity check
                    return price
        
        return None
    except Exception as e:
        print(f"    ScraperAPI error for item {item_id} store {store_id}: {e}")
        return None

def run_scrape(states: list[str] | None = None):
    """Run full scrape. Pass states=None for all states, or a list for partial."""
    today = datetime.date.today().isoformat()
    target_states = states or list(STATE_STORES.keys())
    
    init_db()
    conn = sqlite3.connect(DB_PATH)
    
    print(f"Starting Walmart scrape for {len(target_states)} states, {len(ITEMS)} items each")
    print(f"Total requests: {len(target_states) * len(ITEMS)}")
    
    scraped = 0
    errors  = 0
    
    for state in target_states:
        store_id, city = STATE_STORES[state]
        print(f"\n[{state}] {city} (store {store_id})")
        
        for item_key, item_meta in ITEMS.items():
            price = scrape_walmart_price(item_meta["id"], store_id)
            
            if price:
                print(f"  {item_meta['label']}: ${price:.2f}")
                conn.execute("""
                    INSERT INTO walmart_prices 
                    (date, state, store_id, city, item_key, item_label, price, scraped_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """, (today, state, store_id, city, item_key, item_meta["label"], price,
                      datetime.datetime.utcnow().isoformat()))
                scraped += 1
            else:
                print(f"  {item_meta['label']}: FAILED")
                errors += 1
            
            conn.commit()
            time.sleep(0.5)  # polite rate limit
    
    # Compute national averages
    print(f"\nComputing national averages...")
    cursor = conn.execute("""
        SELECT item_key, item_label, AVG(price), MIN(price), MAX(price), COUNT(*)
        FROM walmart_prices
        WHERE date = ?
        GROUP BY item_key
    """, (today,))
    
    for row in cursor.fetchall():
        item_key, label, avg, mn, mx, cnt = row
        print(f"  {label}: avg=${avg:.2f} (${mn:.2f}-${mx:.2f}, {cnt} stores)")
        conn.execute("""
            INSERT OR REPLACE INTO national_averages
            (date, item_key, item_label, avg_price, min_price, max_price, store_count, computed_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (today, item_key, label, round(avg, 2), round(mn, 2), round(mx, 2), cnt,
              datetime.datetime.utcnow().isoformat()))
    
    conn.commit()
    conn.close()
    
    print(f"\nDone. {scraped} scraped, {errors} errors.")
    return {"scraped": scraped, "errors": errors}

def get_latest_national_averages() -> list[dict]:
    """Returns latest national averages from DB."""
    if not os.path.exists(DB_PATH):
        return []
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.execute("""
        SELECT item_key, item_label, avg_price, min_price, max_price, store_count, date
        FROM national_averages
        WHERE date = (SELECT MAX(date) FROM national_averages)
        ORDER BY item_key
    """)
    rows = [
        {"item_key": r[0], "label": r[1], "avg": r[2], "min": r[3], "max": r[4],
         "stores": r[5], "date": r[6]}
        for r in cursor.fetchall()
    ]
    conn.close()
    return rows

def get_state_prices(state: str, date: str | None = None) -> list[dict]:
    """Returns prices for a specific state."""
    if not os.path.exists(DB_PATH):
        return []
    conn = sqlite3.connect(DB_PATH)
    d = date or conn.execute(
        "SELECT MAX(date) FROM walmart_prices WHERE state = ?", (state,)
    ).fetchone()[0]
    
    cursor = conn.execute("""
        SELECT item_key, item_label, price, date
        FROM walmart_prices
        WHERE state = ? AND date = ?
        ORDER BY item_key
    """, (state, d))
    rows = [{"item_key": r[0], "label": r[1], "price": r[2], "date": r[3]} for r in cursor.fetchall()]
    conn.close()
    return rows

if __name__ == "__main__":
    import sys
    states = sys.argv[1:] if len(sys.argv) > 1 else None
    run_scrape(states)
