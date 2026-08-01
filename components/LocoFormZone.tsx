'use client'

import { useEffect, useRef } from 'react'

interface LocoFormZoneProps {
  partner: string
  campaign: string
  theme?: string
}

export default function LocoFormZone({ partner, campaign, theme }: LocoFormZoneProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return
    if (containerRef.current.querySelector('script[src*="embed.v1.js"]')) return

    const script = document.createElement('script')
    script.src = 'https://locotomato.com/embed.v1.js'
    script.setAttribute('data-partner', partner)
    script.setAttribute('data-campaign', campaign)
    if (theme) script.setAttribute('data-theme', theme)
    script.async = true
    containerRef.current.appendChild(script)
  }, [partner, campaign, theme])

  return <div ref={containerRef} style={{ margin: '32px 0' }} />
}
