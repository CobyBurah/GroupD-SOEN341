import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import ts from 'typescript'

let supabase

globalThis.__jobsTest = {
  createClient: async () => supabase,
}

let source = await readFile(new URL('../src/lib/jobs.ts', import.meta.url), 'utf8')
source = source.replace(/^import .* from .*$/gm, '')
source = `const { createClient } = globalThis.__jobsTest;\n${source}`

const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText
const { getJobs, getJobFilterOptions, JOBS_PER_PAGE } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`)

function mockQuery(...results) {
  const calls = []
  let responseIndex = 0

  const query = {
    select(...args) { calls.push(['select', ...args]); return this },
    is(...args) { calls.push(['is', ...args]); return this },
    or(...args) { calls.push(['or', ...args]); return this },
    ilike(...args) { calls.push(['ilike', ...args]); return this },
    in(...args) { calls.push(['in', ...args]); return this },
    order(...args) { calls.push(['order', ...args]); return this },
    range(...args) { calls.push(['range', ...args]); return this },
    then(resolve, reject) { return Promise.resolve(results[Math.min(responseIndex++, results.length - 1)]).then(resolve, reject) },
  }

  supabase = {
    from(table) {
      calls.push(['from', table])
      return query
    },
  }

  return calls
}

test('job search applies keyword, location and selected filters', async () => {
  const calls = mockQuery({ data: [{ id: 'job-1' }], count: 1, error: null })

  const result = await getJobs('developer', 'Montreal', ['Software Development'], ['full_time'], ['hybrid'], 1)

  assert.equal(result.total, 1)
  assert.equal(result.jobs.length, 1)
  assert.ok(calls.some(([name, value]) => name === 'or' && value.includes('developer')))
  assert.ok(calls.some((call) => call[0] === 'ilike' && call[1] === 'location' && call[2] === '%Montreal%'))
  assert.ok(calls.some((call) => call[0] === 'in' && call[1] === 'category' && call[2][0] === 'Software Development'))
  assert.ok(calls.some((call) => call[0] === 'in' && call[1] === 'employment_type' && call[2][0] === 'full_time'))
  assert.ok(calls.some((call) => call[0] === 'in' && call[1] === 'workplace_type' && call[2][0] === 'hybrid'))
})

test('jobs are limited to 10 per page', async () => {
  const calls = mockQuery({ data: [{ id: 'job' }], count: 25, error: null })

  await getJobs('', '', [], [], [], 2)

  assert.equal(JOBS_PER_PAGE, 10)
  assert.ok(calls.some((call) => call[0] === 'range' && call[1] === 10 && call[2] === 19))
  assert.ok(calls.some((call) => call[0] === 'order' && call[1] === 'created_at' && call[2].ascending === false))
})

test('invalid, out-of-range and enormous pages only request the safe first page', async () => {
  for (const page of [0, -2, NaN, 1.5, Infinity, 4, 999, 3323232432423, Number.MAX_SAFE_INTEGER, 1e100]) {
    const calls = mockQuery({ data: [{ id: 'first-job' }], count: 25, error: null })
    const result = await getJobs('', '', [], [], [], page)
    assert.equal(result.page, 1)
    assert.deepEqual(result.jobs, [{ id: 'first-job' }])
    assert.deepEqual(calls.filter(([name]) => name === 'range'), [['range', 0, 9]])
  }
})

test('valid page 2 and page 3 use the matching count and return the requested results', async () => {
  for (const page of [2, 3]) {
    const calls = mockQuery(
      { data: [{ id: 'first-job' }], count: 25, error: null },
      { data: [{ id: `page-${page}` }], count: 25, error: null },
    )
    const result = await getJobs('', '', [], [], [], page)
    assert.equal(result.page, page)
    assert.deepEqual(result.jobs, [{ id: `page-${page}` }])
    assert.deepEqual(calls.filter(([name]) => name === 'range'), [['range', 0, 9], ['range', (page - 1) * 10, page * 10 - 1]])
  }
})

test('search and filter result counts determine whether a page exists', async () => {
  for (const count of [0, 5, 15, 25]) {
    const calls = mockQuery({ data: count ? [{ id: 'matching-job' }] : [], count, error: null })
    const result = await getJobs('developer', 'Montreal', ['Software', 'Marketing'], ['full_time'], ['hybrid'], 3)
    assert.equal(result.page, count > 20 ? 3 : 1)
    assert.equal(result.total, count)
    assert.deepEqual(calls.find(([name]) => name === 'in'), ['in', 'employment_type', ['full_time']])
    assert.ok(calls.some(call => call[0] === 'in' && call[1] === 'category' && call[2].length === 2))
    assert.equal(calls.filter(([name]) => name === 'range').length, count > 20 ? 2 : 1)
  }
})

test('a range invalidated by deleted jobs falls back without masking other database errors', async () => {
  for (const requested of [
    { data: null, count: null, error: { code: 'PGRST103', message: 'Range not satisfiable' } },
    { data: [], count: 0, error: null },
  ]) {
    mockQuery({ data: [{ id: 'first-job' }], count: 25, error: null }, requested)
    assert.equal((await getJobs('', '', [], [], [], 3)).page, 1)
  }
  mockQuery({ data: null, count: null, error: { code: '42501', message: 'Denied' } })
  await assert.rejects(getJobs(), /Denied/)
  mockQuery(
    { data: [{ id: 'first-job' }], count: 25, error: null },
    { data: null, count: null, error: { code: '42501', message: 'Denied' } },
  )
  await assert.rejects(getJobs('', '', [], [], [], 3), /Denied/)
})

test('even an enormous count cannot produce a range beyond signed integer offsets', async () => {
  const calls = mockQuery({ data: [{ id: 'first-job' }], count: Number.MAX_SAFE_INTEGER, error: null })
  assert.equal((await getJobs('', '', [], [], [], 3323232432423)).page, 1)
  assert.deepEqual(calls.filter(([name]) => name === 'range'), [['range', 0, 9]])
})

test('job filter options include available locations and categories without duplicates', async () => {
  mockQuery({
    data: [
      { location: 'Montreal, Quebec, Canada', location_region: 'Quebec', location_country: 'Canada', category: 'Marketing' },
      { location: 'Laval, Quebec, Canada', location_region: 'Quebec', location_country: 'Canada', category: 'Marketing' },
      { location: 'Toronto, Ontario, Canada', location_region: 'Ontario', location_country: 'Canada', category: 'Finance' },
    ],
    error: null,
  })

  const options = await getJobFilterOptions()

  assert.deepEqual(options.categories, ['Finance', 'Marketing'])
  assert.ok(options.locations.includes('Montreal, Quebec, Canada'))
  assert.ok(options.locations.includes('Laval, Quebec, Canada'))
  assert.ok(options.locations.includes('Quebec, Canada'))
  assert.ok(options.locations.includes('Ontario, Canada'))
  assert.equal(options.locations.filter((value) => value === 'Canada').length, 1)
})
