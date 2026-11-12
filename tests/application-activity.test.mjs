import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import ts from 'typescript'

let source = await readFile(new URL('../src/lib/application-activity.ts', import.meta.url), 'utf8')

const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText

const { getApplicationActivity, getActivityAxisLabels } = await import(
  `data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`
)

const now = new Date('2026-11-11T12:00:00Z')
const applicationsOn = (...dates) => dates.map(created_at => ({ created_at }))
const count = series => series.buckets.reduce((total, bucket) => total + bucket.count, 0)

test('calculates total, current Monday-based week and current month', () => {
  const activity = getApplicationActivity(applicationsOn(
    '2026-11-10T10:00:00Z', '2026-11-09T00:00:00Z',
    '2026-11-08T23:59:59Z', '2026-10-12T14:00:00Z',
  ), now)
  assert.equal(activity.total, 4)
  assert.equal(activity.thisWeek, 2)
  assert.equal(activity.thisMonth, 3)
})

test('daily ranges include today and retain zero days at UTC boundaries', () => {
  const { series } = getApplicationActivity(applicationsOn(
    '2026-11-04T23:59:59Z', '2026-11-05T00:00:00Z',
    '2026-11-10T23:59:59Z', '2026-11-11T00:00:00Z',
  ), now)
  assert.equal(series['7d'].grouping, 'day')
  assert.equal(series['7d'].buckets.length, 7)
  assert.deepEqual(series['7d'].buckets.map(bucket => bucket.count), [1, 0, 0, 0, 0, 1, 1])
  assert.equal(series['30d'].buckets.length, 30)
  assert.equal(series['30d'].buckets[0].start, '2026-10-13T00:00:00.000Z')
  assert.equal(count(series['30d']), 4)
})

test('three calendar months use Monday-based buckets with clipped partial weeks', () => {
  const { series } = getApplicationActivity(applicationsOn(
    '2026-08-31T23:59:59Z', '2026-09-01T00:00:00Z',
    '2026-09-06T23:59:59Z', '2026-09-07T00:00:00Z',
    '2026-11-09T00:00:00Z',
  ), now)
  const weekly = series['3m']
  assert.equal(weekly.grouping, 'week')
  assert.equal(weekly.buckets[0].start, '2026-09-01T00:00:00.000Z')
  assert.equal(weekly.buckets[0].end, '2026-09-06T00:00:00.000Z')
  assert.equal(weekly.buckets[0].count, 2)
  assert.equal(weekly.buckets[1].count, 1)
  assert.equal(weekly.buckets.at(-1).end, '2026-11-11T00:00:00.000Z')
  assert.equal(count(weekly), 4)
})

test('twelve-month range crosses years and excludes older submissions', () => {
  const { series } = getApplicationActivity(applicationsOn(
    '2025-11-30T23:59:59Z', '2025-12-01T00:00:00Z',
    '2026-01-01T00:00:00Z', '2026-11-10T00:00:00Z',
  ), now)
  const monthly = series['12m']
  assert.equal(monthly.grouping, 'month')
  assert.equal(monthly.buckets.length, 12)
  assert.equal(monthly.buckets[0].start, '2025-12-01T00:00:00.000Z')
  assert.equal(monthly.buckets[0].end, '2025-12-31T00:00:00.000Z')
  assert.equal(count(monthly), 3)
  assert.equal(count(series.all), 4)
})

test('monthly buckets handle leap days and retain empty months in all time', () => {
  const { series } = getApplicationActivity(applicationsOn(
    '2024-01-31T23:59:59Z', '2024-02-29T00:00:00Z', '2024-04-01T00:00:00Z',
  ), new Date('2024-04-05T12:00:00Z'))
  assert.deepEqual(series.all.buckets.map(bucket => bucket.count), [1, 1, 0, 1])
  assert.equal(series.all.buckets[1].end, '2024-02-29T00:00:00.000Z')
  assert.equal(series.all.buckets.at(-1).end, '2024-04-05T00:00:00.000Z')
})

test('empty activity has zero metrics and zero-filled series for every range', () => {
  const activity = getApplicationActivity([], now)
  assert.equal(activity.total, 0)
  assert.equal(activity.thisWeek, 0)
  assert.equal(activity.thisMonth, 0)
  for (const series of Object.values(activity.series)) {
    assert.ok(series.buckets.length > 0)
    assert.ok(series.buckets.every(bucket => bucket.count === 0))
  }
  assert.equal(activity.series.all.buckets.length, 1)
})

test('invalid and future dates do not contribute to metrics or chart buckets', () => {
  const activity = getApplicationActivity(applicationsOn(
    'invalid', '2026-11-11T13:00:00Z', '2027-01-01T00:00:00Z', '2026-11-11T11:00:00Z',
  ), now)
  assert.equal(activity.total, 1)
  assert.equal(activity.thisWeek, 1)
  assert.equal(activity.thisMonth, 1)
  for (const series of Object.values(activity.series)) assert.equal(count(series), 1)
})


test('axis ticks represent actual dates inside their application buckets', () => {
  const { series } = getApplicationActivity([], now)
  for (const range of Object.values(series)) {
    const labels = getActivityAxisLabels(range)
    assert.equal(new Set(labels.map(label => label.date)).size, labels.length)
    for (const label of labels) {
      const bucket = range.buckets[label.index]
      assert.ok(label.date >= bucket.start && label.date <= bucket.end)
      assert.ok(label.position >= 0 && label.position <= 1)
    }
  }
})

test('thirty-day labels use calendar Mondays and thin them on narrow charts', () => {
  const { series } = getApplicationActivity([], now)
  const normal = getActivityAxisLabels(series['30d'])
  assert.deepEqual(normal.map(label => label.label), ['Oct\n19', 'Oct\n26', 'Nov\n2', 'Nov\n9'])
  const narrow = getActivityAxisLabels(series['30d'], 190)
  assert.equal(narrow.length, 3)
  for (const tick of [...normal, ...narrow]) assert.equal(new Date(tick.date).getUTCDay(), 1)
})

test('three-month labels mark real month boundaries inside weekly bars', () => {
  const { series } = getApplicationActivity([], now)
  const labels = getActivityAxisLabels(series['3m'])
  assert.deepEqual(labels.map(tick => tick.label), ['Sep', 'Oct', 'Nov'])
  assert.deepEqual(labels.map(tick => tick.date), ['2026-09-01T00:00:00.000Z', '2026-10-01T00:00:00.000Z', '2026-11-01T00:00:00.000Z'])
  assert.equal(labels[0].position, 0)
  assert.equal(labels[1].position, 3 / 7)
  assert.equal(labels[2].position, 6 / 7)
})

test('monthly axis includes the current month and distinguishes years', () => {
  const { series } = getApplicationActivity([], now)
  const labels = getActivityAxisLabels(series['12m'])
  assert.deepEqual(labels.map(label => label.index), [0, 3, 6, 9, 11])
  assert.deepEqual(labels.map(label => label.label), ['Dec\n2025', 'Mar\n2026', 'Jun\n2026', 'Sep\n2026', 'Nov\n2026'])
  assert.equal(getActivityAxisLabels(series.all)[0].label, 'Nov')
})

test('seven-day axis always shows only weekday initials', () => {
  const { series } = getApplicationActivity([], now)
  const labels = getActivityAxisLabels(series['7d'], 190)
  assert.deepEqual(labels.map(label => label.index), [0, 1, 2, 3, 4, 5, 6])
  assert.deepEqual(labels.map(label => label.label), ['T', 'F', 'S', 'S', 'M', 'T', 'W'])
})
