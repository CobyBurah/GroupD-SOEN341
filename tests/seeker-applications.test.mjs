import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import ts from 'typescript'

let supabase

globalThis.__seekerApplicationsTest = {
  createClient: async () => supabase,
}

let source = await readFile(new URL('../src/lib/seeker-applications.ts', import.meta.url), 'utf8')
source = source.replace(/^import .* from .*$/gm, '')
source = `const { createClient } = globalThis.__seekerApplicationsTest;\n${source}`

const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText
const { getSeekerApplications } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`)

function mockQuery(result) {
  const calls = []
  const query = {
    select(...args) { calls.push(['select', ...args]); return this },
    eq(...args) { calls.push(['eq', ...args]); return this },
    order(...args) { calls.push(['order', ...args]); return this },
    then(resolve, reject) { return Promise.resolve(result).then(resolve, reject) },
  }
  supabase = { from(table) { calls.push(['from', table]); return query } }
  return calls
}

test('loads the seeker\'s applications newest first with job, resume and history', async () => {
  const calls = mockQuery({ data: [], error: null })

  await getSeekerApplications('user-1')

  assert.deepEqual(calls[0], ['from', 'applications'])
  const select = calls.find(([name]) => name === 'select')[1]
  assert.match(select, /job:jobs\(\*\)/)
  assert.match(select, /resume:resumes\(id, file_name\)/)
  assert.match(select, /history:application_status_history\(status, changed_at\)/)
  assert.ok(calls.some((call) => call[0] === 'eq' && call[1] === 'user_id' && call[2] === 'user-1'))
  assert.ok(calls.some((call) => call[0] === 'order' && call[1] === 'created_at' && call[2].ascending === false))
})

test('keeps applications to removed jobs and sorts history oldest first', async () => {
  mockQuery({
    data: [
      {
        id: 'a1', status: 'Interview', created_at: '2026-01-01', resume: null, job: { id: 'j1', title: 'Dev', deleted_at: null },
        history: [{ status: 'Interview', changed_at: '2026-01-03T00:00:00+00:00' }, { status: 'Applied', changed_at: '2026-01-01T00:00:00+00:00' }],
      },
      { id: 'a2', status: 'Applied', created_at: '2026-01-02', resume: null, job: { id: 'j2', deleted_at: '2026-02-01' }, history: [] },
      { id: 'a3', status: 'Applied', created_at: '2026-01-02', resume: null, job: null, history: null },
    ],
    error: null,
  })

  const applications = await getSeekerApplications('user-1')

  assert.equal(applications.length, 3)
  assert.equal(applications[0].job.title, 'Dev')
  assert.deepEqual(applications[0].history.map((entry) => entry.status), ['Applied', 'Interview'])
  assert.equal(applications[1].job, null)
  assert.equal(applications[2].job, null)
  assert.deepEqual(applications[2].history, [])
})

test('throws when applications cannot be loaded', async () => {
  mockQuery({ data: null, error: { message: 'boom' } })

  await assert.rejects(getSeekerApplications('user-1'), /Could not load applications: boom/)
})
