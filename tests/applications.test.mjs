import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { PGlite } from '@electric-sql/pglite'

test('applications enforce resume ownership, active jobs, initial status and uniqueness', async () => {
  const db = new PGlite()
  const id = n => `00000000-0000-0000-0000-${String(n).padStart(12, '0')}`
  try {
    await db.exec(`create role authenticated; create schema auth;
      create table auth.users(id uuid primary key);
      create function auth.uid() returns uuid language sql stable as $$ select current_setting('request.jwt.claim.sub')::uuid $$;
      create type public.user_role as enum ('job_seeker', 'recruiter');
      create table profiles(id uuid primary key, role user_role);
      create table jobs(id uuid primary key, deleted_at timestamptz);
      create table resumes(id uuid primary key, user_id uuid);
      grant usage on schema public, auth to authenticated;
      grant select on profiles, jobs, resumes to authenticated;`)
    await db.exec(await readFile(new URL('../supabase/migrations/0008_applications.sql', import.meta.url), 'utf8'))
    await db.exec('grant select, insert on applications to authenticated')
    await db.query('insert into auth.users values ($1), ($2)', [id(1), id(2)])
    await db.query("insert into profiles values ($1, 'job_seeker'), ($2, 'recruiter')", [id(1), id(2)])
    await db.query('insert into jobs values ($1, null), ($2, now());', [id(3), id(4)])
    await db.query('insert into resumes values ($1, $2), ($3, $4)', [id(5), id(1), id(6), id(2)])
    await db.query("select set_config('request.jwt.claim.sub', $1, false)", [id(1)])
    await db.exec('set role authenticated')
    const apply = (job, resume, status = 'Applied') => db.query('insert into applications(job_id,user_id,resume_id,status) values ($1,$2,$3,$4)', [id(job), id(1), id(resume), status])
    await assert.rejects(apply(3, 6), /row-level security/)
    await assert.rejects(apply(4, 5), /row-level security/)
    await assert.rejects(apply(3, 5, 'Offered'), /row-level security/)
    await apply(3, 5)
    assert.equal((await db.query('select status from applications')).rows[0].status, 'Applied')
    await assert.rejects(apply(3, 5), /unique constraint/)
    await db.query("select set_config('request.jwt.claim.sub', $1, false)", [id(2)])
    assert.equal((await db.query('select * from applications')).rows.length, 0)
    await assert.rejects(db.query('insert into applications(job_id,user_id,resume_id) values ($1,$2,$3)', [id(3), id(2), id(6)]), /row-level security/)
  } finally { await db.close() }
})
