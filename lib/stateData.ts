export const STATE_ABBR: Record<string, string> = {
  'alabama':'AL','alaska':'AK','arizona':'AZ','arkansas':'AR','california':'CA',
  'colorado':'CO','connecticut':'CT','delaware':'DE','florida':'FL','georgia':'GA',
  'hawaii':'HI','idaho':'ID','illinois':'IL','indiana':'IN','iowa':'IA',
  'kansas':'KS','kentucky':'KY','louisiana':'LA','maine':'ME','maryland':'MD',
  'massachusetts':'MA','michigan':'MI','minnesota':'MN','mississippi':'MS',
  'missouri':'MO','montana':'MT','nebraska':'NE','nevada':'NV','new-hampshire':'NH',
  'new-jersey':'NJ','new-mexico':'NM','new-york':'NY','north-carolina':'NC',
  'north-dakota':'ND','ohio':'OH','oklahoma':'OK','oregon':'OR','pennsylvania':'PA',
  'rhode-island':'RI','south-carolina':'SC','south-dakota':'SD','tennessee':'TN',
  'texas':'TX','utah':'UT','vermont':'VT','virginia':'VA','washington':'WA',
  'west-virginia':'WV','wisconsin':'WI','wyoming':'WY',
}

export const ABBR_TO_NAME: Record<string, string> = Object.fromEntries(
  Object.entries(STATE_ABBR).map(([name, abbr]) => [abbr, toTitleCase(name)])
)

export function toTitleCase(slug: string) {
  return slug.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ')
}

export function slugToAbbr(slug: string): string | null {
  return STATE_ABBR[slug.toLowerCase()] ?? null
}

export const ALL_STATE_SLUGS = Object.keys(STATE_ABBR)
