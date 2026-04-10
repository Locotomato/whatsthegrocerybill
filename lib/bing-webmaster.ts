const BING_API_KEY = process.env.BING_WEBMASTER_KEY!

export async function submitSitemapToBing(sitemapUrl: string): Promise<void> {
  if (!BING_API_KEY) return
  try {
    const res = await fetch(
      `https://ssl.bing.com/webmaster/api.svc/json/SubmitSitemap?apikey=${BING_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({ siteUrl: new URL(sitemapUrl).origin, sitemap: sitemapUrl })
      }
    )
    if (!res.ok) console.error('Bing sitemap submit failed:', res.status, await res.text())
  } catch (err) {
    console.error('Bing sitemap error:', err)
  }
}

export async function pingBingUrls(urls: string[], siteUrl: string): Promise<void> {
  if (!BING_API_KEY) return
  try {
    const res = await fetch(
      `https://ssl.bing.com/webmaster/api.svc/json/SubmitUrlbatch?apikey=${BING_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({ siteUrl, urlList: urls.slice(0, 500) })
      }
    )
    if (!res.ok) console.error('Bing URL ping failed:', res.status, await res.text())
  } catch (err) {
    console.error('Bing ping error:', err)
  }
}
