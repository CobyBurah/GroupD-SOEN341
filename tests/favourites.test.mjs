import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { PGlite } from '@electric-sql/pglite'

test('favourites are private to each seeker, limited to active jobs and unique per job', async () => {
  const db = new PGlite()
  const id = n => `00000000-0000-0000-0000-${String(n).padStart(12, '0')}`
  try {
    await db.exec(`create role authenticated; create schema auth;
      create table auth.users(id uuid primary key);
      create function auth.uid() returns uuid language sql stable as $$ select current_setting('request.jwt.claim.sub')::uuid $$;
      create type public.user_role as enum ('job_seeker', 'recruiter');
      create table profiles(id uuid primary key, role user_role);
      create table jobs(id uuid primary key, deleted_at timestamptz);
      grant usage on schema public, auth to authenticated;
      grant select on profiles, jobs to authenticated;
      grant select, insert, update, delete on all tables in schema public to authenticated;
      alter default privileges in schema public grant select, insert, update, delete on tables to authenticated;`)
    await db.exec(await readFile(new URL('../supabase/migrations/0011_favourites.sql', import.meta.url), 'utf8'))
    await db.query('insert into auth.users values ($1), ($2), ($3)', [id(1), id(2), id(3)])
    await db.query("insert into profiles values ($1, 'job_seeker'), ($2, 'job_seeker'), ($3, 'recruiter')", [id(1), id(2), id(3)])
    await db.query('insert into jobs values ($1, null), ($2, now()), ($3, null)', [id(10), id(11), id(12)])
    const as = user => db.query("select set_config('request.jwt.claim.sub', $1, false)", [id(user)])
    const save = (user, job) => db.query('insert into favourites(user_id, job_id) values ($1, $2)', [id(user), id(job)])
    await db.exec('set role authenticated')

    await as(1)
    await save(1, 10)
    await save(1, 12)
    await assert.rejects(save(1, 10), /duplicate key|unique/)
    await assert.rejects(save(1, 11), /row-level security/) // deleted job
    await assert.rejects(save(2, 10), /row-level security/) // someone else's list
    await assert.rejects(db.query('update favourites set created_at = now()'), /permission denied/)
    assert.equal((await db.query('select * from favourites')).rows.length, 2)

    // Another seeker cannot see or remove seeker 1's favourites.
    await as(2)
    assert.equal((await db.query('select * from favourites')).rows.length, 0)
    await db.query('delete from favourites where user_id = $1', [id(1)])
    await as(1)
    assert.equal((await db.query('select * from favourites')).rows.length, 2)

    // Recruiters cannot favourite.
    await as(3)
    await assert.rejects(save(3, 10), /row-level security/)

    // Seekers can remove their own favourites.
    await as(1)
    await db.query('delete from favourites where job_id = $1', [id(10)])
    assert.deepEqual((await db.query('select job_id from favourites')).rows.map(r => r.job_id), [id(12)])

    // Deleting the user or the job cascades to their favourites.
    await db.exec('reset role')
    await db.query('delete from jobs where id = $1', [id(12)])
    await save(2, 10)
    await db.query('delete from auth.users where id = $1', [id(2)])
    assert.equal((await db.query('select * from favourites')).rows.length, 0)
  } finally { await db.close() }
})
