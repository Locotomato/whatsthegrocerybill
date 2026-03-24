import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { tweetIdFromSlug, fetchTweetById, generateArticle, type Article } from '../../../lib/articleUtils'
import ArticleEmailCapture from '../../components/ArticleEmailCapture'
import { getArticleVideo, type YouTubeVideo } from '../../../lib/youtubeUtils'

export const revalidate = 86400

interface Props { params: Promise<{ slug: string }> }

// ─── State slug map for internal linking ─────────────────────────────────────
const STATE_SLUGS: Record<string, string> = {
  'alabama':'alabama','alaska':'alaska','arizona':'arizona','arkansas':'arkansas',
  'california':'california','colorado':'colorado','connecticut':'connecticut',
  'delaware':'delaware','florida':'florida','georgia':'georgia','hawaii':'hawaii',
  'idaho':'idaho','illinois':'illinois','indiana':'indiana','iowa':'iowa',
  'kansas':'kansas','kentucky':'kentucky','louisiana':'louisiana','maine':'maine',
  'maryland':'maryland','massachusetts':'massachusetts','michigan':'michigan',
  'minnesota':'minnesota','mississippi':'mississippi','missouri':'missouri',
  'montana':'montana','nebraska':'nebraska','nevada':'nevada','new hampshire':'new-hampshire',
  'new jersey':'new-jersey','new mexico':'new-mexico','new york':'new-york',
  'north carolina':'north-carolina','north dakota':'north-dakota','ohio':'ohio',
  'oklahoma':'oklahoma','oregon':'oregon','pennsylvania':'pennsylvania',
  'rhode island':'rhode-island','south carolina':'south-carolina',
  'south dakota':'south-dakota','tennessee':'tennessee','texas':'texas',
  'utah':'utah','vermont':'vermont','virginia':'virginia','washington':'washington',
  'west virginia':'west-virginia','wisconsin':'wisconsin','wyoming':'wyoming',
}

async function getArticle(slug: string): Promise<Article | null> {
  // 1. KV first — instant
  try {
    const { kv } = await import('@vercel/kv')
    const cached = await kv.get<Article>(`wtgb:article:${slug}`)
    if (cached) return cached
  } catch { /* fall through */ }

  // 2. Generate + store
  const bearer       = process.env.TWITTER_BEARER_TOKEN
  const anthropicKey = process.env.ANTHROPIC_API_KEY
  if (!bearer || !anthropicKey) return null
  const tweetId = tweetIdFromSlug(slug)
  if (!tweetId) return null
  const tweet = await fetchTweetById(tweetId, bearer)
  if (!tweet) return null
  const article = await generateArticle(tweet, anthropicKey)
  if (!article) return null
  const full: Article = { ...article, slug } as Article

  try {
    const { kv } = await import('@vercel/kv')
    await kv.set(`wtgb:article:${slug}`, full, { ex: 60 * 60 * 24 * 60 })
    await kv.lpush('wtgb:articles:index', slug)
  } catch { /* non-fatal */ }

  return full
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticle(slug)
  if (!article) return { title: "What's the Grocery Bill?" }
  const url = `https://whatsthegrocerybill.com/news/${slug}`
  const kw = [...(article.tags ?? []), ...(article.geo_tags ?? []).map(s => `${s} Grocery Prices`),
    'Grocery Prices today', 'price per item', 'national average Grocery Price']
  return {
    title: `${article.headline} | What's the Grocery Bill?`,
    description: article.subhead,
    authors: [{ name: '@wtgbofficial', url: 'https://twitter.com/wtgbofficial' }],
    keywords: kw,
    openGraph: {
      title: article.headline, description: article.subhead, url,
      siteName: "What's the Grocery Bill?", type: 'article',
      publishedTime: new Date(article.source_tweet.created_at).toISOString(),
      authors: ['https://twitter.com/wtgbofficial'], tags: article.tags,
    },
    twitter: {
      card: 'summary_large_image', site: '@wtgbofficial', creator: '@wtgbofficial',
      title: article.headline, description: article.subhead,
    },
    alternates: { canonical: url },
  }
}

/** Render body that uses ## H2 and ### H3 markers */
function renderBody(body: string, slug: string) {
  const lines = body.split('\n')
  const elements: React.ReactNode[] = []
  let paraBuffer: string[] = []
  let emailInserted = false

  function flushPara() {
    const text = paraBuffer.join(' ').trim()
    if (text) {
      elements.push(
        <p key={`p-${elements.length}`} style={{
          margin: 0, fontSize: 17, lineHeight: 1.8, color: '#cbd5e1',
        }}>{text}</p>
      )
      // Insert email capture after first paragraph
      if (!emailInserted) {
        elements.push(<ArticleEmailCapture key="mid-capture" placement="mid" />)
        emailInserted = true
      }
    }
    paraBuffer = []
  }

  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.startsWith('### ')) {
      flushPara()
      elements.push(
        <h3 key={`h3-${elements.length}`} style={{
          margin: '28px 0 8px', fontSize: 18, fontWeight: 700,
          color: '#f1f5f9', letterSpacing: '-0.01em',
        }}>{trimmed.replace('### ', '')}</h3>
      )
    } else if (trimmed.startsWith('## ')) {
      flushPara()
      elements.push(
        <h2 key={`h2-${elements.length}`} style={{
          margin: '36px 0 10px', fontSize: 21, fontWeight: 800,
          color: '#f8fafc', letterSpacing: '-0.02em',
          paddingBottom: 8, borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>{trimmed.replace('## ', '')}</h2>
      )
    } else if (trimmed === '') {
      flushPara()
    } else {
      paraBuffer.push(trimmed)
    }
  }
  flushPara()
  return elements
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params
  const article = await getArticle(slug)
  if (!article) notFound()

  // Fetch YouTube video in parallel (non-blocking — null if API key not set)
  const video: YouTubeVideo | null = await getArticleVideo(
    slug,
    article.headline,
    article.tags ?? []
  ).catch(() => null)

  const articleUrl = `https://whatsthegrocerybill.com/news/${slug}`

  // Geo tags that map to state pages
  const linkedStates = (article.geo_tags ?? [])
    .filter(g => STATE_SLUGS[g.toLowerCase()])
    .slice(0, 4)

  // JSON-LD schemas
  const articleSchema = {
    '@context': 'https://schema.org', '@type': 'NewsArticle',
    headline: article.headline, description: article.subhead,
    datePublished: new Date(article.source_tweet.created_at).toISOString(),
    dateModified: new Date(article.generated_at).toISOString(),
    author: [{ '@type': 'Organization', name: 'wtgbofficial', url: 'https://twitter.com/wtgbofficial' }],
    publisher: { '@type': 'Organization', name: "What's the Grocery Bill?", url: 'https://whatsthegrocerybill.com' },
    url: articleUrl, mainEntityOfPage: { '@type': 'WebPage', '@id': articleUrl },
    keywords: [...(article.tags ?? []), ...(article.geo_tags ?? []).map(s => `${s} Grocery Prices`)].join(', '),
    about: [{ '@type': 'Thing', name: 'Gasoline prices' }, { '@type': 'Thing', name: 'Oil markets' }],
    speakable: { '@type': 'SpeakableSpecification', cssSelector: ['h1', 'h2', '.article-subhead'] },
  }

  const faqSchema = article.faqs && article.faqs.length > 0 ? {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: article.faqs.map(f => ({
      '@type': 'Question', name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  } : null

  const breadcrumbSchema = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://whatsthegrocerybill.com' },
      { '@type': 'ListItem', position: 2, name: 'Price Pressure Analysis', item: 'https://whatsthegrocerybill.com/news' },
      { '@type': 'ListItem', position: 3, name: article.headline, item: articleUrl },
    ],
  }

  return (
    <main style={{ minHeight: '100vh', background: '#0b0d14', color: '#f1f5f9' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {faqSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />}

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 20px 80px' }}>

        {/* Breadcrumb nav */}
        <nav aria-label="breadcrumb" style={{ marginBottom: 28, fontSize: 13, color: '#475569', display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
          <Link href="/" style={{ color: '#475569', textDecoration: 'none' }}>Home</Link>
          <span>›</span>
          <Link href="/news" style={{ color: '#475569', textDecoration: 'none' }}>Price Pressure Analysis</Link>
          <span>›</span>
          <span style={{ color: '#334155' }}>{article.headline.slice(0, 40)}…</span>
        </nav>

        {/* Tags */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
          <span style={{
            fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
            color: '#16a34a', background: 'rgba(239,68,68,0.12)',
            padding: '3px 10px', borderRadius: 4, textTransform: 'uppercase',
          }}>⬆ Price Pressure</span>
          {(article.tags ?? []).slice(0, 3).map((tag: string) => (
            <span key={tag} style={{
              fontSize: 11, color: '#64748b',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              padding: '3px 10px', borderRadius: 4,
            }}>{tag}</span>
          ))}
        </div>

        {/* Headline */}
        <h1 style={{
          fontSize: 'clamp(26px, 5vw, 40px)', fontWeight: 900,
          lineHeight: 1.2, letterSpacing: '-0.02em', color: '#f8fafc', margin: '0 0 14px',
        }}>{article.headline}</h1>

        {/* Subhead */}
        <p className="article-subhead" style={{
          fontSize: 18, color: '#94a3b8', lineHeight: 1.55, margin: '0 0 24px',
        }}>{article.subhead}</p>

        {/* Byline */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          paddingBottom: 20, borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: 32,
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%', background: '#1d9bf0',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 700, color: '#fff', flexShrink: 0,
          }}>W</div>
          <div>
            <a href="https://twitter.com/wtgbofficial" target="_blank" rel="noopener noreferrer"
              style={{ color: '#1d9bf0', textDecoration: 'none', fontWeight: 600, fontSize: 14 }}>
              @wtgbofficial
            </a>
            <div style={{ fontSize: 12, color: '#475569' }}>{formatDate(article.source_tweet.created_at)}</div>
          </div>
          {/* Share on X — byline inline, pushed right */}
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.headline)}&url=${encodeURIComponent(articleUrl)}&via=wtgbofficial`}
            target="_blank" rel="noopener noreferrer"
            style={{
              marginLeft: 'auto',
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: '#000', color: '#fff',
              fontSize: 12, fontWeight: 700,
              padding: '7px 14px', borderRadius: 20,
              textDecoration: 'none', whiteSpace: 'nowrap',
              border: '1px solid rgba(255,255,255,0.12)',
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.63L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/>
            </svg>
            Share
          </a>
        </div>

        {/* Article body with H2/H3 rendering */}
        <article>
          {renderBody(article.body ?? '', slug)}
        </article>

        {/* Geo state links */}
        {linkedStates.length > 0 && (
          <div style={{
            marginTop: 36, padding: '16px 18px',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10,
          }}>
            <div style={{ fontSize: 12, color: '#475569', fontWeight: 700, letterSpacing: '0.06em', marginBottom: 10, textTransform: 'uppercase' }}>
              Grocery Prices by state
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {linkedStates.map((state: string) => (
                <Link key={state} href={`/grocery-prices/${STATE_SLUGS[state.toLowerCase()]}`}
                  style={{
                    fontSize: 13, color: '#16a34a', textDecoration: 'none', fontWeight: 600,
                    padding: '4px 12px', background: 'rgba(239,68,68,0.08)',
                    border: '1px solid rgba(239,68,68,0.15)', borderRadius: 20,
                  }}>
                  {state.replace(/\b\w/g, l => l.toUpperCase())} →
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* End-of-article capture — YouTube always sits BELOW the CTA */}
        <ArticleEmailCapture placement="end" />

        {/* YouTube embed — relevant video for this article topic (always after CTA) */}
        {video && (
          <div style={{ marginTop: 40, marginBottom: 8 }}>
            <div style={{
              fontSize: 11, fontWeight: 700, color: '#475569',
              textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12,
            }}>
              📺 Related Video
            </div>
            <div style={{
              position: 'relative', width: '100%', paddingBottom: '56.25%',
              borderRadius: 12, overflow: 'hidden',
              background: '#000',
              border: '1px solid rgba(255,255,255,0.08)',
            }}>
              <iframe
                src={`https://www.youtube.com/embed/${video.videoId}?rel=0&modestbranding=1`}
                title={video.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{
                  position: 'absolute', top: 0, left: 0,
                  width: '100%', height: '100%',
                  border: 'none',
                }}
              />
            </div>
            <div style={{ marginTop: 8, fontSize: 12, color: '#475569' }}>
              {video.title} · <span style={{ color: '#334155' }}>{video.channelTitle}</span>
            </div>
          </div>
        )}

        {/* FAQ section */}
        {article.faqs && article.faqs.length > 0 && (
          <div style={{ marginTop: 40 }}>
            <h2 style={{
              fontSize: 20, fontWeight: 800, color: '#f8fafc',
              margin: '0 0 20px', letterSpacing: '-0.01em',
            }}>Frequently Asked Questions</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {article.faqs.map((faq, i) => (
                <div key={i} style={{
                  padding: '16px 18px',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10,
                }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9', marginBottom: 8 }}>
                    {faq.q}
                  </div>
                  <div style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.65 }}>{faq.a}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Source tweet */}
        <a href={article.source_tweet.url} target="_blank" rel="noopener noreferrer" style={{
          display: 'block', marginTop: 40, padding: '16px 18px',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)', borderLeft: '3px solid #1d9bf0',
          borderRadius: 10, textDecoration: 'none',
        }}>
          <div style={{ fontSize: 11, color: '#475569', marginBottom: 6, fontWeight: 700, letterSpacing: '0.06em' }}>SOURCE SIGNAL</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9' }}>{article.source_tweet.author}</span>
            <span style={{ fontSize: 13, color: '#475569' }}>@{article.source_tweet.username}</span>
          </div>
          <p style={{ margin: 0, fontSize: 14, color: '#94a3b8', lineHeight: 1.6 }}>{article.source_tweet.text}</p>
          <div style={{ fontSize: 12, color: '#1d9bf0', marginTop: 10, fontWeight: 600 }}>View on X →</div>
        </a>

        {/* Follow CTA — prominent, above share buttons */}
        <div style={{
          marginTop: 40, padding: '20px 24px',
          background: 'rgba(29,155,240,0.07)',
          border: '1px solid rgba(29,155,240,0.18)',
          borderRadius: 12,
          display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
        }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 3 }}>
              Get Grocery Price alerts daily
            </div>
            <div style={{ fontSize: 13, color: '#64748b' }}>
              We post price signals every day. Follow to stay ahead of the pump.
            </div>
          </div>
          <a
            href="https://twitter.com/intent/follow?screen_name=wtgbofficial"
            target="_blank" rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              background: '#1d9bf0', color: '#fff', fontSize: 13, fontWeight: 700,
              padding: '9px 20px', borderRadius: 20, textDecoration: 'none', whiteSpace: 'nowrap',
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.63L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/>
            </svg>
            Follow @wtgbofficial
          </a>
        </div>

        {/* Share + back */}
        <div style={{
          marginTop: 20, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: '#475569', textTransform: 'uppercase', marginBottom: 12 }}>
            Share this article
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            {/* X / Twitter */}
            <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.headline)}&url=${encodeURIComponent(articleUrl)}&via=wtgbofficial`}
              target="_blank" rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                background: '#000', color: '#fff', fontSize: 13, fontWeight: 600,
                padding: '8px 18px', borderRadius: 20, textDecoration: 'none',
                border: '1px solid rgba(255,255,255,0.12)',
              }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.63L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/>
              </svg>
              Post on X
            </a>

            {/* Facebook */}
            <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(articleUrl)}`}
              target="_blank" rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                background: '#1877f2', color: '#fff', fontSize: 13, fontWeight: 600,
                padding: '8px 18px', borderRadius: 20, textDecoration: 'none',
              }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Share on Facebook
            </a>

            {/* Reddit */}
            <a href={`https://www.reddit.com/submit?url=${encodeURIComponent(articleUrl)}&title=${encodeURIComponent(article.headline)}`}
              target="_blank" rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                background: '#ff4500', color: '#fff', fontSize: 13, fontWeight: 600,
                padding: '8px 18px', borderRadius: 20, textDecoration: 'none',
              }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
              </svg>
              Share on Reddit
            </a>

            <div style={{ flex: 1 }} />
            <Link href="/news" style={{ fontSize: 13, color: '#475569', textDecoration: 'none', fontWeight: 500 }}>
              ← All analysis
            </Link>
            <Link href="/" style={{ fontSize: 13, color: '#475569', textDecoration: 'none', fontWeight: 500 }}>
              ← Live prices
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
