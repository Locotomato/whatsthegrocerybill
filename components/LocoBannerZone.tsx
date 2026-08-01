'use client'

import { useEffect, useRef } from 'react'

interface LocoBannerZoneProps {
  partner: string
  campaign: string
  shape?: string
}

export default function LocoBannerZone({ partner, campaign, shape }: LocoBannerZoneProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return
    if (containerRef.current.querySelector('script[src*="banner.js"]')) return

    const script = document.createElement('script')
    script.src = 'https://locotomato.com/banner.js'
    script.setAttribute('data-partner', partner)
    script.setAttribute('data-campaign', campaign)
    if (shape) script.setAttribute('data-shape', shape)
    script.async = true
    containerRef.current.appendChild(script)
  }, [partner, campaign, shape])

  return <div ref={containerRef} style={{ margin: '32px 0' }} />
}
