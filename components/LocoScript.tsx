'use client'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

interface Props {
  theme?: string
  partner: string
  campaign: string
}

/**
 * Loads the Loco Tomato embed script globally, but skips:
 *   - / (homepage)
 *   - /authors and /authors/* (writer bio pages)
 *   - /privacy, /terms, /about, /contact (legal / info pages)
 */
const EXCLUDED_EXACT = ['/', '/privacy', '/terms', '/about', '/contact']
const EXCLUDED_PREFIXES = ['/authors']

export default function LocoScript({ partner, campaign, theme }: Props) {
  const pathname = usePathname()

  useEffect(() => {
    if (EXCLUDED_EXACT.includes(pathname)) return
    if (EXCLUDED_PREFIXES.some((p) => pathname.startsWith(p))) return
    if (document.querySelector('[data-loco-injected]')) return

    const script = document.createElement('script')
    script.src = 'https://locotomato.com/embed.v1.js'
    script.async = true
    script.setAttribute('data-partner', partner)
    script.setAttribute('data-campaign', campaign)
    if (theme) script.setAttribute('data-theme', theme)
    script.setAttribute('data-loco-injected', partner)
    document.body.appendChild(script)
  }, [pathname, partner, campaign])

  return null
}
