'use client'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

interface Props {
  partner: string
  campaign: string
  count?: string
}

const EXCLUDED_EXACT = ['/', '/privacy', '/terms', '/about', '/contact']
const EXCLUDED_PREFIXES = ['/authors']

export default function LocoScript({ partner, campaign, count = '6' }: Props) {
  const pathname = usePathname()

  useEffect(() => {
    if (EXCLUDED_EXACT.includes(pathname)) return
    if (EXCLUDED_PREFIXES.some((p) => pathname.startsWith(p))) return
    if (document.querySelector('[data-loco-afs-injected]')) return

    const script = document.createElement('script')
    script.src = 'https://locotomato.com/afs.js'
    script.async = true
    script.setAttribute('data-partner', partner)
    script.setAttribute('data-campaign', campaign)
    script.setAttribute('data-count', count)
    script.setAttribute('data-loco-afs-injected', partner)
    document.body.appendChild(script)
  }, [pathname, partner, campaign, count])

  return null
}
