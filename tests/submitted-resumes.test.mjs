import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { PGlite } from '@electric-sql/pglite'

test('submitted files survive rename, replacement and deletion with scoped access and safe release', async () => {
  const db = new PGlite()
  const id = n => `00000000-0000-0000-0000-${String(n).padStart(12, '0')}`
  const [seeker, otherSeeker, recruiter, otherRecruiter] = [1, 2, 3, 4].map(id)
  const original = `${seeker}/original.pdf`, replacement = `${seeker}/replacement.pdf`
  const foreign = `${otherSeeker}/private.pdf`, legacy = `${seeker}/legacy.pdf`
  const migration = name => readFile(new URL(`../supabase/migrations/${name}`, import.meta.url), 'utf8')
  const rows = async (sql, params = []) => (await db.query(sql, params)).rows
  async function as(user, fn) {
    await db.query("select set_config('request.jwt.claim.sub', $1, false)", [user])
    await db.exec('set role authenticated')
    try { return await fn() } finally { await db.exec('reset role') }
  }
  try {
    await db.exec(`create role authenticated; create role anon; create schema auth; create schema storage;
      create table auth.users(id uuid primary key);
      create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
      create type public.user_role as enum ('job_seeker', 'recruiter');
      create table profiles(id uuid primary key, role user_role, full_name text);
      alter table profiles enable row level security;
      create policy own on profiles for select using (id = auth.uid());
      create table jobs(id uuid primary key, recruiter_id uuid, deleted_at timestamptz);
      create table storage.buckets(id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]);
      create table storage.objects(bucket_id text, name text, bytes text, primary key(bucket_id, name));
      create function storage.foldername(path text) returns text[] language sql as $$ select string_to_array(path, '/') $$;
      alter table storage.objects enable row level security;
      grant usage on schema public, auth, storage to authenticated, anon;
      grant select on profiles, jobs to authenticated;
      grant select, insert, update, delete on storage.objects to authenticated;
      alter default privileges in schema public grant all on tables to authenticated, anon;`)
    for (const name of ['0005_resumes.sql', '0008_applications.sql', '0009_recruiter_application_review.sql', '0010_under_review_status.sql', '0014_application_history.sql']) {
      await db.exec(await migration(name))
    }
    // Even if a future feature grants owners Storage UPDATE, pinned versions
    // must remain immutable (restrictive policy, not just a missing grant).
    await db.exec(`create policy owner_updates on storage.objects for update to authenticated
      using ((storage.foldername(name))[1] = auth.uid()::text)
      with check ((storage.foldername(name))[1] = auth.uid()::text)`)
    await db.query('insert into auth.users values ($1), ($2), ($3), ($4)', [seeker, otherSeeker, recruiter, otherRecruiter])
    await db.query("insert into profiles values ($1, 'job_seeker', 'A'), ($2, 'job_seeker', 'B'), ($3, 'recruiter', 'R1'), ($4, 'recruiter', 'R2')", [seeker, otherSeeker, recruiter, otherRecruiter])
    for (const n of [10, 11, 12, 13, 14, 15]) await db.query('insert into jobs values ($1, $2, null)', [id(n), recruiter])
    for (const [n, owner, name, path] of [[20, seeker, 'original.pdf', original], [21, otherSeeker, 'private.pdf', foreign], [22, seeker, 'legacy.pdf', legacy]]) {
      await db.query("insert into resumes(id, user_id, file_name, storage_path, mime_type, size_bytes) values ($1, $2, $3, $4, 'application/pdf', 10)", [id(n), owner, name, path])
      await db.query("insert into storage.objects values ('resumes', $1, $2)", [path, name])
    }
    await db.query("insert into applications(id, job_id, user_id, resume_id, status) values ($1, $2, $3, $4, 'Interview'), ($5, $6, $3, null, 'Applied')", [id(30), id(13), seeker, id(22), id(31), id(14)])
    await db.exec(await migration('0015_submitted_resume_versions.sql'))

    const old = await rows('select id, submitted_resume_path, resume_snapshot_is_legacy from applications order by id')
    assert.deepEqual(old, [
      { id: id(30), submitted_resume_path: legacy, resume_snapshot_is_legacy: true },
      { id: id(31), submitted_resume_path: null, resume_snapshot_is_legacy: true },
    ])

    await as(seeker, async () => {
      for (const [application, job] of [[32, 10], [33, 11]]) {
        await db.query(`insert into applications(id, job_id, user_id, resume_id, submitted_resume_path, submitted_resume_name, resume_snapshot_is_legacy)
          values ($1, $2, $3, $4, $5, 'forged.pdf', true)`, [id(application), id(job), seeker, id(20), foreign])
      }
      const captured = (await rows('select submitted_resume_path, submitted_resume_name, resume_snapshot_is_legacy from applications where id = $1', [id(32)]))[0]
      assert.deepEqual(captured, { submitted_resume_path: original, submitted_resume_name: 'original.pdf', resume_snapshot_is_legacy: false })
      await assert.rejects(db.query('insert into applications(job_id, user_id, resume_id) values ($1, $2, $3)', [id(10), seeker, id(20)]), /unique constraint/)
      await assert.rejects(db.query('insert into applications(job_id, user_id, resume_id) values ($1, $2, $3)', [id(12), seeker, id(21)]), /resume you own/)

      // A forged path on an otherwise owned resume must not grant a recruiter
      // access to a different user's private file.
      await db.query('update resumes set storage_path = $1 where id = $2', [`${otherSeeker}/guessed.pdf`, id(20)])
      await assert.rejects(db.query('insert into applications(job_id, user_id, resume_id) values ($1, $2, $3)', [id(12), seeker, id(20)]), /not yours/)
      await db.query('update resumes set storage_path = $1 where id = $2', [`${seeker}/missing.pdf`, id(20)])
      await assert.rejects(db.query('insert into applications(job_id, user_id, resume_id) values ($1, $2, $3)', [id(12), seeker, id(20)]), /unavailable/)
      await db.query('update resumes set storage_path = $1 where id = $2', [original, id(20)])

      await db.query("insert into storage.objects values ('resumes', $1, 'NEW CONTENT')", [replacement])
      await db.query("update resumes set file_name = 'renamed.pdf', storage_path = $1 where id = $2", [replacement, id(20)])
      assert.equal((await db.query('delete from storage.objects where name = $1', [original])).affectedRows, 0)
      assert.equal((await db.query("update storage.objects set bytes = 'OVERWRITTEN' where name = $1", [original])).affectedRows, 0)
      assert.equal((await db.query('delete from storage.objects where name = $1', [replacement])).affectedRows, 0)
      await db.query('delete from resumes where id = $1', [id(20)])
      assert.equal((await db.query('delete from storage.objects where name = $1', [replacement])).affectedRows, 1)
      const saved = (await rows('select resume_id, submitted_resume_path, submitted_resume_name from applications where id = $1', [id(32)]))[0]
      assert.deepEqual(saved, { resume_id: null, submitted_resume_path: original, submitted_resume_name: 'original.pdf' })
    })

    await as(recruiter, async () => {
      assert.equal((await rows('select submitted_resume_name from applications where id = $1', [id(32)]))[0].submitted_resume_name, 'original.pdf')
      assert.equal((await rows('select bytes from storage.objects where name = $1', [original]))[0].bytes, 'original.pdf')
      assert.deepEqual(await rows('select * from resumes'), [])
      await db.query("update applications set status = 'Interview' where id = $1", [id(32)])
      await assert.rejects(db.query("update applications set submitted_resume_name = 'changed' where id = $1", [id(32)]), /permission denied/)
    })
    for (const user of [otherSeeker, otherRecruiter]) await as(user, async () => {
      assert.deepEqual(await rows('select * from applications where id = $1', [id(32)]), [])
      assert.deepEqual(await rows('select * from storage.objects where name = $1', [original]), [])
      assert.equal((await db.query('delete from storage.objects where name = $1', [original])).affectedRows, 0)
    })
    // The trigger also prevents privileged code accidentally rewriting a snapshot.
    await assert.rejects(db.query("update applications set submitted_resume_name = 'changed' where id = $1", [id(32)]), /immutable/)

    await as(seeker, async () => {
      await db.query('delete from applications where id = $1', [id(32)])
      assert.equal((await db.query('delete from storage.objects where name = $1', [original])).affectedRows, 0)
      await db.query('delete from applications where id = $1', [id(33)])
    })
    await as(recruiter, async () => assert.deepEqual(await rows('select * from storage.objects where name = $1', [original]), []))
    await as(seeker, async () => assert.equal((await db.query('delete from storage.objects where name = $1', [original])).affectedRows, 1))
  } finally { await db.close() }
})
