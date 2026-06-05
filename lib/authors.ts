// ── What's The Grocery Bill — Named Editor ────────────────────────────────────
// Content is produced using AI-assisted drafting tools under the editorial
// oversight of a named, real editor. All articles are reviewed for accuracy
// and editorial standards before publication.

export interface WTGBAuthor {
  slug: string; name: string; title: string; avatarUrl: string; avatarColor: string
  tagline: string; credential: string; bio: string; expertise: string[]; promptPersona: string
}

const EDITOR: WTGBAuthor = {
  slug: 'michael-spitaleri',
  name: 'Michael Spitaleri',
  title: 'Editor-in-Chief',
  avatarUrl: '',
  avatarColor: '#1a1a2e',
  tagline: 'Founder & Editor-in-Chief — tracking every price move that hits your grocery bill',
  credential: 'Founder & Editor-in-Chief, What\'s The Grocery Bill',
  bio: `Michael Spitaleri is the founder and editor-in-chief of What's The Grocery Bill. He oversees all editorial content on the site, ensuring every article is grounded in real BLS, USDA, and market data before publication.

What's The Grocery Bill uses AI-assisted drafting tools as part of its editorial workflow. All content is reviewed, fact-checked against official government data sources, and approved under Michael's editorial direction. This transparent approach allows the site to cover grocery price movements, supply chain disruptions, and household budget strategies at the speed readers need — while maintaining the editorial accountability of a named, real editor.`,
  expertise: [
    'BLS Consumer Price Index food category tracking',
    'Weekly supermarket price monitoring across major chains',
    'Grocery inflation trends across key categories',
    'USDA agricultural commodity and supply chain data',
    'Regional price variation and seasonal produce economics',
    'Household grocery budget strategies during inflation',
  ],
  promptPersona: `You are writing for What's The Grocery Bill under the editorial direction of Michael Spitaleri. Write with data authority — cite actual BLS CPI and USDA data. Give shoppers concrete intelligence about price movements, supply chain disruptions, and practical budget strategies. Be specific, actionable, and always anchor to real dollars and cents. Never fabricate prices or statistics.`,
}

export const AUTHORS: WTGBAuthor[] = [EDITOR]

/** Returns the site editor. Params kept for backward compatibility. */
export function pickAuthor(_direction?: string, _signalText?: string): WTGBAuthor {
  return EDITOR
}

export function findAuthor(_name?: string): WTGBAuthor {
  return EDITOR
}

export function findAuthorBySlug(_slug?: string): WTGBAuthor {
  return EDITOR
}
