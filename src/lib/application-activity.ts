export type ActivityApplication = {
  created_at: string
}

export type ActivityRange = '7d' | '30d' | '3m' | '12m' | 'all'
export const ACTIVITY_RANGE_COOKIE = 'cc-application-activity-range'
export const ACTIVITY_RANGES = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '3m', label: 'Last 3 months' },
  { value: '12m', label: 'Last 12 months' },
] as const

export function getPreferredActivityRange(value: unknown): ActivityRange {
  return ACTIVITY_RANGES.find(range => range.value === value)?.value ?? '7d'
}

export type ActivityGrouping = 'day' | 'week' | 'month'
export type ActivityBucket = { start: string; end: string; count: number }
export type ActivitySeries = { grouping: ActivityGrouping; buckets: ActivityBucket[] }
export type ApplicationActivity = {
  total: number
  thisWeek: number
  thisMonth: number
  series: Record<ActivityRange, ActivitySeries>
}

export function getActivityAxisLabels({ buckets, grouping }: ActivitySeries, width = 320) {
  if (buckets.length === 0) return []
  const shortDailyRange = grouping === 'day' && buckets.length <= 7
  const capacity = Math.max(2, Math.min(5, Math.floor(width / 58)))
  const lastIndex = buckets.length - 1
  const crossesYear = new Date(buckets[0].start).getUTCFullYear() !== new Date(buckets[lastIndex].start).getUTCFullYear()
  const monthLabel = (date: Date) => `${date.toLocaleDateString('en-CA', { month: 'short', timeZone: 'UTC' })}${crossesYear ? `\n${date.getUTCFullYear()}` : ''}`

  // Weekly bars stay weekly; month ticks mark the actual calendar boundaries
  // inside those bars instead of displaying arbitrary week-start dates.
  if (grouping === 'week') {
    const labels = []
    let month = startOfMonth(new Date(buckets[0].start))
    const end = new Date(buckets[lastIndex].end)
    while (month <= end) {
      const date = month.toISOString()
      const index = buckets.findIndex(bucket => bucket.start <= date && bucket.end >= date)
      if (index >= 0) {
        const bucket = buckets[index]
        const duration = new Date(bucket.end).getTime() - new Date(bucket.start).getTime() + ONE_DAY_MS
        labels.push({ index, date, position: (month.getTime() - new Date(bucket.start).getTime()) / duration, label: monthLabel(month) })
      }
      month = startOfMonth(month, 1)
    }
    return labels
  }

  let indices: number[]
  if (shortDailyRange) {
    indices = buckets.map((_, index) => index)
  } else if (grouping === 'day') {
    // A thirty-day chart marks calendar weeks, not ten-day offsets from today.
    const mondays = buckets.flatMap((bucket, index) => new Date(bucket.start).getUTCDay() === 1 ? [index] : [])
    const count = Math.min(capacity, mondays.length)
    indices = Array.from({ length: count }, (_, index) => mondays[Math.round(index * (mondays.length - 1) / Math.max(count - 1, 1))])
  } else {
    const stride = Math.max(1, Math.ceil(lastIndex / (capacity - 1)))
    indices = Array.from({ length: Math.floor(lastIndex / stride) + 1 }, (_, index) => index * stride)
    if (indices.at(-1) !== lastIndex) {
      if (lastIndex - indices[indices.length - 1] < stride * 0.6 && indices.length > 1) indices.pop()
      indices.push(lastIndex)
    }
  }

  return indices.map((index) => {
    const date = new Date(buckets[index].start)
    const month = date.toLocaleDateString('en-CA', { month: 'short', timeZone: 'UTC' })
    return {
      index,
      date: buckets[index].start,
      position: 0.5,
      label: shortDailyRange
        ? date.toLocaleDateString('en-CA', { weekday: 'narrow', timeZone: 'UTC' })
        : grouping === 'month' ? monthLabel(date) : `${month}\n${date.getUTCDate()}`,
    }
  })
}

const ONE_DAY_MS = 24 * 60 * 60 * 1000

function startOfDay(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
}

function startOfWeek(date: Date) {
  const start = startOfDay(date)
  start.setUTCDate(start.getUTCDate() - (start.getUTCDay() + 6) % 7)
  return start
}

function startOfMonth(date: Date, offset = 0) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + offset, 1))
}

export function getApplicationActivity(
  applications: ActivityApplication[],
  now = new Date()
): ApplicationActivity {
  const today = startOfDay(now)
  const tomorrow = new Date(today.getTime() + ONE_DAY_MS)
  const dates = applications.map(({ created_at }) => new Date(created_at))
    .filter((date) => !Number.isNaN(date.getTime()) && date <= now)

  function group(start: Date, grouping: ActivityGrouping): ActivitySeries {
    const bucketStart = grouping === 'month' ? startOfMonth : grouping === 'week' ? startOfWeek : startOfDay
    const counts = new Map<string, number>()
    for (const date of dates) {
      if (date < start) continue
      const key = bucketStart(date).toISOString()
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }

    const buckets: ActivityBucket[] = []
    let cursor = bucketStart(start)
    while (cursor < tomorrow) {
      const next = grouping === 'month'
        ? startOfMonth(cursor, 1)
        : new Date(cursor.getTime() + ONE_DAY_MS * (grouping === 'week' ? 7 : 1))
      buckets.push({
        // Clip partial periods so labels match the dates actually counted.
        start: new Date(Math.max(cursor.getTime(), start.getTime())).toISOString(),
        end: new Date(Math.min(next.getTime(), tomorrow.getTime()) - ONE_DAY_MS).toISOString(),
        count: counts.get(cursor.toISOString()) ?? 0,
      })
      cursor = next
    }
    return { grouping, buckets }
  }

  const earliest = dates.reduce((first, date) => date < first ? date : first, today)
  return {
    total: dates.length,
    thisWeek: dates.filter((date) => date >= startOfWeek(today)).length,
    thisMonth: dates.filter((date) => date >= startOfMonth(today)).length,
    series: {
      '7d': group(new Date(today.getTime() - 6 * ONE_DAY_MS), 'day'),
      '30d': group(new Date(today.getTime() - 29 * ONE_DAY_MS), 'day'),
      '3m': group(startOfMonth(today, -2), 'week'),
      '12m': group(startOfMonth(today, -11), 'month'),
      all: group(startOfMonth(earliest), 'month'),
    },
  }
}
