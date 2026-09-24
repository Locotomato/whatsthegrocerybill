/**
 * Injects PubGuru ad units into article HTML content between paragraphs.
 *
 * Placement strategy (Google best practices — 3+ paragraphs between ads):
 *   After paragraph 3  → whatsthegrocerybill_in-content1
 *   After paragraph 6  → whatsthegrocerybill_in-content2
 *   After paragraph 9  → whatsthegrocerybill_in-content3
 *   Every 3 paragraphs after that → whatsthegrocerybill_in-content3 (repeating)
 */

const AD_MARKUP = (slot: string) =>
  `<div class="pubguru-ad-slot" style="min-height:90px;margin:1.5rem 0;"><pubguru data-pg-ad="${slot}"></pubguru></div>`

export function injectPubGuruAds(html: string): string {
  if (!html) return html

  let pCount = 0

  return html.replace(/<\/p>/gi, (match) => {
    pCount++

    if (pCount === 3) {
      return match + AD_MARKUP('whatsthegrocerybill_in-content1')
    }
    if (pCount === 6) {
      return match + AD_MARKUP('whatsthegrocerybill_in-content2')
    }
    if (pCount >= 9 && (pCount - 9) % 3 === 0) {
      return match + AD_MARKUP('whatsthegrocerybill_in-content3')
    }

    return match
  })
}
