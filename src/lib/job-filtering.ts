export type JobFilterType = 'category' | 'employmentType' | 'workplaceType'

export function jobFilterKey(type: JobFilterType, value: string) {
  return `${type}:${value}`
}

export function parseJobFilterKey(key: string) {
  const separator = key.indexOf(':')
  if(separator === -1) return null

  const type = key.slice(0, separator)
  const value = key.slice(separator + 1)

  if(type !== 'category' && type !== 'employmentType' && type !== 'workplaceType') return null

  return { type: type as JobFilterType, value }
}

export function normalizeFilterOrder(filterOrder: string[], categories: string[], employmentTypes: string[], workplaceTypes: string[]) {
  const selected = [
    ...categories.map((value) => jobFilterKey('category', value)),
    ...workplaceTypes.map((value) => jobFilterKey('workplaceType', value)),
    ...employmentTypes.map((value) => jobFilterKey('employmentType', value)),
  ]

  const existing = filterOrder.filter((value, index) => selected.includes(value) && filterOrder.indexOf(value) === index)

  return [
    ...existing,
    ...selected.filter((value) => !existing.includes(value)),
  ]
}