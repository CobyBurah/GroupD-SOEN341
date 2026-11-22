// Pure search helpers shared by the server query and the location suggestions.
export function normalizeSearchText(value: string): string {
  return value.trim().replace(/\s+/g, ' ')
}

export function escapeLikePattern(value: string): string {
  return value.replace(/[\\%_]/g, '\\$&')
}

export function escapeRegexPattern(value: string): string {
  return value.replace(/[$.*+?^{}()|[\]\\]/g, '\\$&')
}

export function locationWordPatterns(value: string): string[] {
  const terms = normalizeSearchText(value).split(' ').filter(Boolean)
  // Keep single-term substring matching. Multiple terms must start location
  // words, so "New York" cannot accidentally match "NewYork".
  return terms.length > 1
    ? terms.map(term => '(^|[\\s,;:/().-])' + escapeRegexPattern(term))
    : []
}

export function getLocationSuggestions(options: string[], value: string): string[] {
  const search = normalizeSearchText(value).toLowerCase()
  const patterns = locationWordPatterns(search).map(pattern => new RegExp(pattern, 'iu'))
  return options
    .filter(option => option.toLowerCase().includes(search) ||
      (patterns.length > 0 && patterns.every(pattern => pattern.test(option))))
    .sort((a, b) => Number(b.toLowerCase().startsWith(search)) - Number(a.toLowerCase().startsWith(search)))
    .slice(0, 8)
}
