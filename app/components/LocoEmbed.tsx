'use client'

import { useEffect } from 'react'

const PARTNER_ID = 'pub_rs2wayi1'
const SCRIPT_SRC = 'https://locotomato.com/embed.v1.js'

export default function LocoEmbed() {
  useEffect(() => {
    // Don't double-load
    if (document.querySelector(`script[data-partner="${PARTNER_ID}"]`)) return

    const script = document.createElement('script')
    script.src = SCRIPT_SRC
    script.setAttribute('data-partner', PARTNER_ID)
    script.async = true
    document.body.appendChild(script)

    return () => {
      // leave script in DOM — removing it mid-session breaks the widget
    }
  }, [])

  return <div data-loco-widget />
}
