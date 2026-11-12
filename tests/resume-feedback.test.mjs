import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { crc32 } from 'node:zlib'
import { PGlite } from '@electric-sql/pglite'
import ts from 'typescript'
import { extractText } from 'unpdf'
import mammoth from 'mammoth'

// Compile the TS helpers with the project's TypeScript version, no app server required.
const compile = async (path, rewrite = s => s) => {
  const source = rewrite(await readFile(new URL(`../src/lib/${path}`, import.meta.url), 'utf8'))
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText
  return `data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`
}
const feedbackUrl = await compile('resume-feedback.ts')
const {
  parseResumeFeedback, prepareResumeText, RESUME_FEEDBACK_SCHEMA, RESUME_FEEDBACK_SYSTEM_PROMPT,
  MAX_RESUME_TEXT_CHARS, MIN_RESUME_TEXT_CHARS,
} = await import(feedbackUrl)
const { requestResumeFeedback, getOllamaConfig, OllamaUnavailableError, OllamaInvalidResponseError } = await import(
  await compile('ollama.ts', s => s.replace("from '@/lib/resume-feedback'", `from '${feedbackUrl}'`))
)
// Bare package specifiers cannot resolve from a data: URL, so inject them.
globalThis.__resumeText = { extractText, mammoth }
const { extractResumeText, UnsupportedResumeTypeError, ResumeTextExtractionError } = await import(
  await compile('resume-text.ts', s => `const { extractText, mammoth } = globalThis.__resumeText;\n${s.replace(/^import .* from .*$/gm, '')}`)
)

const PDF = 'application/pdf'
const DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

test('parseResumeFeedback accepts objects and JSON strings, trims and caps, and rejects anything malformed', () => {
  const valid = { summary: '  Solid resume.  ', strengths: [' Clear layout ', 'Quantified impact'], improvements: ['Add links'] }
  assert.deepEqual(parseResumeFeedback(valid), { summary: 'Solid resume.', strengths: ['Clear layout', 'Quantified impact'], improvements: ['Add links'] })
  assert.deepEqual(parseResumeFeedback(JSON.stringify(valid)), parseResumeFeedback(valid))

  // One empty list is fine; non-strings and blank items are dropped.
  assert.deepEqual(parseResumeFeedback({ summary: 'S', strengths: [], improvements: ['x', 3, '  ', null] }), { summary: 'S', strengths: [], improvements: ['x'] })

  // Caps: 8 items, 600 chars per item, 1500 chars of summary.
  const capped = parseResumeFeedback({ summary: 's'.repeat(2000), strengths: Array.from({ length: 12 }, (_, i) => `item ${i}`), improvements: ['y'.repeat(900)] })
  assert.equal(capped.summary.length, 1500)
  assert.deepEqual(capped.strengths, Array.from({ length: 8 }, (_, i) => `item ${i}`))
  assert.equal(capped.improvements[0].length, 600)

  for (const bad of [
    '{not json', '', 'null', '42', null, undefined, 42, [],
    { strengths: ['a'], improvements: ['b'] }, // missing summary
    { summary: 'S', improvements: ['b'] }, // missing strengths
    { summary: 'S', strengths: ['a'] }, // missing improvements
    { summary: 7, strengths: ['a'], improvements: ['b'] },
    { summary: 'S', strengths: 'a', improvements: ['b'] },
    { summary: 'S', strengths: ['a'], improvements: { 0: 'b' } },
    { summary: '   ', strengths: ['a'], improvements: ['b'] },
    { summary: 'S', strengths: [], improvements: [] },
    { summary: 'S', strengths: ['  '], improvements: [5] },
  ]) assert.equal(parseResumeFeedback(bad), null, JSON.stringify(bad))
})

test('prepareResumeText normalizes whitespace and truncates to the cap', () => {
  assert.equal(prepareResumeText('  Jane\t\t Doe \r\nEngineer\r\r\n\n\n\nSkills:   Go  '), 'Jane Doe \nEngineer\n\nSkills: Go')
  assert.equal(prepareResumeText(' \n\t '), '')
  const long = prepareResumeText('a'.repeat(MAX_RESUME_TEXT_CHARS + 500))
  assert.equal(long.length, MAX_RESUME_TEXT_CHARS)
  assert.equal(MAX_RESUME_TEXT_CHARS, 12000)
  assert.equal(MIN_RESUME_TEXT_CHARS, 50)
})

test('requestResumeFeedback posts a non-streaming, schema-constrained chat request and parses the reply', async () => {
  const feedback = { summary: 'Good.', strengths: ['Clear'], improvements: ['Quantify'] }
  let call
  const fetchImpl = async (url, init) => { call = { url, init }; return Response.json({ message: { role: 'assistant', content: JSON.stringify(feedback) } }) }
  const result = await requestResumeFeedback('RESUME TEXT', { baseUrl: 'http://ollama.test:11434', model: 'llama3.1:8b', fetchImpl })
  assert.deepEqual(result, feedback)
  assert.equal(call.url, 'http://ollama.test:11434/api/chat')
  assert.equal(call.init.method, 'POST')
  const body = JSON.parse(call.init.body)
  assert.equal(body.stream, false)
  assert.equal(body.model, 'llama3.1:8b')
  assert.deepEqual(body.format, RESUME_FEEDBACK_SCHEMA)
  assert.deepEqual(body.messages.map(m => m.role), ['system', 'user'])
  assert.equal(body.messages[0].content, RESUME_FEEDBACK_SYSTEM_PROMPT)
  assert.match(body.messages[1].content, /RESUME TEXT/)
  assert.ok(call.init.signal instanceof AbortSignal)
})

test('requestResumeFeedback maps network, HTTP and content failures to typed errors', async () => {
  const opts = fetchImpl => ({ baseUrl: 'http://127.0.0.1:11434', model: 'llama3.1:8b', fetchImpl })
  await assert.rejects(requestResumeFeedback('x', opts(async () => { throw new TypeError('fetch failed') })),
    e => e instanceof OllamaUnavailableError && /Could not reach Ollama/.test(e.message) && e.cause instanceof TypeError)
  await assert.rejects(requestResumeFeedback('x', opts(async () => new Response('boom', { status: 500 }))),
    e => e instanceof OllamaUnavailableError && /500/.test(e.message))
  await assert.rejects(requestResumeFeedback('x', opts(async () => new Response('{"error":"model \\"llama3.1:8b\\" not found, try pulling it first"}', { status: 404 }))),
    e => e instanceof OllamaUnavailableError && e.message.includes('ollama pull llama3.1:8b'))
  // A 404 that is not about the model is still "unavailable", without the pull hint.
  await assert.rejects(requestResumeFeedback('x', opts(async () => new Response('404 page not found', { status: 404 }))),
    e => e instanceof OllamaUnavailableError && !e.message.includes('ollama pull'))
  for (const reply of [
    () => new Response('not json', { status: 200 }),
    () => Response.json({ message: { content: 'plain prose, not JSON' } }),
    () => Response.json({ message: { content: JSON.stringify({ summary: 'S' }) } }),
    () => Response.json({ done: true }),
    () => Response.json(null),
  ]) await assert.rejects(requestResumeFeedback('x', opts(async () => reply())), OllamaInvalidResponseError)
})

test('getOllamaConfig defaults to local IPv4 llama3.1:8b and honours trimmed env overrides', () => {
  const saved = { base: process.env.OLLAMA_BASE_URL, model: process.env.OLLAMA_MODEL }
  try {
    delete process.env.OLLAMA_BASE_URL; delete process.env.OLLAMA_MODEL
    assert.deepEqual(getOllamaConfig(), { baseUrl: 'http://127.0.0.1:11434', model: 'llama3.1:8b' })
    process.env.OLLAMA_BASE_URL = '   '; process.env.OLLAMA_MODEL = ''
    assert.deepEqual(getOllamaConfig(), { baseUrl: 'http://127.0.0.1:11434', model: 'llama3.1:8b' })
    process.env.OLLAMA_BASE_URL = ' http://gpu-box:11434// '; process.env.OLLAMA_MODEL = ' qwen2.5:7b '
    assert.deepEqual(getOllamaConfig(), { baseUrl: 'http://gpu-box:11434', model: 'qwen2.5:7b' })
  } finally {
    for (const [key, value] of [['OLLAMA_BASE_URL', saved.base], ['OLLAMA_MODEL', saved.model]]) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value
    }
  }
})

// A minimal one-page PDF using the standard Helvetica font, with a correct xref table.
function minimalPdf(lines) {
  const stream = `BT /F1 12 Tf 72 720 Td 14 TL ${lines.map(l => `(${l}) Tj T*`).join(' ')} ET`
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ]
  let pdf = '%PDF-1.4\n'
  const offsets = objects.map((body, i) => { const at = pdf.length; pdf += `${i + 1} 0 obj\n${body}\nendobj\n`; return at })
  const xref = pdf.length
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.map(o => `${String(o).padStart(10, '0')} 00000 n \n`).join('')}`
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`
  return new Uint8Array(Buffer.from(pdf, 'latin1'))
}

// A minimal stored (uncompressed) zip, enough for a DOCX that mammoth can read.
function zip(files) {
  const locals = [], centrals = []
  let offset = 0
  for (const [name, text] of Object.entries(files)) {
    const nameBytes = Buffer.from(name), data = Buffer.from(text), crc = crc32(data)
    const local = Buffer.alloc(30); local.writeUInt32LE(0x04034b50, 0); local.writeUInt16LE(20, 4)
    local.writeUInt32LE(crc, 14); local.writeUInt32LE(data.length, 18); local.writeUInt32LE(data.length, 22); local.writeUInt16LE(nameBytes.length, 26)
    const central = Buffer.alloc(46); central.writeUInt32LE(0x02014b50, 0); central.writeUInt16LE(20, 4); central.writeUInt16LE(20, 6)
    central.writeUInt32LE(crc, 16); central.writeUInt32LE(data.length, 20); central.writeUInt32LE(data.length, 24); central.writeUInt16LE(nameBytes.length, 28); central.writeUInt32LE(offset, 42)
    locals.push(local, nameBytes, data); centrals.push(central, nameBytes)
    offset += 30 + nameBytes.length + data.length
  }
  const centralSize = centrals.reduce((n, b) => n + b.length, 0)
  const end = Buffer.alloc(22); end.writeUInt32LE(0x06054b50, 0)
  end.writeUInt16LE(Object.keys(files).length, 8); end.writeUInt16LE(Object.keys(files).length, 10); end.writeUInt32LE(centralSize, 12); end.writeUInt32LE(offset, 16)
  return new Uint8Array(Buffer.concat([...locals, ...centrals, end]))
}

function minimalDocx(paragraphs) {
  return zip({
    '[Content_Types].xml': '<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>',
    '_rels/.rels': '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>',
    'word/document.xml': `<?xml version="1.0" encoding="UTF-8"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${paragraphs.map(p => `<w:p><w:r><w:t>${p}</w:t></w:r></w:p>`).join('')}</w:body></w:document>`,
  })
}

test('extractResumeText reads real PDF and DOCX text and types its failures', async () => {
  const pdfText = await extractResumeText(minimalPdf(['Jane Doe Software Engineer', 'Built payment APIs in Go']), PDF)
  assert.match(pdfText, /Jane Doe Software Engineer/)
  assert.match(pdfText, /Built payment APIs in Go/)

  const docxText = await extractResumeText(minimalDocx(['John Roe', 'Data Analyst at Acme']), DOCX)
  assert.match(docxText, /John Roe/)
  assert.match(docxText, /Data Analyst at Acme/)

  await assert.rejects(extractResumeText(new Uint8Array([1, 2, 3]), 'text/plain'),
    e => e instanceof UnsupportedResumeTypeError && e.message.includes('text/plain'))
  const garbage = new Uint8Array(Buffer.from('this is not a real document at all'))
  await assert.rejects(extractResumeText(garbage, PDF), e => e instanceof ResumeTextExtractionError && /PDF/.test(e.message))
  await assert.rejects(extractResumeText(garbage, DOCX), e => e instanceof ResumeTextExtractionError && /DOCX/.test(e.message))
})

test('resume feedback is private to its owner, job-seeker-only to write, and removed with its resume', async () => {
  const db = new PGlite()
  const id = n => `00000000-0000-0000-0000-${String(n).padStart(12, '0')}`
  const migration = name => readFile(new URL(`../supabase/migrations/${name}`, import.meta.url), 'utf8')
  const resumesSql = await migration('0005_resumes.sql')
  // Only the table and its policies; the storage.* bucket and policies need Supabase's storage schema.
  const tableSql = resumesSql.slice(resumesSql.indexOf('create table public.resumes'), resumesSql.indexOf('create policy "Users can upload to their own resume folder"'))
  try {
    await db.exec(`create role authenticated; create schema auth;
      create table auth.users(id uuid primary key);
      create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
      create type public.user_role as enum ('job_seeker', 'recruiter');
      create table public.profiles(id uuid primary key, role public.user_role);
      grant usage on schema public, auth to authenticated;
      grant select on public.profiles to authenticated;`)
    await db.exec(tableSql)
    await db.exec(await migration('0016_resume_feedback.sql'))
    await db.exec('grant select, insert, update, delete on public.resumes, public.resume_feedback to authenticated')
    await db.query('insert into auth.users values ($1), ($2), ($3)', [id(1), id(2), id(3)])
    await db.query("insert into public.profiles values ($1, 'job_seeker'), ($2, 'job_seeker'), ($3, 'recruiter')", [id(1), id(2), id(3)])
    const resumeOf = async owner => (await db.query("insert into public.resumes(user_id, file_name, storage_path, mime_type, size_bytes) values ($1, 'cv.pdf', $2, 'application/pdf', 10) returning id", [id(owner), `${id(owner)}/cv.pdf`])).rows[0].id
    const ownResume = await resumeOf(1)
    const othersResume = await resumeOf(2)
    // A recruiter row in resumes is impossible through RLS, but seed one to prove the role check alone blocks feedback.
    const recruiterResume = await resumeOf(3)

    await db.exec('set role authenticated')
    const actAs = n => db.query("select set_config('request.jwt.claim.sub', $1, false)", [id(n)])
    const feedback = JSON.stringify({ summary: 'Good', strengths: ['a'], improvements: ['b'] })
    const insert = (resume, user) => db.query("insert into public.resume_feedback(resume_id, user_id, model_name, feedback) values ($1, $2, 'llama3.1:8b', $3) returning id", [resume, id(user), feedback])

    await actAs(1)
    await insert(ownResume, 1)
    await insert(ownResume, 1) // regenerate appends
    const own = await db.query('select resume_id, model_name, feedback from public.resume_feedback')
    assert.equal(own.rows.length, 2)
    assert.deepEqual(own.rows[0], { resume_id: ownResume, model_name: 'llama3.1:8b', feedback: JSON.parse(feedback) })
    // Someone else's resume, whether claimed as theirs or as mine.
    await assert.rejects(insert(othersResume, 1), /row-level security/)
    await assert.rejects(insert(othersResume, 2), /row-level security/)

    await actAs(2)
    assert.equal((await db.query('select * from public.resume_feedback')).rows.length, 0)
    assert.equal((await db.query('delete from public.resume_feedback')).affectedRows, 0)

    await actAs(3)
    assert.equal((await db.query('select * from public.resume_feedback')).rows.length, 0)
    await assert.rejects(insert(recruiterResume, 3), /row-level security/)

    await db.exec('reset role')
    assert.equal((await db.query('select count(*)::int as n from public.resume_feedback')).rows[0].n, 2)
    await db.query('delete from public.resumes where id = $1', [ownResume])
    assert.equal((await db.query('select count(*)::int as n from public.resume_feedback')).rows[0].n, 0)
  } finally { await db.close() }
})
