import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { PGlite } from '@electric-sql/pglite'

test('recruiters review and update status only for applications to their own jobs', async () => {
  const db = new PGlite()
  const id = n => `00000000-0000-0000-0000-${String(n).padStart(12, '0')}`
  const [seeker, recruiter, otherRecruiter, otherSeeker] = [1, 2, 3, 4].map(id)
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
      grant select on profiles, jobs, resumes, storage.objects to authenticated;`)
    await db.exec(await readFile(new URL('../supabase/migrations/0008_applications.sql', import.meta.url), 'utf8'))
    // Supabase's default table privileges, which 0009 narrows for updates.
    await db.exec('grant select, insert, update on applications to authenticated')
    await db.exec(await readFile(new URL('../supabase/migrations/0009_recruiter_application_review.sql', import.meta.url), 'utf8'))
    await db.exec(await readFile(new URL('../supabase/migrations/0010_under_review_status.sql', import.meta.url), 'utf8'))
    await db.query('insert into auth.users values ($1), ($2), ($3), ($4)', [seeker, recruiter, otherRecruiter, otherSeeker])
    await db.query("insert into profiles values ($1, 'job_seeker', 'Sam Seeker'), ($2, 'recruiter', 'Rae'), ($3, 'recruiter', 'Other'), ($4, 'job_seeker', 'Not Applied')", [seeker, recruiter, otherRecruiter, otherSeeker])
    await db.query('insert into jobs values ($1, $2, null), ($3, $4, null)', [id(10), recruiter, id(11), otherRecruiter])
    await db.query("insert into resumes values ($1, $2, 'seeker/cv.pdf'), ($3, $4, 'other/cv.pdf')", [id(20), seeker, id(21), otherSeeker])
    await db.query("insert into storage.objects values ('resumes', 'seeker/cv.pdf'), ('resumes', 'other/cv.pdf')")
    await db.query("insert into applications(id, job_id, user_id, resume_id) values ($1, $2, $3, $4), ($5, $6, $3, $4)", [id(30), id(10), seeker, id(20), id(31), id(11)])

    async function as(user, fn) {
      await db.query("select set_config('request.jwt.claim.sub', $1, false)", [user])
      await db.exec('set role authenticated')
      try { return await fn() } finally { await db.exec('reset role') }
    }
    const rows = async sql => (await db.query(sql)).rows

    await as(recruiter, async () => {
      assert.deepEqual((await rows('select id from applications')).map(r => r.id), [id(30)])
      assert.deepEqual((await rows('select full_name from profiles order by full_name')).map(r => r.full_name), ['Rae', 'Sam Seeker'])
      assert.deepEqual((await rows('select id from resumes')).map(r => r.id), [id(20)])
      assert.deepEqual((await rows('select name from storage.objects')).map(r => r.name), ['seeker/cv.pdf'])
      await db.query("update applications set status = 'Under Review' where id = $1", [id(30)])
      assert.deepEqual((await rows('select status from applications')).map(r => r.status), ['Under Review'])
      await db.query("update applications set status = 'Interview' where id = $1", [id(30)])
      // Another recruiter's application is invisible, so the update matches nothing.
      assert.equal((await db.query("update applications set status = 'Offered' where id = $1", [id(31)])).affectedRows, 0)
      await assert.rejects(db.query("update applications set status = 'Hired' where id = $1", [id(30)]), /check constraint/)
      await assert.rejects(db.query('update applications set resume_id = null where id = $1', [id(30)]), /permission denied/)
    })
    await as(seeker, async () => {
      assert.equal((await db.query("update applications set status = 'Offered' where id = $1", [id(30)])).affectedRows, 0)
      assert.deepEqual((await rows('select status from applications order by job_id')).map(r => r.status), ['Interview', 'Applied'])
    })
  } finally { await db.close() }
})
