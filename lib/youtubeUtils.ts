/**
 * YouTube Data API v3 helpers
 * Searches for a relevant video per article headline and caches in Vercel KV.
 * Free tier: 10,000 units/day. Each search = 100 units → 100 searches/day safe.
 * Cache TTL: 7 days per article slug to avoid re-burning quota.
 */

export interface YouTubeVideo {
  videoId: string
  title: string
  channelTitle: string
  thumbnailUrl: string
}

const YT_SEARCH = 'https://www.googleapis.com/youtube/v3/search'
const KV_TTL = 60 * 60 * 24 * 7 // 7 days

async function kvGet<T>(key: string): Promise<T | null> {
  try {
    const { kv } = await import('@vercel/kv')
    return await kv.get<T>(key)
  } catch { return null }
}

async function kvSet(key: string, value: unknown, ex: number) {
  try {
    const { kv } = await import('@vercel/kv')
    await kv.set(key, value, { ex })
  } catch { /* no-op */ }
}

/**
 * Returns the best YouTube video for an article, using KV cache.
 * Returns null if API key missing or search returns no results.
 */
export async function getArticleVideo(
  slug: string,
  headline: string,
  tags: string[] = []
): Promise<YouTubeVideo | null> {
  const apiKey = process.env.YOUTUBE_API_KEY
  if (!apiKey) return null

  // Check cache first
  const cached = await kvGet<YouTubeVideo>(`youtube:${slug}`)
  if (cached) return cached

  // Build search query — headline + Grocery Prices context
  const tagContext = tags.slice(0, 2).join(' ')
  const query = `${headline} Grocery Prices ${tagContext}`.slice(0, 100)

  try {
    const url = new URL(YT_SEARCH)
    url.searchParams.set('part', 'snippet')
    url.searchParams.set('q', query)
    url.searchParams.set('type', 'video')
    url.searchParams.set('maxResults', '5')
    url.searchParams.set('videoEmbeddable', 'true')
    url.searchParams.set('relevanceLanguage', 'en')
    url.searchParams.set('key', apiKey)

    const res = await fetch(url.toString(), { next: { revalidate: 0 } })
    if (!res.ok) {
      console.error('[youtube] API error:', res.status, await res.text())
      return null
    }

    const data = await res.json()
    const items = data.items ?? []

    // Filter out shorts (title contains #shorts) and prefer news/analysis channels
    const item = items.find((i: { snippet: { title: string } }) =>
      !i.snippet.title.toLowerCase().includes('#short')
    ) ?? items[0]

    if (!item) return null

    const video: YouTubeVideo = {
      videoId: item.id.videoId,
      title: item.snippet.title,
      channelTitle: item.snippet.channelTitle,
      thumbnailUrl: item.snippet.thumbnails?.medium?.url ?? '',
    }

    // Cache it
    await kvSet(`youtube:${slug}`, video, KV_TTL)
    return video

  } catch (e) {
    console.error('[youtube] fetch failed:', e)
    return null
  }
}
