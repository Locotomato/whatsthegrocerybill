/**
 * Twitter OAuth 1.0a posting utilities
 * Used by both /api/cron/tweet and /api/cron/generate
 */
import crypto from 'crypto'

export interface TwitterSecrets {
  apiKey: string
  apiSecret: string
  token: string
  tokenSecret: string
}

export function oauthSign(
  method: string,
  url: string,
  params: Record<string, string>,
  secrets: TwitterSecrets
): string {
  const nonce = crypto.randomBytes(16).toString('hex')
  const ts    = Math.floor(Date.now() / 1000).toString()

  const oauthParams: Record<string, string> = {
    oauth_consumer_key:     secrets.apiKey,
    oauth_nonce:            nonce,
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp:        ts,
    oauth_token:            secrets.token,
    oauth_version:          '1.0',
  }

  const allParams = { ...params, ...oauthParams }
  const sortedKeys = Object.keys(allParams).sort()
  const paramStr = sortedKeys
    .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(allParams[k])}`)
    .join('&')

  const baseStr = [method.toUpperCase(), encodeURIComponent(url), encodeURIComponent(paramStr)].join('&')
  const signingKey = `${encodeURIComponent(secrets.apiSecret)}&${encodeURIComponent(secrets.tokenSecret)}`
  const signature  = crypto.createHmac('sha1', signingKey).update(baseStr).digest('base64')

  oauthParams['oauth_signature'] = signature
  return 'OAuth ' + Object.keys(oauthParams)
    .sort()
    .map(k => `${encodeURIComponent(k)}="${encodeURIComponent(oauthParams[k])}"`)
    .join(', ')
}

export async function postTweet(
  text: string,
  secrets: TwitterSecrets
): Promise<{ id?: string; error?: string }> {
  const url  = 'https://api.twitter.com/2/tweets'
  const auth = oauthSign('POST', url, {}, secrets)
  const res  = await fetch(url, {
    method: 'POST',
    headers: { Authorization: auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  })
  const json = await res.json() as any
  if (!res.ok) return { error: JSON.stringify(json) }
  return { id: json.data?.id }
}

/** Build an engaging tweet for a new article */
export function buildArticleTweet(
  headline: string,
  slug: string,
  tags: string[]
): string {
  const url = `https://whatsthegrocerybill.com/news/${slug}`

  // Pick up to 3 hashtags from tags — strip spaces, capitalize
  const hashtags = tags
    .slice(0, 3)
    .map(t => '#' + t.replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, ''))
    .filter(h => h.length > 1 && h.length <= 20)
    .join(' ')

  // Always include these power hashtags
  const fixed = '#GasPrices #OilMarket'
  const allTags = [hashtags, fixed].filter(Boolean).join(' ')

  // Headline truncated to fit: 280 - url(23) - tags - separators
  const budget = 280 - 1 - url.length - 1 - allTags.length - 2 // 2 newlines
  const hl = headline.length <= budget ? headline : headline.slice(0, budget - 1) + '…'

  return `${hl}\n\n${url}\n\n${allTags}`
}
