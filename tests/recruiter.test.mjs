import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import ts from 'typescript'
import { PGlite } from '@electric-sql/pglite'

// Compile the pure validator with the project's TypeScript version, no app server required.
const source = await readFile(new URL('../src/lib/job-posting.ts', import.meta.url), 'utf8')
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText
const { validateJob, isJobId } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`)
function form(overrides = {}) {
  const data = new FormData()
  for (const [key, value] of Object.entries({ title: 'Developer', company: 'Example', description: 'Build useful software.', ...overrides })) data.set(key, value)
  return data
}
test('posting validation trims text, accepts optional blanks, and ignores forged ownership', () => {
  const result = validateJob(form({ title: '  Developer  ', recruiter_id: 'another-user' }))
  assert.equal(result.valid, true)
  assert.equal(result.values.title, 'Developer')
  assert.equal(result.values.salary, '')
  assert.equal(Object.hasOwn(result.values, 'recruiter_id'), false)
})
test('reject missing, oversized, invalid employment and file inputs without dropping entered values', () => {
  const data = form({ title: ' ', company: 'x'.repeat(151), employment_type: 'invented', location: 'Montreal' })
  data.set('description', new Blob(['not text']), 'resume.pdf')
  const result = validateJob(data)
  assert.equal(result.valid, false)
  for (const key of ['title', 'company', 'employment_type', 'description']) assert.ok(result.errors[key])
  assert.equal(result.values.location, 'Montreal')
  assert.equal(validateJob(form({ employment_type: 'internship' })).valid, true)
  assert.equal(validateJob(form({ employment_type: '__proto__' })).valid, false)
  assert.equal(isJobId('invalid'), false)
  assert.equal(isJobId('00000000-0000-0000-0000-000000000001'), true)
})

test('actual Postgres RLS enforces recruiter role, ownership, deletion and history visibility', async () => {
  const db = new PGlite()
  const recruiter = '00000000-0000-0000-0000-000000000001'
  const other = '00000000-0000-0000-0000-000000000002'
  const seeker = '00000000-0000-0000-0000-000000000003'
  const job = '00000000-0000-0000-0000-000000000010'
  try {
    // Minimal Supabase auth harness; execute the repository's actual migrations below.
    await db.exec(`create role authenticated; create schema auth;
      create table auth.users (id uuid primary key, raw_user_meta_data jsonb);
      create function auth.uid() returns uuid language sql stable as
        $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
      grant usage on schema public, auth to authenticated;
      grant execute on function auth.uid() to authenticated;`)
    await db.exec(await readFile(new URL('../supabase/migrations/0001_profiles.sql', import.meta.url), 'utf8'))
    await db.exec(await readFile(new URL('../supabase/migrations/0006_jobs.sql', import.meta.url), 'utf8'))
    // Supabase's public schema default privileges, before the new migration's explicit revoke.
    await db.exec('grant select, insert, update, delete on public.jobs to authenticated; grant select on public.profiles to authenticated;')
    await db.exec(await readFile(new URL('../supabase/migrations/0007_recruiter_job_management.sql', import.meta.url), 'utf8'))
    await db.query(`insert into auth.users values ($1, '{"role":"recruiter"}'), ($2, '{"role":"recruiter"}'), ($3, '{"role":"job_seeker"}')`, [recruiter, other, seeker])
    await db.exec(await readFile(new URL('../supabase/migrations/0012_job_location_fields.sql', import.meta.url), 'utf8'))
    await db.exec(await readFile(new URL('../supabase/migrations/0013_workplace_type.sql', import.meta.url), 'utf8'))
    async function asUser(id, fn) {
      await db.query("select set_config('request.jwt.claim.sub', $1, false)", [id])
      await db.exec('set role authenticated')
      try { return await fn() } finally { await db.exec('reset role') }
    }
    const insert = (owner, id = job) => db.query(`insert into public.jobs (id,recruiter_id,title,company,description) values ($1,$2,'Engineer','Example','Description')`, [id, owner])
    await asUser(recruiter, () => insert(recruiter))
    await asUser(seeker, async () => {
      await assert.rejects(insert(seeker, '00000000-0000-0000-0000-000000000011'), /row-level security/)
      assert.equal((await db.query(`update public.jobs set title='Hijacked' where id=$1 returning id`, [job])).rows.length, 0)
      assert.equal((await db.query('select id from public.jobs')).rows.length, 1)
    })
    await asUser(other, async () => {
      await assert.rejects(insert(recruiter, '00000000-0000-0000-0000-000000000012'), /row-level security/)
      assert.equal((await db.query(`update public.jobs set title='Hijacked' where id=$1 returning id`, [job])).rows.length, 0)
      assert.equal((await db.query(`update public.jobs set deleted_at=now() where id=$1 returning id`, [job])).rows.length, 0)
    })
    await asUser(recruiter, async () => {
      await assert.rejects(db.query('update public.jobs set recruiter_id=$1 where id=$2', [other, job]), /row-level security/)
      assert.equal((await db.query(`update public.jobs set title='Updated' where id=$1 returning title`, [job])).rows[0].title, 'Updated')
      await assert.rejects(db.query('delete from public.jobs where id=$1', [job]), /permission denied/)
      assert.equal((await db.query('update public.jobs set deleted_at=now() where id=$1 returning id', [job])).rows.length, 1)
      assert.equal((await db.query('select id from public.jobs where deleted_at is null')).rows.length, 0)
      assert.equal((await db.query('select id from public.jobs')).rows.length, 1, 'owner retains history')
      assert.equal((await db.query('update public.jobs set deleted_at=null where id=$1 returning id', [job])).rows.length, 0, 'cannot restore a deleted posting')
    })
    for (const id of [seeker, other, '']) await asUser(id, async () => {
      assert.equal((await db.query('select id from public.jobs')).rows.length, 0)
    })
    assert.equal((await db.query('select id from public.jobs')).rows.length, 1, 'underlying row preserved')
  } finally { await db.close() }
})

test('server actions reject unauthorized mutations, preserve validation input and scope writes to the owner', async () => {
  let session = { ok: false, message: 'Only recruiters can manage job postings.' }
  let writes = [], invalidated = [], result = { data: { id: '00000000-0000-0000-0000-000000000010' }, error: null }
  const mock = {
    recruiterSession: async () => session,
    revalidatePath: path => invalidated.push(path),
    redirect: path => { throw new Error(`REDIRECT:${path}`) },
    isJobId, validateJob,
  }
  globalThis.__recruiterTest = mock
  let actionSource = await readFile(new URL('../src/app/(protected)/recruiter/actions.ts', import.meta.url), 'utf8')
  actionSource = actionSource.replace(/^import .* from .*$/gm, '')
  actionSource = `const { recruiterSession, revalidatePath, redirect, isJobId, validateJob } = globalThis.__recruiterTest;\n${actionSource}`
  const actionJs = ts.transpileModule(actionSource, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText
  const { saveJob, deleteJob } = await import(`data:text/javascript;base64,${Buffer.from(actionJs).toString('base64')}`)
  const id = '00000000-0000-0000-0000-000000000010'
  const userId = '00000000-0000-0000-0000-000000000001'
  assert.match((await saveJob(null, {}, form())).message, /Only recruiters/)
  assert.match((await deleteJob(id, {}, form())).message, /Only recruiters/)
  const query = {
    insert(fields) { writes.push(['insert', fields]); return this },
    update(fields) { writes.push(['update', fields]); return this },
    eq(...args) { writes.push(['eq', ...args]); return this },
    is(...args) { writes.push(['is', ...args]); return this },
    select() { return this },
    single: async () => result,
    maybeSingle: async () => result,
  }
  session = { ok: true, userId, supabase: { from: () => query } }
  const invalid = await saveJob(null, {}, form({ title: '', location: 'Montreal' }))
  assert.equal(invalid.values.location, 'Montreal')
  assert.equal(writes.length, 0)
  assert.match((await saveJob('forged-id', {}, form())).message, /unavailable/)
  assert.equal(writes.length, 0)
  await assert.rejects(saveJob(null, {}, form({ recruiter_id: 'forged-owner' })), /REDIRECT:\/recruiter\?notice=created/)
  assert.equal(writes[0][1].recruiter_id, userId)
  assert.ok(invalidated.includes('/jobs'))
  writes = []
  await assert.rejects(saveJob(id, {}, form()), /notice=updated/)
  assert.ok(writes.some(x => x[0] === 'eq' && x[1] === 'recruiter_id' && x[2] === userId))
  assert.ok(writes.some(x => x[0] === 'is' && x[1] === 'deleted_at' && x[2] === null))
  result = { data: null, error: null }
  assert.match((await saveJob(id, {}, form())).message, /unavailable/)
  writes = []
  assert.match((await deleteJob(id, {}, form())).message, /Confirm/)
  assert.equal(writes.length, 0)
  result = { data: { id }, error: null }
  await assert.rejects(deleteJob(id, {}, form({ confirmDelete: 'on' })), /notice=deleted/)
  assert.ok(writes[0][1].deleted_at)
  result = { data: null, error: { message: 'Database error' } }
  assert.match((await saveJob(id, {}, form())).message, /Could not save/)
  delete globalThis.__recruiterTest
})

test('posting validation accepts listed job options and only accepts selected locations', () => {
  const valid = validateJob(form({
    category: 'Marketing',
    workplace_type: 'hybrid',
    employment_type: 'full_time',
    location: 'Montreal, Quebec, Canada',
    location_city: 'Montreal',
    location_region: 'Quebec',
    location_country: 'Canada',
  }))

  assert.equal(valid.valid, true)

  const typedOnly = form()
  typedOnly.set('location_search', 'Montreal')
  const typedResult = validateJob(typedOnly)

  assert.equal(typedResult.valid, false)
  assert.ok(typedResult.errors.location)

  assert.equal(validateJob(form({ category: 'Fake Category' })).valid, false)
  assert.equal(validateJob(form({ workplace_type: 'office' })).valid, false)
})