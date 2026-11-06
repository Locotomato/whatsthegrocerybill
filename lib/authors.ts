// What's The Grocery Bill AI Writer
// Content on this site is written by an AI system and published automatically.
// Keep this byline clearly non-human. Never put a real person's name here.

export interface WTGBAuthor {
  slug: string; name: string; title: string; avatarUrl: string; avatarColor: string
  tagline: string; credential: string; bio: string; expertise: string[]; promptPersona: string
}

const EDITOR: WTGBAuthor = {
  slug: 'ai-writer',
  name: "What's The Grocery Bill AI Writer",
  title: 'AI Writer',
  avatarUrl: '',
  avatarColor: '#1a1a2e',
  tagline: "AI-written grocery price coverage",
  credential: "AI writing system, What's The Grocery Bill",
  bio: `What's The Grocery Bill AI Writer is the AI system that writes articles for What's The Grocery Bill. It drafts each piece from public news reports and data sources, and articles are published automatically, without a person reviewing each one before it goes live.

Articles can contain errors or go out of date, so confirm anything important with BLS and USDA. To report a mistake, see our Corrections page.`,
  expertise: [
    'BLS Consumer Price Index food category tracking',
    'Weekly supermarket price monitoring across major chains',
    'Grocery inflation trends across key categories',
    'USDA agricultural commodity and supply chain data',
    'Regional price variation and seasonal produce economics',
    'Household grocery budget strategies during inflation',
  ],
  promptPersona: `You are writing for What's The Grocery Bill. Write with data authority — cite actual BLS CPI and USDA data. Give shoppers concrete intelligence about price movements, supply chain disruptions, and practical budget strategies. Be specific, actionable, and always anchor to real dollars and cents. Never fabricate prices or statistics.`,
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
