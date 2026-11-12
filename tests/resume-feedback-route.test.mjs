import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import ts from 'typescript'

// The real pure helpers from resume-feedback.ts; I/O (Supabase, extraction, Ollama) is stubbed below.
const helpers = ts.transpileModule(await readFile(new URL('../src/lib/resume-feedback.ts', import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText
const { parseResumeFeedback, prepareResumeText, MIN_RESUME_TEXT_CHARS } = await import(`data:text/javascript;base64,${Buffer.from(helpers).toString('base64')}`)

class OllamaUnavailableError extends Error {}
class OllamaInvalidResponseError extends Error {}
class UnsupportedResumeTypeError extends Error {}
class ResumeTextExtractionError extends Error {}

const validId = '00000000-0000-0000-0000-000000000042'
const resumeText = 'Jane Doe, Software Engineer. Built payment APIs in Go and led a team of four.'
const goodFeedback = { summary: 'Strong resume.', strengths: ['Clear impact'], improvements: ['Add links'] }
let state, calls

function reset() {
  calls = []
  state = {
    signedIn: true,
    resume: { data: { id: validId, storage_path: 'owner/cv.pdf', mime_type: 'application/pdf' }, error: null },
    download: { data: new Blob([resumeText]), error: null },
    feedbackRows: { data: [], error: null },
    insert: { data: { created_at: '2026-11-08T12:00:00Z' }, error: null },
    extract: async () => resumeText,
    model: async () => goodFeedback,
  }
}

// Chainable stand-in for the session-scoped Supabase client; every call is recorded.
function query(table) {
  const chain = {
    select(fields) { calls.push(['select', table, fields]); return chain },
    eq(field, value) { calls.push(['eq', table, field, value]); return chain },
    order(field, opts) { calls.push(['order', table, field, opts]); return chain },
    limit(n) { calls.push(['limit', table, n]); return Promise.resolve(state.feedbackRows) },
    insert(row) { calls.push(['insert', table, row]); return chain },
    maybeSingle: async () => state.resume,
    single: async () => state.insert,
  }
  return chain
}

globalThis.__resumeFeedbackRoute = {
  NextResponse: { json: (body, init) => Response.json(body, init) },
  isJobId: value => /^[0-9a-f-]{36}$/.test(value),
  OllamaInvalidResponseError, OllamaUnavailableError,
  getOllamaConfig: () => ({ baseUrl: 'http://ollama.test', model: 'test-model:1b' }),
  requestResumeFeedback: async (text, config) => { calls.push(['model', text, config]); return state.model() },
  MIN_RESUME_TEXT_CHARS, parseResumeFeedback, prepareResumeText,
  ResumeTextExtractionError, UnsupportedResumeTypeError,
  extractResumeText: async (bytes, mimeType) => { calls.push(['extract', Buffer.from(bytes).toString(), mimeType]); return state.extract() },
  RESUME_BUCKET: 'resumes',
  createClient: async () => ({
    auth: { getClaims: async () => ({ data: state.signedIn ? { claims: { sub: 'owner-id' } } : null }) },
    from(table) { calls.push(['from', table]); return query(table) },
    storage: { from(bucket) { return { download: async path => { calls.push(['download', bucket, path]); return state.download } } } },
  }),
}
let source = await readFile(new URL('../src/app/api/resumes/[id]/feedback/route.ts', import.meta.url), 'utf8')
source = source.replace(/^import .* from .*$/gm, '')
source = `const { NextResponse, isJobId, OllamaInvalidResponseError, OllamaUnavailableError, getOllamaConfig, requestResumeFeedback, MIN_RESUME_TEXT_CHARS, parseResumeFeedback, prepareResumeText, ResumeTextExtractionError, UnsupportedResumeTypeError, extractResumeText, RESUME_BUCKET, createClient } = globalThis.__resumeFeedbackRoute;\n${source}`
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText
const route = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`)

const call = async (method, id = validId) => {
  const response = await route[method](new Request(`https://app.example/api/resumes/${id}/feedback`, { method }), { params: Promise.resolve({ id }) })
  return { status: response.status, body: await response.json() }
}
const has = kind => calls.some(c => c[0] === kind)
// The route logs expected failures; keep test output clean.
const quiet = async fn => { const original = console.error; console.error = () => {}; try { return await fn() } finally { console.error = original } }

test('route runs on the Node.js runtime', () => { assert.equal(route.runtime, 'nodejs') })

test('GET returns the latest saved feedback only for a visible resume of a signed-in user', async () => {
  reset()
  assert.deepEqual(await call('GET', 'bad-id'), { status: 404, body: { error: 'Resume not found.', code: 'not_found' } })
  assert.deepEqual(calls, [])

  reset(); state.signedIn = false
  assert.deepEqual(await call('GET'), { status: 401, body: { error: 'You must be signed in to do that.', code: 'unauthorized' } })
  assert.deepEqual(calls, [])

  for (const hidden of [{ data: null, error: null }, { data: null, error: { message: 'denied' } }]) {
    reset(); state.resume = hidden
    assert.deepEqual((await call('GET')).status, 404)
    assert.equal(calls.some(c => c[1] === 'resume_feedback'), false)
  }

  reset()
  assert.deepEqual(await call('GET'), { status: 200, body: { feedback: null } })
  assert.deepEqual(calls, [
    ['from', 'resumes'], ['select', 'resumes', 'id'], ['eq', 'resumes', 'id', validId],
    ['from', 'resume_feedback'], ['select', 'resume_feedback', 'feedback, model_name, created_at'], ['eq', 'resume_feedback', 'resume_id', validId],
    ['order', 'resume_feedback', 'created_at', { ascending: false }], ['limit', 'resume_feedback', 1],
  ])

  reset(); state.feedbackRows = { data: [{ feedback: goodFeedback, model_name: 'llama3.1:8b', created_at: '2026-11-07T10:00:00Z' }], error: null }
  assert.deepEqual(await call('GET'), { status: 200, body: { feedback: { feedback: goodFeedback, model: 'llama3.1:8b', createdAt: '2026-11-07T10:00:00Z' } } })

  // A stored row that no longer parses is treated as no feedback.
  reset(); state.feedbackRows = { data: [{ feedback: { summary: 'x' }, model_name: 'm', created_at: 't' }], error: null }
  assert.deepEqual(await call('GET'), { status: 200, body: { feedback: null } })

  // e.g. migration 0016 not applied: degrade to "no feedback yet".
  reset(); state.feedbackRows = { data: null, error: { message: 'relation "resume_feedback" does not exist' } }
  assert.deepEqual(await quiet(() => call('GET')), { status: 200, body: { feedback: null } })
})

test('POST maps every failure to its status and code without calling the model or saving needlessly', async () => {
  const expectError = async (status, code, setup, { modelCalled = false } = {}) => {
    reset(); setup()
    const { status: actual, body } = await quiet(() => call('POST', state.id ?? validId))
    assert.equal(actual, status, code)
    assert.equal(body.code, code)
    assert.equal(typeof body.error, 'string')
    assert.equal(has('model'), modelCalled, `model call for ${code}`)
    assert.equal(has('insert'), code === 'save_failed', `insert for ${code}`)
  }
  await expectError(401, 'unauthorized', () => { state.signedIn = false })
  await expectError(404, 'not_found', () => { state.id = 'bad-id' })
  assert.deepEqual(calls, [])
  await expectError(404, 'not_found', () => { state.resume = { data: null, error: null } })
  assert.equal(has('download'), false)
  await expectError(404, 'not_found', () => { state.resume = { data: null, error: { message: 'denied' } } })
  await expectError(404, 'not_found', () => { state.download = { data: null, error: { message: 'Object not found' } } })
  assert.equal(has('extract'), false)
  await expectError(422, 'unreadable', () => { state.extract = async () => { throw new UnsupportedResumeTypeError('image/png') } })
  await expectError(422, 'unreadable', () => { state.extract = async () => { throw new ResumeTextExtractionError('bad pdf') } })
  await expectError(422, 'unreadable', () => { state.extract = async () => '  short \n\n text  ' })
  await expectError(422, 'unreadable', () => { state.extract = async () => 'x'.repeat(MIN_RESUME_TEXT_CHARS - 1) })
  await expectError(503, 'ai_unavailable', () => { state.model = async () => { throw new OllamaUnavailableError('down') } }, { modelCalled: true })
  await expectError(502, 'ai_invalid', () => { state.model = async () => { throw new OllamaInvalidResponseError('junk') } }, { modelCalled: true })
  await expectError(500, 'save_failed', () => { state.insert = { data: null, error: { message: 'violates row-level security' } } }, { modelCalled: true })

  // Unexpected errors are not swallowed into a misleading code.
  reset(); state.extract = async () => { throw new Error('disk on fire') }
  await assert.rejects(call('POST'), /disk on fire/)
  reset(); state.model = async () => { throw new Error('bug') }
  await assert.rejects(quiet(() => call('POST')), /bug/)
})

test('POST extracts, prepares and analyzes the stored file, then saves and returns the feedback', async () => {
  reset()
  state.extract = async () => `  ${resumeText}\r\n\r\n\r\n\r\nSkills:\t\tGo  `
  const { status, body } = await call('POST')
  assert.equal(status, 200)
  assert.deepEqual(body, { feedback: goodFeedback, model: 'test-model:1b', createdAt: '2026-11-08T12:00:00Z' })
  assert.deepEqual(calls.find(c => c[0] === 'download'), ['download', 'resumes', 'owner/cv.pdf'])
  assert.deepEqual(calls.find(c => c[0] === 'extract'), ['extract', resumeText, 'application/pdf'])
  assert.deepEqual(calls.find(c => c[0] === 'model'), ['model', `${resumeText}\n\nSkills: Go`, { baseUrl: 'http://ollama.test', model: 'test-model:1b' }])
  assert.deepEqual(calls.find(c => c[0] === 'insert'), ['insert', 'resume_feedback', { resume_id: validId, user_id: 'owner-id', model_name: 'test-model:1b', feedback: goodFeedback }])
  assert.deepEqual(calls.find(c => c[0] === 'select' && c[1] === 'resumes'), ['select', 'resumes', 'storage_path, mime_type'])
})
