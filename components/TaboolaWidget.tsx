'use client'

import { useEffect } from 'react'

type TaboolaPlacement = 'mid-article' | 'article-feed' | 'right-rail'

const TABOOLA_CONFIG: Record<TaboolaPlacement, { mode: string; container: string; placement: string }> = {
  'mid-article': {
    mode: 'thumbnails-mid-a',
    container: 'taboola-mid-article-thumbnails',
    placement: 'Mid Article Thumbnails',
  },
  'article-feed': {
    mode: 'alternating-thumbnails-a',
    container: 'taboola-article-feed',
    placement: 'Article-Feed',
  },
  'right-rail': {
    mode: 'thumbnails-a-right-rail',
    container: 'taboola-right-rail',
    placement: 'Right Rail',
  },
}

export default function TaboolaWidget({ type }: { type: TaboolaPlacement }) {
  const config = TABOOLA_CONFIG[type]

  useEffect(() => {
    const w = window as unknown as { _taboola: Record<string, unknown>[] }
    w._taboola = w._taboola || []
    w._taboola.push({
      mode: config.mode,
      container: config.container,
      placement: config.placement,
      target_type: 'mix',
    })
  }, [config.mode, config.container, config.placement])

  return <div id={config.container} />
}
