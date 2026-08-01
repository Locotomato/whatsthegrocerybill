'use client'

import { useEffect, useRef } from 'react'

interface LocoTabZoneProps {
  partner: string
  campaign: string
  count?: number
}

export default function LocoTabZone({ partner, campaign, count = 6 }: LocoTabZoneProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return
    if (containerRef.current.querySelector('script[src*="taboola.js"]')) return

    const script = document.createElement('script')
    script.src = 'https://locotomato.com/taboola.js'
    script.setAttribute('data-partner', partner)
    script.setAttribute('data-campaign', campaign)
    script.setAttribute('data-count', String(count))
    script.async = true
    containerRef.current.appendChild(script)
  }, [partner, campaign, count])

  return <div ref={containerRef} style={{ margin: '32px 0' }} />
}
