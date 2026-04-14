'use client'

import { useEffect, useRef } from 'react'

interface AfsUnitProps {
  partner: string
  campaign: string
  count?: number
}

export default function AfsUnit({ partner, campaign, count = 6 }: AfsUnitProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return
    
    // Check if script already exists
    const existingScript = document.querySelector('script[src="https://locotomato.com/afs.js"]')
    if (existingScript) return

    const script = document.createElement('script')
    script.src = 'https://locotomato.com/afs.js'
    script.setAttribute('data-partner', partner)
    script.setAttribute('data-campaign', campaign)
    script.setAttribute('data-count', String(count))
    script.async = true
    
    containerRef.current.appendChild(script)
  }, [partner, campaign, count])

  return <div ref={containerRef} id="loco-afs-container" style={{ margin: '32px 0' }} />
}
