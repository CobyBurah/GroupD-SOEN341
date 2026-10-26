import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import ts from 'typescript'

let result, signResult, calls, signedIn = true
const validId = '00000000-0000-0000-0000-000000000032'
globalThis.__submittedResumeRoute = {
  notFound() { throw new Error('NOT_FOUND') },
  redirect(url) { throw new Error('REDIRECT:' + url) },
  isJobId: value => /^[0-9a-f-]{36}$/.test(value),
  RESUME_BUCKET: 'resumes',
  createClient: async () => ({
    auth: { getClaims: async () => ({ data: signedIn ? { claims: { sub: 'owner' } } : null }) },
    from(table) {
      calls.push(['from', table])
      return { select(fields) { calls.push(['select', fields]); return this }, eq(field, value) { calls.push(['eq', field, value]); return this }, single: async () => result }
    },
    storage: { from(bucket) { return { createSignedUrl: async (path, expiry) => { calls.push(['sign', bucket, path, expiry]); return signResult } } } },
  }),
}
let source = await readFile(new URL('../src/app/(protected)/applications/[id]/resume/route.ts', import.meta.url), 'utf8')
source = source.replace(/^import .* from .*$/gm, '')
source = `const { notFound, redirect, isJobId, RESUME_BUCKET, createClient } = globalThis.__submittedResumeRoute;\n${source}`
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText
const { GET } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`)

test('application download signs only its saved path and refuses unavailable or inaccessible applications', async () => {
  calls = []
  result = { data: { submitted_resume_path: 'owner/original.pdf' }, error: null }
  signResult = { data: { signedUrl: 'https://storage.example/original' }, error: null }
  const request = id => GET(new Request('https://app.example'), { params: Promise.resolve({ id }) })
  await assert.rejects(request(validId), /REDIRECT:https:\/\/storage.example\/original/)
  assert.deepEqual(calls, [['from', 'applications'], ['select', 'submitted_resume_path'], ['eq', 'id', validId], ['sign', 'resumes', 'owner/original.pdf', 60]])
  for (const inaccessible of [{ data: null, error: null }, { data: null, error: { message: 'denied' } }, { data: { submitted_resume_path: null }, error: null }]) {
    calls = []; result = inaccessible
    await assert.rejects(request(validId), /NOT_FOUND/)
    assert.equal(calls.some(c => c[0] === 'sign'), false)
  }
  calls = []
  await assert.rejects(request('bad-id'), /NOT_FOUND/)
  assert.deepEqual(calls, [])
  signedIn = false
  await assert.rejects(request(validId), /NOT_FOUND/)
  assert.deepEqual(calls, [])
  signedIn = true
  result = { data: { submitted_resume_path: 'owner/missing.pdf' }, error: null }
  signResult = { data: null, error: { message: 'missing object' } }
  await assert.rejects(request(validId), /NOT_FOUND/)
})
