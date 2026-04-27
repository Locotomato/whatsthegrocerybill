/**
 * WTGB Writer Agents
 * Three distinct editorial personalities that sign articles on whatsthegrocerybill.com.
 * Each has a name, title, short bio, and a style note used by the article generator.
 */

export interface Writer {
  id: string
  name: string
  title: string
  bio: string
  /** Short style instruction injected into the generation prompt */
  styleNote: string
  /** Initials for avatar fallback */
  initials: string
  /** Color for avatar background */
  color: string
}

export const WRITERS: Writer[] = [
  {
    id: 'carmen-reyes',
    name: 'Carmen Reyes',
    title: 'Consumer Economics Reporter',
    bio: 'Carmen tracks how national food supply shifts and inflation data land on real family grocery bills. She writes with empathy and specificity — always anchoring to actual dollars and cents.',
    styleNote: "Write from the family budget perspective. Connect macro food market events directly to what shoppers feel at checkout. Tone is empathetic, specific, and actionable — always end with what readers should actually do.",
    initials: 'CR',
    color: '#2d5016',
  },
  {
    id: 'jordan-holt',
    name: 'Jordan Holt',
    title: 'Food Supply Chain Analyst',
    bio: 'Jordan covers the upstream: farm-gate prices, USDA data, trade flows, and how disruptions ripple to store shelves. Data-first, always clear about what is known vs. projected.',
    styleNote: "Write with data authority. Lead with USDA figures, supply chain specifics, and category-level price moves. Tone is Bloomberg meets the grocery aisle — authoritative and clear about uncertainty.",
    initials: 'JH',
    color: '#5c3d1e',
  },
  {
    id: 'priya-nair',
    name: 'Priya Nair',
    title: 'Household Finance Writer',
    bio: 'Priya translates food market news into practical household decisions — what to buy, when to stock up, and how to protect a grocery budget in any market condition.',
    styleNote: "Write for the budget-conscious reader. Translate supply and price signals into concrete shopping decisions. Tone is Consumer Reports meets your smart friend — practical, warm, and never condescending.",
    initials: 'PN',
    color: '#1e3a5c',
  },
]

/** Deterministic writer assignment — same signal always gets same writer */
export function assignWriter(signalId: string): Writer {
  // Simple hash: sum char codes mod 3
  const hash = signalId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return WRITERS[hash % WRITERS.length]
}

export function getWriter(writerId: string): Writer {
  return WRITERS.find(w => w.id === writerId) ?? WRITERS[0]
}
