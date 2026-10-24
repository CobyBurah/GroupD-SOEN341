import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { PGlite } from '@electric-sql/pglite'

test('status changes are recorded in history and seekers can withdraw only their own applications', async () => {
  const db = new PGlite()
  const id = n => `00000000-0000-0000-0000-${String(n).padStart(12, '0')}`
  const [seeker, recruiter, otherSeeker] = [1, 2, 3].map(id)
  const migration = name => readFile(new URL(`../supabase/migrations/${name}`, import.meta.url), 'utf8')
  try {
    await db.exec(`create role authenticated; create role anon; create schema auth; create schema storage;
      create table auth.users(id uuid primary key);
      create function auth.uid() returns uuid language sql stable as $$ select current_setting('request.jwt.claim.sub')::uuid $$;
      create type public.user_role as enum ('job_seeker', 'recruiter');
      create table profiles(id uuid primary key, role user_role, full_name text);
      alter table profiles enable row level security;
      create policy own on profiles for select using (id = auth.uid());
      create table jobs(id uuid primary key, recruiter_id uuid, deleted_at timestamptz);
      create table resumes(id uuid primary key, user_id uuid, storage_path text);
      alter table resumes enable row level security;
      create policy own on resumes for select using (user_id = auth.uid());
      create table storage.objects(bucket_id text, name text);
      alter table storage.objects enable row level security;
      grant usage on schema public, auth, storage to authenticated;
      grant select on profiles, jobs, resumes, storage.objects to authenticated;
      -- Supabase grants every privilege on new public tables; the migrations narrow them.
      alter default privileges in schema public grant all on tables to authenticated, anon;`)
    for (const name of ['0008_applications.sql', '0009_recruiter_application_review.sql', '0010_under_review_status.sql']) {
      await db.exec(await migration(name))
    }
    await db.query('insert into auth.users values ($1), ($2), ($3)', [seeker, recruiter, otherSeeker])
    await db.query("insert into profiles values ($1, 'job_seeker', 'Sam'), ($2, 'recruiter', 'Rae'), ($3, 'job_seeker', 'Other')", [seeker, recruiter, otherSeeker])
    await db.query('insert into jobs values ($1, $2, null), ($3, $2, null), ($4, $2, null)', [id(10), recruiter, id(11), id(12)])
    await db.query('insert into resumes values ($1, $2, null), ($3, $4, null)', [id(20), seeker, id(21), otherSeeker])
    // An application made before history existed, already moved to Interview.
    await db.query("insert into applications(id, job_id, user_id, resume_id, status, created_at) values ($1, $2, $3, $4, 'Interview', '2026-01-01')", [id(30), id(10), seeker, id(20)])
    await db.exec(await migration('0014_application_history.sql'))

    async function as(user, fn) {
      await db.query("select set_config('request.jwt.claim.sub', $1, false)", [user])
      await db.exec('set role authenticated')
      try { return await fn() } finally { await db.exec('reset role') }
    }
    const rows = async (sql, params) => (await db.query(sql, params)).rows
    const history = application => rows('select status from application_status_history where application_id = $1 order by changed_at, status', [application])

    // Backfill: the original Applied entry plus the current status.
    assert.deepEqual((await history(id(30))).map(r => r.status), ['Applied', 'Interview'])

    await as(seeker, async () => {
      await db.query('insert into applications(id, job_id, user_id, resume_id) values ($1, $2, $3, $4)', [id(31), id(11), seeker, id(20)])
      assert.deepEqual((await history(id(31))).map(r => r.status), ['Applied'])
      await assert.rejects(db.query("insert into application_status_history(application_id, status) values ($1, 'Offered')", [id(31)]), /permission denied/)
    })
    await as(otherSeeker, async () => {
      await db.query('insert into applications(id, job_id, user_id, resume_id) values ($1, $2, $3, $4)', [id(32), id(10), otherSeeker, id(21)])
      // Only their own history is visible.
      assert.deepEqual((await rows('select application_id from application_status_history')).map(r => r.application_id), [id(32)])
      // Another seeker's application is invisible, so the delete matches nothing.
      assert.equal((await db.query('delete from applications where id = $1', [id(31)])).affectedRows, 0)
    })

    await as(recruiter, async () => {
      await db.query("update applications set status = 'Under Review' where id = $1", [id(31)])
      // Saving the same status again adds no entry.
      await db.query("update applications set status = 'Under Review' where id = $1", [id(31)])
      assert.equal((await db.query('delete from applications where id = $1', [id(31)])).affectedRows, 0)
    })
    assert.deepEqual((await history(id(31))).map(r => r.status), ['Applied', 'Under Review'])

    await as(seeker, async () => {
      assert.deepEqual((await history(id(31))).map(r => r.status), ['Applied', 'Under Review'])
      assert.equal((await db.query('delete from applications where id = $1', [id(31)])).affectedRows, 1)
      // Withdrawing frees the job up for a new application.
      await db.query('insert into applications(job_id, user_id, resume_id) values ($1, $2, $3)', [id(11), seeker, id(20)])
    })
    assert.deepEqual(await history(id(31)), [])
    assert.equal((await rows('select count(*)::int as n from applications where job_id = $1', [id(11)]))[0].n, 1)
  } finally { await db.close() }
})
