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

function mockQuery(result) {
  const calls = []

  const query = {
    select(...args) { calls.push(['select', ...args]); return this },
    is(...args) { calls.push(['is', ...args]); return this },
    or(...args) { calls.push(['or', ...args]); return this },
    ilike(...args) { calls.push(['ilike', ...args]); return this },
    in(...args) { calls.push(['in', ...args]); return this },
    order(...args) { calls.push(['order', ...args]); return this },
    range(...args) { calls.push(['range', ...args]); return this },
    then(resolve, reject) { return Promise.resolve(result).then(resolve, reject) },
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
  const calls = mockQuery({ data: [], count: 25, error: null })

  await getJobs('', '', [], [], [], 2)

  assert.equal(JOBS_PER_PAGE, 10)
  assert.ok(calls.some((call) => call[0] === 'range' && call[1] === 10 && call[2] === 19))
  assert.ok(calls.some((call) => call[0] === 'order' && call[1] === 'created_at' && call[2].ascending === false))
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