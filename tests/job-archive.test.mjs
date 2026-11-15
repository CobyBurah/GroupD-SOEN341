import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import ts from 'typescript'
import { PGlite } from '@electric-sql/pglite'

// US-20: recruiters archive and restore postings. Real migrations run on PGlite; no shared Supabase.
const migration = name => readFile(new URL(`../supabase/migrations/${name}`, import.meta.url), 'utf8')
const id = n => `00000000-0000-0000-0000-${String(n).padStart(12, '0')}`

async function importTs(path, prelude = '') {
  let source = await readFile(new URL(path, import.meta.url), 'utf8')
  if (prelude) source = prelude + source.replace(/^import .* from .*$/gm, '')
  const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText
  return import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`)
}

test('dashboard helpers split active and archived postings and count applications per posting', async () => {
  const { splitPostings, countApplicationsByJob } = await importTs('../src/lib/recruiter-postings.ts')
  const jobs = [
    { id: 'a', archived_at: null },
    { id: 'b', archived_at: '2026-11-10T00:00:00Z' },
    { id: 'c', archived_at: null },
    { id: 'd', archived_at: '2026-11-12T00:00:00Z' },
  ]
  const { active, archived } = splitPostings(jobs)
  assert.deepEqual(active.map(job => job.id), ['a', 'c'], 'keeps the dashboard order')
  assert.deepEqual(archived.map(job => job.id), ['d', 'b'], 'most recently archived first')
  assert.deepEqual(splitPostings([]), { active: [], archived: [] })

  const counts = countApplicationsByJob([{ job_id: 'a' }, { job_id: 'a' }, { job_id: 'd' }, { job_id: null }])
  assert.equal(counts.get('a'), 2)
  assert.equal(counts.get('d'), 1)
  assert.equal(counts.get('c'), undefined)
})

test('setJobArchived scopes the update to the owner and active rows, and reports failures', async () => {
  const writes = [], invalidated = []
  let session = { ok: false, message: 'Only recruiters can manage job postings.' }
  let result = { data: { id: id(10) }, error: null }
  const query = {
    update(fields) { writes.push(['update', fields]); return this },
    eq(...args) { writes.push(['eq', ...args]); return this },
    is(...args) { writes.push(['is', ...args]); return this },
    select() { return this },
    maybeSingle: async () => result,
  }
  globalThis.__archiveTest = {
    recruiterSession: async () => session,
    revalidatePath: path => invalidated.push(path),
    redirect: path => { throw new Error(`REDIRECT:${path}`) },
    isJobId: value => /^[0-9a-f-]{36}$/.test(value),
    validateJob: () => ({}),
    isApplicationStatus: () => true,
  }
  const { setJobArchived } = await importTs('../src/app/(protected)/recruiter/actions.ts',
    'const { recruiterSession, revalidatePath, redirect, isJobId, validateJob, isApplicationStatus } = globalThis.__archiveTest;\n')
  const userId = id(1)

  await assert.rejects(setJobArchived(id(10), true), /REDIRECT:\/dashboard/)
  assert.equal(writes.length, 0, 'non-recruiters never write')

  session = { ok: true, userId, supabase: { from: () => query } }
  await assert.rejects(setJobArchived('forged', true), /notice=archive-failed/)
  assert.equal(writes.length, 0)

  await assert.rejects(setJobArchived(id(10), true), /REDIRECT:\/recruiter\?notice=archived/)
  assert.ok(writes[0][1].archived_at, 'archiving stamps archived_at')
  assert.ok(writes.some(x => x[0] === 'eq' && x[1] === 'recruiter_id' && x[2] === userId))
  assert.ok(writes.some(x => x[0] === 'is' && x[1] === 'deleted_at' && x[2] === null))
  assert.ok(invalidated.includes('/jobs') && invalidated.includes('/recruiter'))

  writes.length = 0
  await assert.rejects(setJobArchived(id(10), false), /notice=restored/)
  assert.equal(writes[0][1].archived_at, null, 'restoring clears archived_at')

  result = { data: null, error: null }
  await assert.rejects(setJobArchived(id(10), false), /notice=restore-failed/)
  result = { data: null, error: { message: 'Database error' } }
  await assert.rejects(setJobArchived(id(10), true), /notice=archive-failed/)
  delete globalThis.__archiveTest
})

test('archived postings keep applications, block new ones, skip reminders and can be restored (real RLS)', async () => {
  const db = new PGlite()
  const [recruiter, otherRecruiter, seeker, dualUser] = [1, 2, 3, 4].map(id)
  const [openJob, archivedJob] = [10, 11].map(id)
  try {
    await db.exec(`create role authenticated; create role anon; create schema auth;
      create table auth.users (id uuid primary key, raw_user_meta_data jsonb);
      create function auth.uid() returns uuid language sql stable as
        $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
      grant usage on schema public, auth to authenticated;
      grant execute on function auth.uid() to authenticated;`)
    await db.exec(await migration('0001_profiles.sql'))
    await db.exec(await migration('0006_jobs.sql'))
    await db.exec('grant select, insert, update, delete on public.jobs to authenticated; grant select on public.profiles to authenticated;')
    await db.exec(await migration('0007_recruiter_job_management.sql'))
    await db.exec(`create table public.resumes (id uuid primary key, user_id uuid);
      grant select on public.resumes to authenticated;`)
    await db.exec(await migration('0008_applications.sql'))
    await db.exec('grant select, insert on public.applications to authenticated')
    await db.exec(await migration('0011_favourites.sql'))
    await db.exec('grant select, insert, delete on public.favourites to authenticated')
    await db.exec(await migration('0017_notifications.sql'))
    await db.query(`insert into auth.users values ($1, '{"role":"recruiter"}'), ($2, '{"role":"recruiter"}'),
      ($3, '{"role":"job_seeker"}'), ($4, '{"role":"job_seeker"}')`, [recruiter, otherRecruiter, seeker, dualUser])
    await db.exec(await migration('0018_dual_roles.sql'))
    await db.exec(await migration('0019_job_archive.sql'))

    await db.query(`insert into public.jobs (id, recruiter_id, title, company, description, application_deadline)
      values ($1, $3, 'Open role', 'Example', 'Description', (now() at time zone 'UTC')::date + 1),
             ($2, $3, 'Closing role', 'Example', 'Description', (now() at time zone 'UTC')::date + 1)`, [openJob, archivedJob, recruiter])
    await db.query('insert into public.resumes values ($1, $2), ($3, $4)', [id(20), seeker, id(21), dualUser])

    async function asUser(user, fn) {
      await db.query("select set_config('request.jwt.claim.sub', $1, false)", [user])
      await db.exec('set role authenticated')
      try { return await fn() } finally { await db.exec('reset role') }
    }
    const apply = (user, job, resume) => db.query('insert into public.applications (job_id, user_id, resume_id) values ($1, $2, $3)', [job, user, resume])

    // The seeker applies and saves both jobs while they are open.
    await asUser(seeker, async () => {
      await apply(seeker, archivedJob, id(20))
      await db.query('insert into public.favourites (user_id, job_id) values ($1, $2), ($1, $3)', [seeker, openJob, archivedJob])
    })

    // Only the owner can archive.
    await asUser(otherRecruiter, async () => {
      assert.equal((await db.query('update public.jobs set archived_at = now() where id = $1 returning id', [archivedJob])).rows.length, 0)
    })
    await asUser(recruiter, async () => {
      assert.equal((await db.query('update public.jobs set archived_at = now() where id = $1 returning id', [archivedJob])).rows.length, 1)
      // The recruiter still sees the archived posting (its applications are read via 0009's policies).
      assert.equal((await db.query('select id from public.jobs where id = $1', [archivedJob])).rows.length, 1)
    })
    assert.equal((await db.query('select id from public.applications where job_id = $1', [archivedJob])).rows.length, 1, 'application kept')

    await asUser(seeker, async () => {
      // An applicant can still read the archived job for their history.
      assert.equal((await db.query('select id from public.jobs where id = $1', [archivedJob])).rows.length, 1)
      await assert.rejects(db.query('insert into public.favourites (user_id, job_id) values ($1, $2)', [seeker, id(99)]))
      await db.query('delete from public.favourites where job_id = $1', [archivedJob])
      await assert.rejects(db.query('insert into public.favourites (user_id, job_id) values ($1, $2)', [seeker, archivedJob]), /row-level security/)
      await db.exec('select public.refresh_deadline_reminders()')
      const reminders = (await db.query("select message from public.notifications where kind = 'deadline'")).rows
      assert.deepEqual(reminders.map(r => r.message.includes('Open role')), [true], 'only the open job gets a reminder')
    })
    await asUser(dualUser, async () => {
      await assert.rejects(apply(dualUser, archivedJob, id(21)), /row-level security/, 'archived postings refuse applications')
    })

    // Dual-role users keep seeker reminders while in recruiter mode.
    await asUser(dualUser, async () => {
      await apply(dualUser, openJob, id(21))
      await db.query("select public.add_role('recruiter')")
      assert.equal((await db.query("select public.set_active_role('recruiter') as role")).rows[0].role, 'recruiter')
      await db.exec('select public.refresh_deadline_reminders()')
      assert.equal((await db.query("select count(*)::int as n from public.notifications where kind = 'deadline'")).rows[0].n, 1)
    })

    // Restoring reopens the posting to applications.
    await asUser(recruiter, async () => {
      assert.equal((await db.query('update public.jobs set archived_at = null where id = $1 returning id', [archivedJob])).rows.length, 1)
    })
    await asUser(dualUser, async () => {
      await db.query("select public.set_active_role('job_seeker')")
      await apply(dualUser, archivedJob, id(21))
    })
    assert.equal((await db.query('select count(*)::int as n from public.applications where job_id = $1', [archivedJob])).rows[0].n, 2)
  } finally { await db.close() }
})

test('security hardening revokes RPC access to trigger and account functions', async () => {
  const db = new PGlite()
  try {
    await db.exec(`create role authenticated; create role anon; create schema auth;
      create table auth.users (id uuid primary key, raw_user_meta_data jsonb, raw_user_meta_data_backup jsonb);
      create function auth.uid() returns uuid language sql stable as
        $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
      grant usage on schema public, auth to authenticated, anon;`)
    await db.exec(await migration('0001_profiles.sql'))
    await db.exec(await migration('0002_delete_account.sql'))
    await db.exec(await migration('0003_sync_profile_name.sql'))
    await db.exec(`create table public.resumes (id uuid primary key, user_id uuid);
      create table public.applications (id uuid primary key, user_id uuid, resume_id uuid);
      create table public.resume_feedback (id uuid primary key, user_id uuid);`)
    await db.exec(await migration('0020_security_hardening.sql'))
    const can = async (role, fn) => (await db.query('select has_function_privilege($1, $2, \'execute\') as ok', [role, fn])).rows[0].ok
    assert.equal(await can('anon', 'public.delete_own_account()'), false)
    assert.equal(await can('authenticated', 'public.delete_own_account()'), true)
    for (const fn of ['public.handle_new_user()', 'public.sync_profile_name_to_auth()']) {
      assert.equal(await can('anon', fn), false, fn)
      assert.equal(await can('authenticated', fn), false, fn)
    }
    // The signup trigger still fires after the revoke.
    await db.query(`insert into auth.users (id, raw_user_meta_data) values ($1, '{"role":"recruiter","full_name":"R"}')`, [id(1)])
    assert.equal((await db.query('select role::text from public.profiles where id = $1', [id(1)])).rows[0].role, 'recruiter')
    const indexes = (await db.query("select indexname from pg_indexes where schemaname = 'public'")).rows.map(r => r.indexname)
    for (const name of ['applications_user_id_idx', 'applications_resume_id_idx', 'resume_feedback_user_id_idx', 'resumes_user_id_idx']) {
      assert.ok(indexes.includes(name), name)
    }
  } finally { await db.close() }
})
