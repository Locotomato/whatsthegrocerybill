import { NextResponse } from 'next/server'
import { type Article } from '../../../lib/articleUtils'

export const dynamic = 'force-dynamic'

// ─── KV keys ─────────────────────────────────────────────────────────────────
// articles:latest  → Article[]  (latest 3, for homepage)
// articles:index   → string[]   (all slugs ever, newest first)
// article:{slug}   → Article    (individual article data)
const KV_LATEST  = 'wtgb:articles:latest'
const KV_INDEX   = 'wtgb:articles:index'

// ─── In-process fallback cache (when KV not configured) ──────────────────────
const CACHE_TTL_MS = 2 * 60 * 60 * 1000
let _cache: { articles: Article[]; ts: number } | null = null

// ─── KV helpers (lazy import so build works without KV env vars) ─────────────
async function kvGet<T>(key: string): Promise<T | null> {
  try {
    const { kv } = await import('@vercel/kv')
    return await kv.get<T>(key)
  } catch { return null }
}

async function kvSet(key: string, value: unknown, ex?: number) {
  try {
    const { kv } = await import('@vercel/kv')
    if (ex) await kv.set(key, value, { ex })
    else    await kv.set(key, value)
  } catch (e) {
    console.error('[articles] KV set failed:', e)
  }
}

async function kvLrange(key: string, start: number, stop: number): Promise<string[]> {
  try {
    const { kv } = await import('@vercel/kv')
    return (await kv.lrange<string>(key, start, stop)) ?? []
  } catch { return [] }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '3', 10), 500)
  const wantAll = limit > 3

  // For sitemap / full-index requests: always read from the full archive index
  if (wantAll) {
    try {
      const slugs = await kvLrange(KV_INDEX, 0, limit - 1)
      const articles: Article[] = (
        await Promise.all(slugs.map(s => kvGet<Article>(`wtgb:article:${s}`)))
      ).filter((a): a is Article => a !== null)
      return NextResponse.json({ articles, cached: true, source: 'full_index' })
    } catch (e) {
      console.error('[articles] full index read failed:', e)
    }
  }

  // 1. Try KV first — instant if warm
  const cached = await kvGet<Article[]>(KV_LATEST)
  if (cached && cached.length > 0) {
    return NextResponse.json({ articles: cached, cached: true })
  }

  // 1b. Reconstruct latest from archive index (handles case where latest cache is empty
  //     but articles were previously generated and stored under wtgb:article:{slug})
  try {
    const slugs = await kvLrange(KV_INDEX, 0, 49) // grab top 50
    if (slugs && slugs.length > 0) {
      const archiveArticles: Article[] = (
        await Promise.all(slugs.map(s => kvGet<Article>(`wtgb:article:${s}`)))
      ).filter((a): a is Article => a !== null)

      if (archiveArticles.length > 0) {
        const latest = archiveArticles.slice(0, 50)
        await kvSet(KV_LATEST, latest, 60 * 60 * 2) // rebuild the latest cache
        _cache = { articles: latest, ts: Date.now() }
        return NextResponse.json({ articles: latest, cached: true, source: 'archive_rebuild' })
      }
    }
  } catch (e) {
    console.error('[articles] archive rebuild failed:', e)
  }

  // 2. In-process fallback cache
  if (_cache && Date.now() - _cache.ts < CACHE_TTL_MS) {
    return NextResponse.json({ articles: _cache.articles, cached: true })
  }

  // Articles are only written by the cron routes, from source text.
  return NextResponse.json({ articles: [], note: 'no_articles' })
}
