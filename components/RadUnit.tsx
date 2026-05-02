'use client'
import { useEffect, useRef } from 'react'

export default function RadUnit() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return
    // Remove any existing script to avoid duplicates
    const existing = containerRef.current.querySelector('script[src*="rad.js"]')
    if (existing) return

    const script = document.createElement('script')
    script.src = 'https://locotomato.com/rad.js'
    script.setAttribute('data-partner', 'pub_rs2wayi1')
    script.setAttribute('data-campaign', 'cmp_8c54fcc7')
    script.setAttribute('data-count', '6')
    script.async = true
    containerRef.current.appendChild(script)
  }, [])

  return <div ref={containerRef} style={{ margin: '32px 0' }} />
}
