'use client'
import { useEffect, useRef } from 'react'

export default function LocoBannerZone({ campaign, zone }: { campaign: string; zone: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!ref.current || ref.current.querySelector('script')) return
    const s = document.createElement('script')
    s.src = 'https://locotomato.com/banner.js'
    s.setAttribute('data-partner', 'pub_rs2wayi1')
    s.setAttribute('data-campaign', campaign)
    s.setAttribute('data-shape', 'horizontal')
    s.setAttribute('data-zone', zone)
    s.async = true
    ref.current.appendChild(s)
  }, [])
  return <div ref={ref} style={{ margin: '32px 0' }} />
}
