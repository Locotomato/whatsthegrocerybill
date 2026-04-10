/**
 * /api/cron/daily-email
 *
 * Picks the best recent article and sends a "Article of the Day" email
 * to all WTGB subscribers via Resend.
 *
 * Cron schedule: 0 13 * * *  (9am ET / 1pm UTC)
 * KV cooldown: wtgb:daily-email:sent:{YYYY-MM-DD} — one send per day max
 */

import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@vercel/kv'
import type { Article } from '@/lib/articleUtils'

const RESEND_API_KEY     = process.env.RESEND_API_KEY!
const RESEND_AUDIENCE_ID = process.env.RESEND_AUDIENCE_ID!
const FROM_EMAIL         = 'newsletter@whatsthegrocerybill.com'
const FROM_NAME          = "What's The Grocery Bill"
const SITE_URL           = 'https://whatsthegrocerybill.com'

export async function GET(req: NextRequest) {
  try {
    // Auth check
    const cronSecret = process.env.CRON_SECRET
    if (cronSecret) {
      const auth = req.headers.get('authorization')
      if (auth !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    if (!RESEND_API_KEY || !RESEND_AUDIENCE_ID) {
      return NextResponse.json({ error: 'Resend env vars missing' }, { status: 500 })
    }

    // Daily cooldown — only one send per day
    const today = new Date().toISOString().slice(0, 10)
    const cooldownKey = `wtgb:daily-email:sent:${today}`
    const alreadySent = await kv.get(cooldownKey)
    if (alreadySent) {
      return NextResponse.json({ ok: true, skipped: true, reason: 'Already sent today' })
    }

    // Pick article of the day — most recent article with headline and subhead
    const slugs = await kv.lrange<string>('wtgb:articles:index', 0, 20)
    let pick: Article | null = null
    for (const slug of slugs) {
      const art = await kv.get<Article>(`wtgb:article:${slug}`)
      if (art && art.headline && art.subhead) {
        pick = art
        break
      }
    }

    if (!pick) {
      return NextResponse.json({ ok: false, reason: 'No suitable article found' })
    }

    const articleUrl = `${SITE_URL}/news/${pick.slug}`
    const categoryLabel = getCategoryLabel(pick.tags)

    // Get subscribers
    const contactsResp = await fetch(
      `https://api.resend.com/audiences/${RESEND_AUDIENCE_ID}/contacts`,
      { headers: { Authorization: `Bearer ${RESEND_API_KEY}` } }
    )
    if (!contactsResp.ok) {
      return NextResponse.json({ error: 'Failed to fetch contacts' }, { status: 500 })
    }
    const contactsData = await contactsResp.json()
    const subscribers: string[] = (contactsData.data ?? [])
      .filter((c: { unsubscribed?: boolean; email?: string }) => !c.unsubscribed && c.email)
      .map((c: { email: string }) => c.email)

    if (subscribers.length === 0) {
      return NextResponse.json({ ok: true, skipped: true, reason: 'No active subscribers' })
    }

    // Send individually (Resend broadcast API not available on current plan)
    let sent = 0
    const errors: string[] = []

    for (const email of subscribers) {
      const html = buildEmail({
        headline:    pick.headline,
        subhead:     pick.subhead,
        author:      pick.author ?? 'WTGB Staff',
        category:    categoryLabel,
        articleUrl,
        publishedAt: pick.publishedAt ?? pick.created_at ?? new Date().toISOString(),
      })

      const r = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from:    `${FROM_NAME} <${FROM_EMAIL}>`,
          to:      [email],
          subject: `Today's Price Signal: ${pick.headline}`,
          html,
          headers: {
            'List-Unsubscribe': `<mailto:unsubscribe@whatsthegrocerybill.com?subject=unsubscribe>`,
          },
        }),
      })
      if (r.ok) {
        sent++
      } else {
        const err = await r.json().catch(() => ({}))
        errors.push(`${email}: ${(err as { message?: string }).message ?? r.status}`)
      }
    }

    // Mark sent for today (25h TTL to be safe)
    await kv.set(cooldownKey, { article: pick.slug, sentAt: new Date().toISOString(), sent }, { ex: 90000 })

    return NextResponse.json({
      ok: true,
      article: pick.slug,
      subscribers: subscribers.length,
      sent,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error) {
    console.error('daily-email cron error', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

// ── Email HTML template ───────────────────────────────────────────────────────

interface EmailParams {
  headline: string
  subhead: string
  author: string
  category: string
  articleUrl: string
  publishedAt: string
}

function buildEmail(p: EmailParams): string {
  const date = new Date(p.publishedAt).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${p.headline}</title>
</head>
<body style="margin:0;padding:0;background:#f8f9fa;font-family:Georgia,serif;">

  <!-- Wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f8f9fa;padding:24px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#ffffff;border:1px solid #e5e7eb;border-radius:4px;overflow:hidden;">

        <!-- Header -->
        <tr>
          <td style="background:#16a34a;padding:20px 32px;">
            <a href="${SITE_URL}" style="text-decoration:none;">
              <span style="color:#ffffff;font-family:Georgia,serif;font-size:22px;font-weight:bold;letter-spacing:-0.5px;">What's The Grocery Bill?</span>
            </a>
            <br />
            <span style="color:#bbf7d0;font-size:12px;font-family:Arial,sans-serif;">Grocery Price Tracking &amp; Insights</span>
          </td>
        </tr>

        <!-- Article of the day label -->
        <tr>
          <td style="background:#f3f4f6;padding:10px 32px;border-bottom:1px solid #e5e7eb;">
            <span style="font-family:Arial,sans-serif;font-size:11px;font-weight:bold;text-transform:uppercase;letter-spacing:1.5px;color:#6b7280;">🛒 Price Signal of the Day · ${date}</span>
          </td>
        </tr>

        <!-- Category pill -->
        <tr>
          <td style="padding:24px 32px 12px 32px;">
            <span style="display:inline-block;background:#16a34a;color:#ffffff;font-family:Arial,sans-serif;font-size:11px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;padding:3px 8px;border-radius:2px;">${p.category}</span>
          </td>
        </tr>

        <!-- Headline -->
        <tr>
          <td style="padding:0 32px 12px 32px;">
            <a href="${p.articleUrl}" style="text-decoration:none;color:#121212;">
              <h1 style="margin:0;font-family:Georgia,serif;font-size:26px;font-weight:bold;line-height:1.3;color:#121212;">${p.headline}</h1>
            </a>
          </td>
        </tr>

        <!-- Byline -->
        <tr>
          <td style="padding:0 32px 20px 32px;">
            <span style="font-family:Arial,sans-serif;font-size:13px;color:#6b7280;">By <strong style="color:#374151;">${p.author}</strong></span>
          </td>
        </tr>

        <!-- Subhead / excerpt -->
        <tr>
          <td style="padding:0 32px 24px 32px;">
            <p style="margin:0;font-family:Georgia,serif;font-size:17px;line-height:1.7;color:#374151;">${p.subhead}</p>
          </td>
        </tr>

        <!-- CTA button -->
        <tr>
          <td style="padding:0 32px 32px 32px;">
            <a href="${p.articleUrl}"
              style="display:inline-block;background:#16a34a;color:#ffffff;font-family:Arial,sans-serif;font-size:14px;font-weight:bold;text-decoration:none;padding:12px 24px;border-radius:3px;">
              Read the Full Analysis →
            </a>
          </td>
        </tr>

        <!-- Divider -->
        <tr>
          <td style="padding:0 32px;"><hr style="border:none;border-top:1px solid #e5e7eb;margin:0;" /></td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:20px 32px;background:#f9fafb;">
            <p style="margin:0 0 8px 0;font-family:Arial,sans-serif;font-size:12px;color:#9ca3af;line-height:1.6;">
              You're receiving this because you subscribed at <a href="${SITE_URL}" style="color:#6b7280;">${SITE_URL}</a>.
              Content is for educational and informational purposes only. Prices and market conditions change rapidly — always verify current prices at your local store.
            </p>
            <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:#9ca3af;">
              <a href="mailto:unsubscribe@whatsthegrocerybill.com?subject=unsubscribe" style="color:#9ca3af;">Unsubscribe</a>
              &nbsp;·&nbsp; Magic Media Group LLC d/b/a What's The Grocery Bill
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>

</body>
</html>`
}

/** Map article tags to a readable category label for grocery content */
function getCategoryLabel(tags: string[]): string {
  if (!tags || tags.length === 0) return 'Grocery Prices'

  const tagMap: Record<string, string> = {
    'grocery-inflation':  'Grocery Inflation',
    'food-inflation':     'Food Inflation',
    'inflation':          'Inflation',
    'egg-prices':         'Egg Prices',
    'milk-prices':        'Milk Prices',
    'beef-prices':        'Beef Prices',
    'chicken-prices':     'Chicken Prices',
    'produce-prices':     'Produce Prices',
    'bread-prices':       'Bread Prices',
    'price-drop':         'Price Drop',
    'price-spike':        'Price Spike',
    'savings':            'Savings Tips',
    'budget':             'Budget',
    'supply-chain':       'Supply Chain',
    'tariffs':            'Tariffs & Trade',
    'usda':               'USDA Report',
    'walmart':            'Retail Prices',
    'kroger':             'Retail Prices',
    'aldi':               'Retail Prices',
    'costco':             'Retail Prices',
  }

  for (const tag of tags) {
    const normalized = tag.toLowerCase().replace(/\s+/g, '-')
    if (tagMap[normalized]) return tagMap[normalized]
  }

  // Fallback: capitalize and clean the first tag
  return tags[0]
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
}
