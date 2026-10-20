import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { PGlite } from '@electric-sql/pglite'
import ts from 'typescript'

// Compile the pure helpers with the project's TypeScript version, no app server required.
const source = await readFile(new URL('../src/lib/resumes.ts', import.meta.url), 'utf8')
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText
const { validateResume, validateResumeName, MAX_RESUME_SIZE_BYTES } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`)

test('resume names are trimmed and limited to 120 safe characters', () => {
  assert.deepEqual(validateResumeName('Backend resume 2026.pdf'), { ok: true, name: 'Backend resume 2026.pdf' })
  assert.deepEqual(validateResumeName('  Frontend CV  '), { ok: true, name: 'Frontend CV' })
  assert.deepEqual(validateResumeName('x'.repeat(120)), { ok: true, name: 'x'.repeat(120) })
  for (const empty of ['', '   \t ', null, undefined, 42]) {
    assert.deepEqual(validateResumeName(empty), { ok: false, error: 'Enter a name for the resume.' })
  }
  assert.deepEqual(validateResumeName('x'.repeat(121)), { ok: false, error: 'Name must be 120 characters or fewer.' })
  for (const unsafe of ['a/b', 'a\\b', 'line\nbreak', 'nul\u0000', 'del\u007f']) {
    assert.deepEqual(validateResumeName(unsafe), { ok: false, error: 'Name cannot contain slashes or control characters.' })
  }
})

test('each file in a multi-file upload is validated by type, signature and size', async () => {
  const files = {
    pdf: new File(['%PDF-1.7 resume'], 'one.pdf'),
    docx: new File([new Uint8Array([0x50, 0x4b, 0x03, 0x04, 0x14])], 'two.DOCX'),
    badSignature: new File(['just text'], 'three.pdf'),
    empty: new File([], 'four.docx'),
    huge: new File([new Uint8Array(MAX_RESUME_SIZE_BYTES + 1)], 'five.pdf'),
    wrongType: new File(['%PDF-'], 'six.txt'),
  }
  const results = Object.fromEntries(await Promise.all(Object.entries(files).map(async ([key, file]) => [key, await validateResume(file)])))
  assert.deepEqual(results.pdf, { ok: true, extension: 'pdf', mimeType: 'application/pdf' })
  assert.equal(results.docx.ok, true)
  assert.equal(results.docx.extension, 'docx')
  assert.deepEqual(results.badSignature, { ok: false, error: 'This does not look like a valid .pdf file.' })
  assert.deepEqual(results.empty, { ok: false, error: 'The file is empty.' })
  assert.deepEqual(results.huge, { ok: false, error: 'The file is too large. Maximum size is 5 MB.' })
  assert.equal(results.wrongType.ok, false)
  assert.deepEqual(await validateResume(null), { ok: false, error: 'Choose a file to upload.' })
})

test('job seekers hold and rename many resumes of their own; recruiters cannot add any', async () => {
  const db = new PGlite()
  const id = n => `00000000-0000-0000-0000-${String(n).padStart(12, '0')}`
  const migration = await readFile(new URL('../supabase/migrations/0005_resumes.sql', import.meta.url), 'utf8')
  // Only the table and its policies; the storage.* bucket and policies need Supabase's storage schema.
  const tableSql = migration.slice(migration.indexOf('create table public.resumes'), migration.indexOf('create policy "Users can upload to their own resume folder"'))
  try {
    await db.exec(`create role authenticated; create schema auth;
      create table auth.users(id uuid primary key);
      create function auth.uid() returns uuid language sql stable as $$ select current_setting('request.jwt.claim.sub')::uuid $$;
      create type public.user_role as enum ('job_seeker', 'recruiter');
      create table public.profiles(id uuid primary key, role public.user_role);
      grant usage on schema public, auth to authenticated;
      grant select on public.profiles to authenticated;`)
    await db.exec(tableSql)
    await db.exec('grant select, insert, update, delete on public.resumes to authenticated')
    await db.query('insert into auth.users values ($1), ($2), ($3)', [id(1), id(2), id(3)])
    await db.query("insert into public.profiles values ($1, 'job_seeker'), ($2, 'job_seeker'), ($3, 'recruiter')", [id(1), id(2), id(3)])
    await db.exec('set role authenticated')
    const actAs = n => db.query("select set_config('request.jwt.claim.sub', $1, false)", [id(n)])
    const insert = (owner, name) => db.query("insert into public.resumes(user_id, file_name, storage_path, mime_type, size_bytes) values ($1, $2, $3, 'application/pdf', 10) returning id", [id(owner), name, `${id(owner)}/${name}`])

    await actAs(2)
    const othersResume = (await insert(2, 'other.pdf')).rows[0].id

    await actAs(1)
    const own = []
    for (const name of ['a.pdf', 'b.pdf', 'c.pdf']) own.push((await insert(1, name)).rows[0].id)
    assert.equal((await db.query('select * from public.resumes')).rows.length, 3)

    const renamed = await db.query('update public.resumes set file_name = $1, updated_at = now() where id = $2 returning file_name', ['Backend CV', own[0]])
    assert.deepEqual(renamed.rows, [{ file_name: 'Backend CV' }])

    const foreign = await db.query('update public.resumes set file_name = $1 where id = $2', ['Hijacked', othersResume])
    assert.equal(foreign.affectedRows, 0)
    await assert.rejects(insert(2, 'planted.pdf'), /row-level security/)

    await actAs(3)
    await assert.rejects(insert(3, 'recruiter.pdf'), /row-level security/)

    await db.exec('reset role')
    assert.equal((await db.query('select file_name from public.resumes where id = $1', [othersResume])).rows[0].file_name, 'other.pdf')
  } finally { await db.close() }
})
