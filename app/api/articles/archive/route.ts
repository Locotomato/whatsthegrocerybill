import { NextResponse } from 'next/server'
import type { Article } from '../../../../lib/articleUtils'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const { kv } = await import('@vercel/kv')

    // Get all slugs (newest first, up to 200)
    const slugs = await kv.lrange<string>('wtgb:articles:index', 0, 199)
    if (!slugs || slugs.length === 0) {
      return NextResponse.json({ articles: [] })
    }

    // Fetch all articles in parallel
    const articles = await Promise.all(
      slugs.map(slug => kv.get<Article>(`wtgb:article:${slug}`))
    )

    const valid = articles.filter((a): a is Article => a !== null)
    return NextResponse.json({ articles: valid })
  } catch (e) {
    console.error('[archive] KV error:', e)
    return NextResponse.json({ articles: [], error: 'kv_unavailable' })
  }
}
