/**
 * newsCache.ts — SQLite-backed persistent cache for Twitter news feed
 *
 * Goals:
 * - Survive server restarts / Vercel cold starts (via /tmp fallback)
 * - Single source of truth for last fetch timestamp
 * - Track API call count so we never overhit Twitter
 * - TTL: 30 minutes (configurable)
 */

import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

export const CACHE_TTL_MS = 30 * 60 * 1000  // 30 minutes — do NOT lower without good reason

// Prefer project data dir; fall back to /tmp on Vercel (ephemeral but better than nothing)
function getDbPath() {
  const candidates = [
    path.join(process.cwd(), 'data', 'news_cache.db'),
    '/tmp/news_cache.db',
  ]
  for (const p of candidates) {
    try {
      fs.mkdirSync(path.dirname(p), { recursive: true })
      return p
    } catch { /* try next */ }
  }
  return candidates[candidates.length - 1]
}

let _db: Database.Database | null = null

function getDb(): Database.Database {
  if (_db) return _db
  const dbPath = getDbPath()
  _db = new Database(dbPath)
  _db.exec(`
    CREATE TABLE IF NOT EXISTS tweet_cache (
      id          TEXT PRIMARY KEY,
      author      TEXT NOT NULL,
      username    TEXT NOT NULL,
      avatar      TEXT,
      text        TEXT NOT NULL,
      url         TEXT NOT NULL,
      created_at  TEXT NOT NULL,
      sentiment   TEXT NOT NULL,
      fetched_at  INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS api_stats (
      id          INTEGER PRIMARY KEY CHECK (id = 1),
      total_calls INTEGER NOT NULL DEFAULT 0,
      last_fetch  INTEGER NOT NULL DEFAULT 0,
      last_count  INTEGER NOT NULL DEFAULT 0
    );

    INSERT OR IGNORE INTO api_stats (id, total_calls, last_fetch, last_count)
    VALUES (1, 0, 0, 0);
  `)
  return _db
}

export interface CachedTweet {
  id: string
  author: string
  username: string
  avatar?: string
  text: string
  url: string
  created_at: string
  sentiment: 'up' | 'down' | 'neutral'
  fetched_at: number
}

/**
 * Returns tweets from DB (always) + whether a Twitter refresh is needed.
 * We always serve from the DB; the TTL only controls when to call Twitter.
 */
export function getCached(): { tweets: CachedTweet[]; lastFetch: number; needsRefresh: boolean } {
  try {
    const db = getDb()
    const stats = db.prepare('SELECT * FROM api_stats WHERE id = 1').get() as {
      total_calls: number; last_fetch: number; last_count: number
    }
    const age = Date.now() - stats.last_fetch
    const needsRefresh = age > CACHE_TTL_MS || stats.last_fetch === 0

    const tweets = db.prepare(
      'SELECT * FROM tweet_cache ORDER BY created_at DESC LIMIT 60'
    ).all() as CachedTweet[]

    return { tweets, lastFetch: stats.last_fetch, needsRefresh }
  } catch (e) {
    console.error('[newsCache] getCached error:', e)
    return { tweets: [], lastFetch: 0, needsRefresh: true }
  }
}

/** Writes fresh tweets to cache and bumps API call counter */
export function setCache(tweets: CachedTweet[]): void {
  try {
    const db = getDb()
    const now = Date.now()

    // Upsert all tweets
    const upsert = db.prepare(`
      INSERT INTO tweet_cache (id, author, username, avatar, text, url, created_at, sentiment, fetched_at)
      VALUES (@id, @author, @username, @avatar, @text, @url, @created_at, @sentiment, @fetched_at)
      ON CONFLICT(id) DO UPDATE SET
        text=excluded.text, sentiment=excluded.sentiment, fetched_at=excluded.fetched_at
    `)
    const insertMany = db.transaction((items: CachedTweet[]) => {
      for (const t of items) upsert.run({ ...t, fetched_at: now })
    })
    insertMany(tweets)

    // Prune tweets older than 7 days
    db.prepare("DELETE FROM tweet_cache WHERE created_at < datetime('now', '-7 days')").run()

    // Bump stats
    db.prepare(`
      UPDATE api_stats SET
        total_calls = total_calls + 1,
        last_fetch  = ?,
        last_count  = ?
      WHERE id = 1
    `).run(now, tweets.length)
  } catch (e) {
    console.error('[newsCache] setCache error:', e)
  }
}

/** How many Twitter API calls have we made total */
export function getApiStats(): { totalCalls: number; lastFetch: number; lastCount: number } {
  try {
    const db = getDb()
    const row = db.prepare('SELECT * FROM api_stats WHERE id = 1').get() as {
      total_calls: number; last_fetch: number; last_count: number
    }
    return { totalCalls: row.total_calls, lastFetch: row.last_fetch, lastCount: row.last_count }
  } catch {
    return { totalCalls: 0, lastFetch: 0, lastCount: 0 }
  }
}
