import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: '/docs/' },
    sitemap: [
      'https://whatsthegrocerybill.com/sitemap.xml',
      'https://whatsthegrocerybill.com/sitemap-news.xml',
    ],
  }
}
