'use client'

import { useEffect, useRef } from 'react'

const PARTNER_ID  = 'pub_rs2wayi1'
const CAMPAIGN_ID = 'cmp_8c54fcc7'
const SCRIPT_SRC  = 'https://locotomato.com/embed.v1.js'

// Module-level flag: only ever mount one widget per page, regardless of how
// many <LocoEmbed /> instances are placed in JSX. The second+ instances
// render nothing — this prevents the double-widget bug.
let widgetMounted = false

export default function LocoEmbed() {
  const containerRef = useRef<HTMLDivElement>(null)
  const isOwner = useRef(false)

  useEffect(() => {
    // If a widget is already mounted on this page, this instance renders nothing
    if (widgetMounted) return
    widgetMounted = true
    isOwner.current = true

    const container = containerRef.current
    if (!container) return

    // Mark the container so embed.v1.js targets exactly this one div
    container.setAttribute('data-loco-widget', '')

    // Don't double-load the script
    if (!document.querySelector(`script[data-partner="${PARTNER_ID}"]`)) {
      const script = document.createElement('script')
      script.src = SCRIPT_SRC
      script.setAttribute('data-partner', PARTNER_ID)
      script.setAttribute('data-campaign', CAMPAIGN_ID)
      script.async = true
      document.body.appendChild(script)
    }

    return () => {
      // Reset flag on unmount so navigating away + back works
      if (isOwner.current) widgetMounted = false
    }
  }, [])

  // Non-owner instances render nothing
  if (typeof window !== 'undefined' && widgetMounted && !isOwner.current) {
    return null
  }

  return <div ref={containerRef} style={{ width: '100%' }} />
}
