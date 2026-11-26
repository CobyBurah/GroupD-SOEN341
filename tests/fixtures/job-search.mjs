// The subset of PostgREST's logical filter grammar used by job searches.
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
    const group = /^(and|or)(\(.*\))$/s.exec(condition)
    if (group) return { operator: group[1], conditions: parseJobSearchFilter(group[2]) }
    const list = /^([a-z_]+)\.in\.\(([a-z_,]+)\)$/.exec(condition)
    if (list) return { column: list[1], operator: 'in', values: list[2].split(',') }
    // Open-deadline filter: application_deadline.is.null / application_deadline.gte.YYYY-MM-DD.
    if (/^[a-z_]+\.is\.null$/.test(condition)) return { column: condition.split('.')[0], operator: 'is', pattern: null }
    const date = /^([a-z_]+)\.gte\.(\d{4}-\d{2}-\d{2})$/.exec(condition)
    if (date) return { column: date[1], operator: 'gte', pattern: date[2] }
    const match = /^([a-z_]+)\.(ilike|imatch)\.("(?:[^"\\]|\\.)*"|[^",]*)$/.exec(condition)
    if (!match) throw new Error('Invalid keyword condition')
    return { column: match[1], operator: match[2], pattern: match[3].startsWith('"') ? JSON.parse(match[3]) : match[3] }
  })
}

export function matchesJobSearchFilter(row, conditions, operator = 'or') {
  const match = condition => condition.conditions
    ? matchesJobSearchFilter(row, condition.conditions, condition.operator)
    : matchesJobSearch(row[condition.column], condition)
  return operator === 'and' ? conditions.every(match) : conditions.some(match)
}

export function matchesJobSearch(value, { operator, pattern, values }) {
  if (operator === 'is') return value === null || value === undefined
  if (value === null || value === undefined) return false
  if (operator === 'gte') return value >= pattern
  if (operator === 'in') return values.includes(value)
  return operator === 'imatch' ? matchesLiteralImatch(value, pattern) : matchesLike(value, pattern)
}

// Production emits escaped literals, optionally preceded by this fixed location
// word boundary. Interpret only that subset; never execute a request's regex.
function matchesLiteralImatch(value, pattern) {
  const prefix = '(^|[\\s,;:/().-])'
  const wordPrefix = pattern.startsWith(prefix)
  const body = wordPrefix ? pattern.slice(prefix.length) : pattern
  const metacharacters = '$.*+?^{}()|[]\\'
  let literal = ''
  for (let index = 0; index < body.length; index++) {
    const character = body[index]
    if (character === '\\') {
      const escaped = body[++index]
      if (!escaped || !metacharacters.includes(escaped)) throw new Error('Unsupported imatch pattern')
      literal += escaped
    } else {
      if (metacharacters.includes(character)) throw new Error('Unsupported imatch pattern')
      literal += character
    }
  }
  const text = value.toLowerCase()
  const search = literal.toLowerCase()
  if (!wordPrefix) return text.includes(search)
  for (let index = text.indexOf(search); index !== -1; index = text.indexOf(search, index + 1)) {
    if (index === 0 || /[\s,;:/().-]/u.test(text[index - 1])) return true
  }
  return false
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
