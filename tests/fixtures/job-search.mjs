// The subset of PostgREST's OR grammar used by job keyword searches.
// Commas inside quoted values do not separate conditions; \" and \\ are decoded once.
export function parseJobSearchFilter(filter) {
  if (!filter.startsWith('(') || !filter.endsWith(')')) throw new Error('Invalid OR filter')
  const conditions = []
  let start = 1
  let quoted = false
  let escaped = false
  let depth = 0
  for (let index = 1; index < filter.length - 1; index++) {
    const character = filter[index]
    if (escaped) escaped = false
    else if (quoted && character === '\\') escaped = true
    else if (character === '"') quoted = !quoted
    else if (!quoted && character === '(') depth++
    else if (!quoted && character === ')') depth--
    else if (!quoted && depth === 0 && character === ',') {
      conditions.push(filter.slice(start, index))
      start = index + 1
    }
  }
  if (quoted || escaped || depth !== 0) throw new Error('Unterminated filter')
  conditions.push(filter.slice(start, -1))
  return conditions.map(condition => {
    const list = /^([a-z_]+)\.in\.\(([a-z_,]+)\)$/.exec(condition)
    if (list) return { column: list[1], operator: 'in', values: list[2].split(',') }
    const match = /^([a-z_]+)\.(ilike|imatch)\.("(?:[^"\\]|\\.)*"|[^",]*)$/.exec(condition)
    if (!match) throw new Error('Invalid keyword condition')
    return { column: match[1], operator: match[2], pattern: match[3].startsWith('"') ? JSON.parse(match[3]) : match[3] }
  })
}

export function matchesJobSearch(value, { operator, pattern, values }) {
  if (value === null || value === undefined) return false
  if (operator === 'in') return values.includes(value)
  return operator === 'imatch' ? new RegExp(pattern, 'iu').test(value) : matchesLike(value, pattern)
}

// Match SQL LIKE escapes separately from PostgREST's quoted-value escapes.
export function matchesLike(value, pattern) {
  if (value === null || value === undefined) return false
  let expression = '^'
  const literal = character => character.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  for (let index = 0; index < pattern.length; index++) {
    const character = pattern[index]
    if (character === '\\') {
      if (++index === pattern.length) throw new Error('LIKE pattern ends with an escape')
      expression += literal(pattern[index])
    } else if (character === '%' || character === '*') expression += '[\\s\\S]*'
    else if (character === '_') expression += '[\\s\\S]'
    else expression += literal(character)
  }
  return new RegExp(expression + '$', 'iu').test(value)
}
