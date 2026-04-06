// Pure static div — embed.v1.js is loaded once in layout.tsx and handles
// all widget mounting. It deduplicates by campaign ID, so placing this
// component multiple times is safe — only the first instance per campaign mounts.
// No useEffect, no script injection, no race conditions.

interface Props {
  campaignId?: string
}

export default function LocoEmbed({ campaignId = 'cmp_8c54fcc7' }: Props) {
  return (
    <div
      data-loco-widget
      data-campaign={campaignId}
      style={{ width: '100%' }}
    />
  )
}
