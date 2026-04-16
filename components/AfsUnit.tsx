'use client'
import { useEffect, useRef } from 'react'

export default function AfsUnit() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return
    // Remove any existing script to avoid duplicates
    const existing = containerRef.current.querySelector('script[src*="afs.js"]')
    if (existing) return

    const script = document.createElement('script')
    script.src = 'https://locotomato.com/afs.js'
    script.setAttribute('data-partner', 'pub_rs2wayi1')
    script.setAttribute('data-campaign', 'cmp_db18b9c4')
    script.setAttribute('data-count', '6')
    script.async = true
    containerRef.current.appendChild(script)
  }, [])

  return <div ref={containerRef} style={{ margin: '32px 0' }} />
}
