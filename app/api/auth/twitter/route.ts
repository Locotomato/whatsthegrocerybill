/**
 * GET /api/auth/twitter
 * Initiates the Twitter OAuth 2.0 PKCE flow.
 * Visit this URL in your browser once to authorize the app.
 */
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

function base64url(buf: Buffer): string {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

export async function GET(req: NextRequest) {
  const clientId = process.env.TWITTER_CLIENT_ID
  if (!clientId) {
    return NextResponse.json({ error: 'TWITTER_CLIENT_ID not set' }, { status: 500 })
  }

  // PKCE
  const codeVerifier  = base64url(crypto.randomBytes(32))
  const codeChallenge = base64url(crypto.createHash('sha256').update(codeVerifier).digest())
  const state         = base64url(crypto.randomBytes(16))

  const callbackUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://whatsthegrocerybill.com'}/api/auth/twitter/callback`

  const authUrl = new URL('https://twitter.com/i/oauth2/authorize')
  authUrl.searchParams.set('response_type',          'code')
  authUrl.searchParams.set('client_id',              clientId)
  authUrl.searchParams.set('redirect_uri',           callbackUrl)
  authUrl.searchParams.set('scope',                  'tweet.read tweet.write users.read like.write follows.write offline.access')
  authUrl.searchParams.set('state',                  state)
  authUrl.searchParams.set('code_challenge',         codeChallenge)
  authUrl.searchParams.set('code_challenge_method',  'S256')

  // Store verifier + state in a short-lived cookie
  const response = NextResponse.redirect(authUrl.toString())
  response.cookies.set('tw_pkce_verifier', codeVerifier, {
    httpOnly: true, secure: true, sameSite: 'lax', maxAge: 600, path: '/',
  })
  response.cookies.set('tw_pkce_state', state, {
    httpOnly: true, secure: true, sameSite: 'lax', maxAge: 600, path: '/',
  })

  return response
}
