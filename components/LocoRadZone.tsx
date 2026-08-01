'use client'

import { useEffect, useRef } from 'react'

interface LocoRadZoneProps {
  partner: string
  campaign: string
  count?: number
}

export default function LocoRadZone({ partner, campaign, count = 4 }: LocoRadZoneProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return
    if (containerRef.current.querySelector('script[src*="rad.js"]')) return

    const script = document.createElement('script')
    script.src = 'https://locotomato.com/rad.js'
    script.setAttribute('data-partner', partner)
    script.setAttribute('data-campaign', campaign)
    script.setAttribute('data-count', String(count))
    script.async = true
    containerRef.current.appendChild(script)
  }, [partner, campaign, count])

  return <div ref={containerRef} style={{ margin: '32px 0' }} />
}
