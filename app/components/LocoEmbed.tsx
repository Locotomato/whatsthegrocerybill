// Renders a single target div with a stable unique ID.
// embed.v1.js mounts to this specific ID — no querySelectorAll, no ambiguity.
// campaignId prop supports future multi-unit placements with different campaigns.

interface Props {
  campaignId?: string
}

const DEFAULT_CAMPAIGN = 'cmp_8c54fcc7'

export default function LocoEmbed({ campaignId = DEFAULT_CAMPAIGN }: Props) {
  // ID is stable per campaign — embed.v1.js targets exactly this element
  const widgetId = `loco-widget-${campaignId}`
  return (
    <div
      id={widgetId}
      data-loco-widget
      data-campaign={campaignId}
      style={{ width: '100%' }}
    />
  )
}
