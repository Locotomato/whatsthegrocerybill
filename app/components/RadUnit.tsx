'use client'

import { useEffect, useRef } from 'react'

interface RadUnitProps {
  partner: string
  campaign: string
  count?: number
  zone?: string
}

export default function RadUnit({ partner, campaign, count = 6, zone }: RadUnitProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const zoneId = zone || `rad-${Math.random().toString(36).substring(2, 8)}`

  useEffect(() => {
    if (!containerRef.current) return

    // Check if this zone already has an iframe
    if (containerRef.current.querySelector('iframe')) return

    const script = document.createElement('script')
    script.src = 'https://locotomato.com/rad.js'
    script.setAttribute('data-partner', partner)
    script.setAttribute('data-campaign', campaign)
    script.setAttribute('data-count', String(count))
    script.setAttribute('data-zone', zoneId)
    script.async = true

    containerRef.current.appendChild(script)
  }, [partner, campaign, count, zoneId])

  return <div ref={containerRef} id={`loco-rad-${zoneId}`} data-zone={zoneId} style={{ margin: '32px 0' }} />
}
