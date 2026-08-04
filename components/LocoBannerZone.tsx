'use client'

import { useEffect, useRef } from 'react'

export default function LocoBannerZone() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return
    if (containerRef.current.querySelector('script[src*="banner.js"]')) return

    const script = document.createElement('script')
    script.src = 'https://locotomato.com/banner.js'
    script.setAttribute('data-partner', 'pub_rs2wayi1')
    script.setAttribute('data-campaign', 'cmp_afc21e11')
    script.setAttribute('data-shape', 'horizontal')
    script.async = true
    containerRef.current.appendChild(script)
  }, [])

  return <div ref={containerRef} style={{ margin: '32px 0' }} />
}
