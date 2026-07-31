'use client'
import { useEffect, useRef } from 'react'

export default function LocoTabZone() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!ref.current || ref.current.querySelector('script')) return
    const s = document.createElement('script')
    s.src = 'https://locotomato.com/taboola.js'
    s.setAttribute('data-partner', 'pub_rs2wayi1')
    s.setAttribute('data-campaign', 'cmp_e0ef7110')
    s.setAttribute('data-count', '4')
    s.setAttribute('data-zone', 'end-of-article')
    s.async = true
    ref.current.appendChild(s)
  }, [])
  return <div ref={ref} style={{ margin: '32px 0' }} />
}
