import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import ts from 'typescript'

// US-21 POST /api/job-matches. The real matching and resume helpers run; Supabase,
// text extraction and the Ollama call are stubbed so every failure path is covered.
const compileLib = async path => {
  const js = ts.transpileModule(await readFile(new URL(`../src/lib/${path}`, import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText
  return import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`)
}
const { MIN_MATCH_SCORE, buildSeekerText, selectCandidates } = await compileLib('job-matching.ts')
const { MIN_RESUME_TEXT_CHARS, prepareResumeText } = await compileLib('resume-feedback.ts')

class OllamaUnavailableError extends Error {}
class OllamaInvalidResponseError extends Error {}
class UnsupportedResumeTypeError extends Error {}
class ResumeTextExtractionError extends Error {}

const resumeId = '00000000-0000-0000-0000-000000000042'
const reactJob = { id: '00000000-0000-0000-0000-000000000001', title: 'React Developer', company: 'Acme', location: 'Montreal', category: null, employment_type: null, workplace_type: null, description: 'React and TypeScript front end.' }
const appliedJob = { ...reactJob, id: '00000000-0000-0000-0000-000000000002', title: 'TypeScript Engineer' }
const nurseJob = { ...reactJob, id: '00000000-0000-0000-0000-000000000003', title: 'Nurse', description: 'Patient care in a hospital.' }
const resumeText = 'Jane Doe, front-end developer. Five years of React, TypeScript and Next.js work.'
let state, calls

function reset() {
  calls = []
  state = {
    signedIn: true,
    profile: { data: { role: 'job_seeker', headline: 'Front-end developer', location: 'Montreal', bio: null }, error: null },
    resume: { data: { storage_path: 'owner/cv.pdf', mime_type: 'application/pdf' }, error: null },
    download: { data: new Blob([resumeText]), error: null },
    jobs: { data: [reactJob, appliedJob, nurseJob], error: null },
    applied: { data: [{ job_id: appliedJob.id }], error: null },
    extract: async () => resumeText,
    model: async (_text, jobs) => jobs.map(job => ({ jobId: job.id, score: 82, reasons: ['React'], missingSkills: ['GraphQL'] })),
  }
}

function query(table) {
  const chain = {
    select(fields) { calls.push(['select', table, fields]); return chain },
    eq(field, value) { calls.push(['eq', table, field, value]); return table === 'applications' ? Promise.resolve(state.applied) : chain },
    is(field, value) { calls.push(['is', table, field, value]); return chain },
    or(filter) { calls.push(['or', table, filter]); return chain },
    order() { return chain },
    limit(n) { calls.push(['limit', table, n]); return Promise.resolve(state.jobs) },
    maybeSingle: async () => (table === 'profiles' ? state.profile : state.resume),
  }
  return chain
}

globalThis.__jobMatchesRoute = {
  NextResponse: { json: (body, init) => Response.json(body, init) },
  isJobId: value => typeof value === 'string' && /^[0-9a-f-]{36}$/.test(value),
  MIN_MATCH_SCORE, buildSeekerText, selectCandidates,
  openDeadlineFilter: () => 'application_deadline.is.null,application_deadline.gte.2026-11-19',
  OllamaInvalidResponseError, OllamaUnavailableError,
  getOllamaConfig: () => ({ baseUrl: 'http://ollama.test', model: 'test-model:1b' }),
  requestJobMatches: async (text, jobs, config) => { calls.push(['model', text, jobs.map(job => job.id), config]); return state.model(text, jobs) },
  MIN_RESUME_TEXT_CHARS, prepareResumeText,
  ResumeTextExtractionError, UnsupportedResumeTypeError,
  extractResumeText: async () => state.extract(),
  RESUME_BUCKET: 'resumes',
  createClient: async () => ({
    auth: { getClaims: async () => ({ data: state.signedIn ? { claims: { sub: 'seeker-id' } } : null }) },
    from(table) { calls.push(['from', table]); return query(table) },
    storage: { from(bucket) { return { download: async path => { calls.push(['download', bucket, path]); return state.download } } } },
  }),
}
let source = await readFile(new URL('../src/app/api/job-matches/route.ts', import.meta.url), 'utf8')
source = source.replace(/^import .* from .*$/gm, '')
source = `const { NextResponse, isJobId, MIN_MATCH_SCORE, buildSeekerText, selectCandidates, openDeadlineFilter, OllamaInvalidResponseError, OllamaUnavailableError, getOllamaConfig, requestJobMatches, MIN_RESUME_TEXT_CHARS, prepareResumeText, ResumeTextExtractionError, UnsupportedResumeTypeError, extractResumeText, RESUME_BUCKET, createClient } = globalThis.__jobMatchesRoute;\n${source}`
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText
const route = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`)

const post = async (body = { resumeId }) => {
  const init = { method: 'POST', body: typeof body === 'string' ? body : JSON.stringify(body) }
  const response = await route.POST(new Request('https://app.example/api/job-matches', init))
  return { status: response.status, body: await response.json() }
}
const quiet = async fn => { const original = console.error; console.error = () => {}; try { return await fn() } finally { console.error = original } }

test('route runs on the Node.js runtime', () => { assert.equal(route.runtime, 'nodejs') })

test('matches only open postings the seeker has not applied to, using resume and profile', async () => {
  reset()
  const { status, body } = await post()
  assert.equal(status, 200)
  assert.deepEqual(body, {
    matches: [{ jobId: reactJob.id, score: 82, reasons: ['React'], missingSkills: ['GraphQL'], title: 'React Developer', company: 'Acme', location: 'Montreal' }],
    considered: 2,
    model: 'test-model:1b',
  })
  const model = calls.find(c => c[0] === 'model')
  assert.deepEqual(model[2], [reactJob.id], 'applied and unrelated postings are not sent to the model')
  assert.ok(model[1].includes('Headline: Front-end developer') && model[1].includes('React, TypeScript'))
  assert.ok(calls.some(c => c[0] === 'is' && c[2] === 'archived_at'))
  assert.ok(calls.some(c => c[0] === 'or' && c[2].includes('application_deadline')))
  assert.ok(calls.some(c => c[0] === 'eq' && c[1] === 'applications' && c[2] === 'user_id' && c[3] === 'seeker-id'))
})

test('rejects bad input, signed-out users, recruiters and resumes the seeker cannot see', async () => {
  for (const body of ['not json', {}, { resumeId: 'bad' }, { resumeId: 42 }]) {
    reset()
    assert.deepEqual(await post(body), { status: 404, body: { error: 'Choose one of your resumes.', code: 'not_found' } })
    assert.deepEqual(calls, [])
  }
  reset(); state.signedIn = false
  assert.equal((await post()).status, 401)
  reset(); state.profile = { data: { role: 'recruiter' }, error: null }
  assert.deepEqual((await post()).body.code, 'forbidden')
  assert.equal(calls.some(c => c[1] === 'resumes'), false)
  reset(); state.resume = { data: null, error: null }
  assert.equal((await post()).status, 404)
  reset(); state.download = { data: null, error: { message: 'denied' } }
  assert.equal((await quiet(() => post())).status, 404)
  assert.equal(calls.some(c => c[0] === 'model'), false)
})

test('unreadable resumes and database failures stop before the model is called', async () => {
  reset(); state.extract = async () => 'too short'
  assert.deepEqual((await post()).body.code, 'unreadable')
  reset(); state.extract = async () => { throw new ResumeTextExtractionError('bad pdf') }
  assert.equal((await quiet(() => post())).status, 422)
  reset(); state.jobs = { data: null, error: { message: 'boom' } }
  assert.deepEqual((await quiet(() => post())).body.code, 'jobs_failed')
  reset(); state.applied = { data: null, error: { message: 'boom' } }
  assert.equal((await quiet(() => post())).status, 500)
  assert.equal(calls.some(c => c[0] === 'model'), false)
})

test('no overlapping postings returns an empty result without calling the model', async () => {
  reset(); state.jobs = { data: [nurseJob], error: null }
  assert.deepEqual(await post(), { status: 200, body: { matches: [], considered: 1, model: null } })
  assert.equal(calls.some(c => c[0] === 'model'), false)
})

test('AI failures return a clear error instead of made-up matches', async () => {
  reset(); state.model = async () => { throw new OllamaUnavailableError('down') }
  assert.deepEqual(await quiet(() => post()), { status: 503, body: { error: 'The AI matching service is unavailable right now. Please try again later.', code: 'ai_unavailable' } })
  reset(); state.model = async () => { throw new OllamaInvalidResponseError('garbage') }
  assert.equal((await quiet(() => post())).status, 502)
})

test('weak fits scored below the minimum are not shown as matches', async () => {
  reset(); state.model = async (_text, jobs) => [{ jobId: jobs[0].id, score: MIN_MATCH_SCORE - 1, reasons: ['Little overlap'], missingSkills: [] }]
  assert.deepEqual(await post(), { status: 200, body: { matches: [], considered: 2, model: 'test-model:1b' } })
  reset(); state.model = async (_text, jobs) => [{ jobId: jobs[0].id, score: MIN_MATCH_SCORE, reasons: ['Some overlap'], missingSkills: [] }]
  assert.equal((await post()).body.matches.length, 1)
})
