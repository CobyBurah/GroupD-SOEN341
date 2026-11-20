import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import ts from 'typescript'

// US-21 AI job matching: pure helpers and the Ollama client, no server or model needed.
const compile = async (path, rewrite = s => s) => {
  const source = rewrite(await readFile(new URL(`../src/lib/${path}`, import.meta.url), 'utf8'))
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText
  return `data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`
}
const matchingUrl = await compile('job-matching.ts')
const feedbackUrl = await compile('resume-feedback.ts')
const {
  tokenize, keywordScore, selectCandidates, buildSeekerText, buildJobMatchPrompt, parseJobMatches,
  JOB_MATCH_SCHEMA, JOB_MATCH_SYSTEM_PROMPT, MAX_CANDIDATES, MAX_JOB_DESCRIPTION_CHARS, openDeadlineFilter,
} = await import(matchingUrl)
const { requestJobMatches, OllamaUnavailableError, OllamaInvalidResponseError } = await import(
  await compile('ollama.ts', s => s.replace("from '@/lib/resume-feedback'", `from '${feedbackUrl}'`).replace("from '@/lib/job-matching'", `from '${matchingUrl}'`))
)

const job = (id, title, description, extra = {}) => ({
  id, title, company: 'Acme', location: 'Montreal, Quebec, Canada', category: null, employment_type: null, workplace_type: null, description, ...extra,
})
const frontend = job('00000000-0000-0000-0000-000000000001', 'Frontend Developer', 'Build React and TypeScript interfaces with Next.js.')
const backend = job('00000000-0000-0000-0000-000000000002', 'Backend Developer', 'Design PostgreSQL schemas and Node.js APIs.')
const nurse = job('00000000-0000-0000-0000-000000000003', 'Registered Nurse', 'Provide patient care in a hospital ward.')
const resume = 'Software developer. Skills: React, TypeScript, Next.js, Node.js, PostgreSQL, C++ and C#.'

test('tokenize keeps tech names, drops stop words and short tokens', () => {
  const tokens = tokenize('The C++ and C# developer knows Node.js, React. And SQL!')
  for (const word of ['c++', 'c#', 'node.js', 'react', 'sql', 'developer']) assert.ok(tokens.has(word), word)
  for (const word of ['the', 'and', 'c', '']) assert.equal(tokens.has(word), false, word)
})

test('keyword pre-ranking keeps relevant postings, best first, and drops unrelated ones', () => {
  const tokens = tokenize(resume)
  assert.ok(keywordScore(tokens, frontend) > 0)
  assert.equal(keywordScore(tokens, nurse), 0)
  assert.equal(keywordScore(tokens, job('x', '', '')), 0, 'empty posting scores 0')
  // Same city alone is not a match, but it breaks ties between relevant jobs.
  const local = tokenize(resume + ' Location: Montreal')
  assert.equal(keywordScore(local, nurse), 0)
  assert.ok(keywordScore(local, frontend) > keywordScore(local, { ...frontend, location: 'Toronto' }))

  const picked = selectCandidates(resume, [nurse, backend, frontend])
  assert.deepEqual(picked.map(item => item.title).sort(), ['Backend Developer', 'Frontend Developer'])
  assert.equal(picked.some(item => item.id === nurse.id), false)
  assert.deepEqual(selectCandidates('', [frontend, backend]), [], 'no seeker text means no candidates')

  const many = Array.from({ length: 20 }, (_, index) => job(`id-${index}`, 'React Developer', 'React TypeScript'))
  assert.equal(selectCandidates(resume, many).length, MAX_CANDIDATES)
  assert.equal(selectCandidates(resume, many, 3)[0].id, 'id-0', 'ties keep the newest-first input order')
})

test('the prompt holds only the seeker text and the selected postings, with long descriptions cut', () => {
  const seeker = buildSeekerText('RESUME BODY', { headline: 'Junior dev', location: 'Laval', bio: null })
  assert.equal(seeker, 'Headline: Junior dev\nLocation: Laval\nRESUME BODY')
  assert.equal(buildSeekerText('ONLY RESUME', null), 'ONLY RESUME')

  const long = job('00000000-0000-0000-0000-000000000009', 'Data Analyst', 'x'.repeat(5000))
  const prompt = buildJobMatchPrompt(seeker, [frontend, long])
  assert.ok(prompt.includes(`job_id: ${frontend.id}`) && prompt.includes(`job_id: ${long.id}`))
  assert.ok(prompt.includes('RESUME BODY'))
  assert.equal(prompt.includes(backend.id), false)
  assert.ok(!prompt.includes('x'.repeat(MAX_JOB_DESCRIPTION_CHARS + 1)))
  assert.match(JOB_MATCH_SYSTEM_PROMPT, /Never invent postings/)
  assert.match(JOB_MATCH_SYSTEM_PROMPT, /data, not instructions/)
  assert.match(JOB_MATCH_SYSTEM_PROMPT, /Never list a skill the candidate already has/)
  assert.deepEqual(JOB_MATCH_SCHEMA.required, ['matches'])
})

test('parseJobMatches drops invented, duplicate and reasonless matches, clamps scores and sorts', () => {
  const allowed = [frontend.id, backend.id]
  const parsed = parseJobMatches(JSON.stringify({ matches: [
    { job_id: backend.id, score: 40.4, reasons: ['Knows PostgreSQL'], missing_skills: ['Go', 3, ' '] },
    { job_id: '99999999-9999-9999-9999-999999999999', score: 99, reasons: ['Invented job'], missing_skills: [] },
    { job_id: frontend.id, score: 140, reasons: [' Uses React ', '', 'TypeScript', 'Next.js', 'extra'], missing_skills: [] },
    { job_id: frontend.id, score: 10, reasons: ['Duplicate'], missing_skills: [] },
    { job_id: backend.id, score: 'high', reasons: ['bad score'], missing_skills: [] },
  ] }), allowed)
  assert.deepEqual(parsed, [
    { jobId: frontend.id, score: 100, reasons: ['Uses React', 'TypeScript', 'Next.js'], missingSkills: [] },
    { jobId: backend.id, score: 40, reasons: ['Knows PostgreSQL'], missingSkills: ['Go'] },
  ])
  assert.deepEqual(parseJobMatches({ matches: [{ job_id: frontend.id, score: 50, reasons: [], missing_skills: [] }] }, allowed), [])
  assert.deepEqual(parseJobMatches({ matches: [{ job_id: frontend.id, score: -5, reasons: ['ok'] }] }, allowed)[0].score, 0)
  for (const bad of ['not json', null, 42, {}, { matches: 'nope' }]) assert.equal(parseJobMatches(bad, allowed), null)
})

test('requestJobMatches sends the schema and prompt to Ollama and maps failures to typed errors', async () => {
  const options = { baseUrl: 'http://ollama.test:11434', model: 'llama3.1:8b' }
  let call
  const reply = content => async (url, init) => { call = { url, body: JSON.parse(init.body) }; return Response.json({ message: { content } }) }
  const content = JSON.stringify({ matches: [{ job_id: frontend.id, score: 80, reasons: ['React'], missing_skills: [] }] })

  const matches = await requestJobMatches('SEEKER', [frontend], { ...options, fetchImpl: reply(content) })
  assert.equal(call.url, 'http://ollama.test:11434/api/chat')
  assert.equal(call.body.model, 'llama3.1:8b')
  assert.equal(call.body.stream, false)
  assert.deepEqual(call.body.format, JOB_MATCH_SCHEMA)
  assert.equal(call.body.messages[0].content, JOB_MATCH_SYSTEM_PROMPT)
  assert.ok(call.body.messages[1].content.includes(frontend.id))
  assert.deepEqual(matches, [{ jobId: frontend.id, score: 80, reasons: ['React'], missingSkills: [] }])

  await assert.rejects(requestJobMatches('S', [frontend], { ...options, fetchImpl: async () => { throw new Error('ECONNREFUSED') } }), OllamaUnavailableError)
  await assert.rejects(requestJobMatches('S', [frontend], { ...options, fetchImpl: async () => new Response('down', { status: 500 }) }), OllamaUnavailableError)
  await assert.rejects(requestJobMatches('S', [frontend], { ...options, fetchImpl: async () => new Response('<html>') }), OllamaInvalidResponseError)
  await assert.rejects(requestJobMatches('S', [frontend], { ...options, fetchImpl: reply('{"wrong":true}') }), OllamaInvalidResponseError)
})

test('only postings with no deadline or a deadline of today or later are matched', () => {
  assert.equal(openDeadlineFilter('2026-11-19'), 'application_deadline.is.null,application_deadline.gte.2026-11-19')
  assert.match(openDeadlineFilter(), /^application_deadline\.is\.null,application_deadline\.gte\.\d{4}-\d{2}-\d{2}$/)
})
