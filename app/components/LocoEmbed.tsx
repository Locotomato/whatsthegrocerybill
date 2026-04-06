'use client'

import { useEffect, useRef } from 'react'

const PARTNER_ID  = 'pub_rs2wayi1'
const CAMPAIGN_ID = 'cmp_8c54fcc7'
const SCRIPT_SRC  = 'https://locotomato.com/embed.v1.js'

interface Props {
  campaignId?: string  // override for future multi-campaign placements
}

export default function LocoEmbed({ campaignId = CAMPAIGN_ID }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Stamp campaign ID on container — embed.v1.js deduplicates by campaign ID.
    // Same campaign rendered twice = one widget. Different campaigns = each mounts.
    container.setAttribute('data-loco-widget', '')
    container.setAttribute('data-campaign', campaignId)

    // Load embed script once per page (dedup by partner attr)
    if (!document.querySelector(`script[data-partner="${PARTNER_ID}"]`)) {
      const script = document.createElement('script')
      script.src = SCRIPT_SRC
      script.setAttribute('data-partner', PARTNER_ID)
      script.setAttribute('data-campaign', campaignId)
      script.async = true
      document.body.appendChild(script)
    }
  }, [campaignId])

  return <div ref={containerRef} style={{ width: '100%' }} />
}
