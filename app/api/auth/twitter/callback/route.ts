/**
 * GET /api/auth/twitter/callback
 * Handles the OAuth 2.0 callback from Twitter.
 * Exchanges the auth code for tokens and stores the refresh token in Vercel KV.
 */
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

async function kvSet(key: string, value: string, ex?: number) {
  const { kv } = await import('@vercel/kv')
  if (ex) await kv.set(key, value, { ex })
  else await kv.set(key, value)
}

async function kvGet(key: string): Promise<string | null> {
  try {
    const { kv } = await import('@vercel/kv')
    return await kv.get<string>(key)
  } catch { return null }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code  = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  if (error) {
    return new NextResponse(`Twitter auth error: ${error}`, { status: 400 })
  }

  if (!code) {
    return new NextResponse('Missing code parameter', { status: 400 })
  }

  // Validate state + retrieve verifier — check cookies first, fall back to KV
  const cookieState  = req.cookies.get('tw_pkce_state')?.value
  let codeVerifier   = req.cookies.get('tw_pkce_verifier')?.value

  // If no cookie (e.g. direct Twitter URL flow), look up verifier from KV by state
  if (!codeVerifier && state) {
    codeVerifier = await kvGet(`tw_pkce_verifier:${state}`) ?? undefined
  }

  // Accept if state matches cookie OR if we found the verifier in KV (server-generated flow)
  const stateOk = (cookieState && cookieState === state) || (!cookieState && !!codeVerifier)
  if (!stateOk) {
    return new NextResponse('State mismatch — CSRF check failed', { status: 400 })
  }
  if (!codeVerifier) {
    return new NextResponse('Missing PKCE verifier', { status: 400 })
  }

  const clientId     = process.env.TWITTER_CLIENT_ID!
  const clientSecret = process.env.TWITTER_CLIENT_SECRET!
  const callbackUrl  = `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://whatsthegrocerybill.com'}/api/auth/twitter/callback`

  // Exchange code for tokens
  const tokenRes = await fetch('https://api.twitter.com/2/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
    },
    body: new URLSearchParams({
      grant_type:    'authorization_code',
      code,
      redirect_uri:  callbackUrl,
      code_verifier: codeVerifier,
    }).toString(),
  })

  if (!tokenRes.ok) {
    const err = await tokenRes.text()
    return new NextResponse(`Token exchange failed: ${err}`, { status: 500 })
  }

  const data = await tokenRes.json() as {
    access_token: string
    refresh_token?: string
    expires_in: number
    scope: string
  }

  if (!data.refresh_token) {
    return new NextResponse(
      'No refresh_token returned — make sure offline.access scope is included and app type is set to "Web App".',
      { status: 500 }
    )
  }

  // Store refresh token in KV
  await kvSet('wtgb:twitter:refresh_token', data.refresh_token)

  // Clear PKCE cookies
  const response = new NextResponse(`
    <!DOCTYPE html>
    <html>
    <head><title>Twitter Auth Complete</title></head>
    <body style="font-family:sans-serif;padding:40px;max-width:600px">
      <h2>✅ Twitter OAuth 2.0 Connected!</h2>
      <p>Refresh token saved to Vercel KV. WTGB can now post tweets automatically.</p>
      <p><strong>Scopes granted:</strong> ${data.scope}</p>
      <p>You can close this page.</p>
    </body>
    </html>
  `, {
    status: 200,
    headers: { 'Content-Type': 'text/html' },
  })

  response.cookies.delete('tw_pkce_verifier')
  response.cookies.delete('tw_pkce_state')

  return response
}
