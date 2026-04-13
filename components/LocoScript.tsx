'use client'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

interface Props {
  partner: string
  campaign: string
}

/**
 * Loads the Loco Tomato embed script globally, but skips:
 *   - / (homepage)
 *   - /authors and /authors/* (writer bio pages)
 */
const EXCLUDED_PATHS = ['/']
const EXCLUDED_PREFIXES = ['/authors']

export default function LocoScript({ partner, campaign }: Props) {
  const pathname = usePathname()

  useEffect(() => {
    if (EXCLUDED_PATHS.includes(pathname)) return
    if (EXCLUDED_PREFIXES.some((p) => pathname.startsWith(p))) return
    if (document.querySelector('[data-loco-injected]')) return

    const script = document.createElement('script')
    script.src = 'https://locotomato.com/embed.v1.js'
    script.async = true
    script.setAttribute('data-partner', partner)
    script.setAttribute('data-campaign', campaign)
    script.setAttribute('data-loco-injected', partner)
    document.body.appendChild(script)
  }, [pathname, partner, campaign])

  return null
}
