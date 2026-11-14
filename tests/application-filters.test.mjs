import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import ts from 'typescript'

// Load the filter code (and the status list it uses) so we can test it without running the website
const statuses = await readFile(new URL('../src/lib/applications.ts', import.meta.url), 'utf8')
const filters = (await readFile(new URL('../src/lib/application-filters.ts', import.meta.url), 'utf8')).replace(/^import .* from .*$/gm, '')
const compiled = ts.transpileModule(`${statuses}\n${filters}`, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText
const { parseApplicationFilters, filterApplications, hasActiveFilters, isDateInput, applicationDate } =
  await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`)

// Fake applications for one job posting
const applications = [
  { id: 'a', job_id: 'job-1', status: 'Applied', created_at: '2026-11-01T15:00:00Z' },
  { id: 'b', job_id: 'job-1', status: 'Interview', created_at: '2026-11-05T09:30:00Z' },
  { id: 'c', job_id: 'job-1', status: 'Rejected', created_at: '2026-11-10T23:59:59Z' },
  { id: 'd', job_id: 'job-1', status: 'Interview', created_at: '2026-11-13T00:00:00Z' },
]
const ids = rows => rows.map(row => row.id)

test('no filters returns every application for the posting', () => {
  const none = parseApplicationFilters({})
  assert.equal(hasActiveFilters(none), false)
  assert.deepEqual(ids(filterApplications(applications, none)), ['a', 'b', 'c', 'd'])
})

test('status filter keeps only applications with that status', () => {
  const result = filterApplications(applications, parseApplicationFilters({ status: 'Interview' }))
  assert.deepEqual(ids(result), ['b', 'd'])
})

test('date range is inclusive on both ends', () => {
  const result = filterApplications(applications, parseApplicationFilters({ from: '2026-11-05', to: '2026-11-10' }))
  assert.deepEqual(ids(result), ['b', 'c'])
})

test('only a start date or only an end date also works', () => {
  assert.deepEqual(ids(filterApplications(applications, parseApplicationFilters({ from: '2026-11-10' }))), ['c', 'd'])
  assert.deepEqual(ids(filterApplications(applications, parseApplicationFilters({ to: '2026-11-01' }))), ['a'])
})

test('status and date filters combine', () => {
  const result = filterApplications(applications, parseApplicationFilters({ status: 'Interview', from: '2026-11-06' }))
  assert.deepEqual(ids(result), ['d'])
})

test('no matches returns an empty list (the page then shows the no-match message)', () => {
  const result = filterApplications(applications, parseApplicationFilters({ status: 'Offered' }))
  assert.deepEqual(result, [])
})

test('unknown statuses, invalid dates and empty values are ignored', () => {
  const parsed = parseApplicationFilters({ status: 'Hired', from: '2026-02-30', to: 'yesterday' })
  assert.deepEqual(parsed, { status: null, from: null, to: null })
  assert.deepEqual(parseApplicationFilters({ status: '', from: '', to: '' }), { status: null, from: null, to: null })
})

test('a reversed date range is swapped instead of hiding everything', () => {
  assert.deepEqual(parseApplicationFilters({ from: '2026-11-10', to: '2026-11-05' }), { status: null, from: '2026-11-05', to: '2026-11-10' })
})

test('repeated query parameters use the first value', () => {
  assert.equal(parseApplicationFilters({ status: ['Rejected', 'Applied'] }).status, 'Rejected')
})

test('dates are compared by UTC calendar day', () => {
  assert.equal(applicationDate('2026-11-10T23:59:59Z'), '2026-11-10')
  assert.equal(isDateInput('2026-11-13'), true)
  assert.equal(isDateInput('2026-13-01'), false)
  assert.equal(isDateInput(undefined), false)
})

test('filtering does not modify the original list', () => {
  const copy = structuredClone(applications)
  filterApplications(applications, parseApplicationFilters({ status: 'Applied' }))
  assert.deepEqual(applications, copy)
})