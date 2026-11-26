import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import ts from 'typescript'
import { PGlite } from '@electric-sql/pglite'

// Sprint 4 bug fix: application deadlines are enforced in validation, the apply
// flow and Postgres RLS. Real migrations run on PGlite; no shared Supabase.
const migration = name => readFile(new URL(`../supabase/migrations/${name}`, import.meta.url), 'utf8')
const id = n => `00000000-0000-0000-0000-${String(n).padStart(12, '0')}`

const source = await readFile(new URL('../src/lib/job-posting.ts', import.meta.url), 'utf8')
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText
const { validateJob, isPastDeadline, todayUtc } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`)

function form(overrides = {}) {
  const data = new FormData()
  for (const [key, value] of Object.entries({ title: 'Developer', company: 'Example', description: 'Build useful software.', ...overrides })) data.set(key, value)
  return data
}

test('todayUtc and isPastDeadline treat the deadline day as still open', () => {
  assert.equal(todayUtc(new Date('2026-11-19T23:59:59Z')), '2026-11-19')
  assert.equal(todayUtc(new Date('2026-11-20T00:00:00Z')), '2026-11-20')
  assert.equal(isPastDeadline('2026-11-18', '2026-11-19'), true)
  assert.equal(isPastDeadline('2026-11-19', '2026-11-19'), false, 'open through the deadline day')
  assert.equal(isPastDeadline('2026-12-01', '2026-11-19'), false)
  assert.equal(isPastDeadline(null, '2026-11-19'), false, 'no deadline never closes')
  assert.equal(isPastDeadline('', '2026-11-19'), false)
})

test('a posting cannot be published or edited with a deadline in the past', () => {
  const today = '2026-11-19'
  const past = validateJob(form({ application_deadline: '2026-11-01' }), today)
  assert.equal(past.valid, false)
  assert.match(past.errors.application_deadline, /today or a later date/)
  assert.equal(past.values.application_deadline, '2026-11-01', 'keeps what the recruiter typed')
  assert.equal(validateJob(form({ application_deadline: today }), today).valid, true)
  assert.equal(validateJob(form({ application_deadline: '2027-01-15' }), today).valid, true)
  assert.equal(validateJob(form({ application_deadline: '' }), today).valid, true, 'deadline stays optional')
  assert.match(validateJob(form({ application_deadline: '2026-02-30' }), today).errors.application_deadline, /valid deadline/)
})

test('RLS rejects applications after the deadline but accepts open and undated postings', async () => {
  const db = new PGlite()
  const [recruiter, seeker] = [1, 2].map(id)
  const [expired, closesToday, undated] = [10, 11, 12].map(id)
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
    await db.exec(await migration('0017_notifications.sql'))
    await db.query(`insert into auth.users values ($1, '{"role":"recruiter"}'), ($2, '{"role":"job_seeker"}')`, [recruiter, seeker])
    await db.exec(await migration('0018_dual_roles.sql'))
    await db.exec(await migration('0019_job_archive.sql'))
    await db.exec(await migration('0021_application_deadline.sql'))

    await db.query(`insert into public.jobs (id, recruiter_id, title, company, description, application_deadline) values
      ($1, $4, 'Expired', 'Example', 'Description', (now() at time zone 'UTC')::date - 1),
      ($2, $4, 'Closes today', 'Example', 'Description', (now() at time zone 'UTC')::date),
      ($3, $4, 'No deadline', 'Example', 'Description', null)`, [expired, closesToday, undated, recruiter])
    await db.query('insert into public.resumes values ($1, $2)', [id(20), seeker])

    await db.query("select set_config('request.jwt.claim.sub', $1, false)", [seeker])
    await db.exec('set role authenticated')
    const apply = job => db.query('insert into public.applications (job_id, user_id, resume_id) values ($1, $2, $3)', [job, seeker, id(20)])
    await assert.rejects(apply(expired), /row-level security/, 'expired posting refuses the application')
    await apply(closesToday)
    await apply(undated)
    await db.exec('reset role')

    const rows = (await db.query('select job_id from public.applications order by job_id')).rows.map(row => row.job_id)
    assert.deepEqual(rows, [closesToday, undated])
  } finally {
    await db.close()
  }
})
