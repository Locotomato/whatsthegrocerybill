// Pure static div — embed.v1.js mounts widget here.
// formTitle is passed as data-form-title so the widget sends it as form_title
// to /api/leads, enabling per-topic guide generation and delivery.

interface Props {
  campaignId?: string
  formTitle?: string
}

const DEFAULT_CAMPAIGN  = 'cmp_8c54fcc7'
const DEFAULT_FORMTITLE = 'Get Your Free Grocery Savings Guide'

export default function LocoEmbed({
  campaignId = DEFAULT_CAMPAIGN,
  formTitle  = DEFAULT_FORMTITLE,
}: Props) {
  const widgetId = `loco-widget-${campaignId}`
  return (
    <div
      id={widgetId}
      data-loco-widget
      data-campaign={campaignId}
      data-form-title={formTitle}
      style={{ width: '100%', marginBottom: 48 }}
    />
  )
}
