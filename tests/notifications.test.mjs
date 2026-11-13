import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { PGlite } from '@electric-sql/pglite'
import ts from 'typescript'

const id = n => `00000000-0000-0000-0000-${String(n).padStart(12, '0')}`

test('notification triggers, reminder boundaries and recipient-only access use real PostgreSQL', async () => {
  const db = new PGlite()
  const [seeker, otherSeeker, recruiter, otherRecruiter] = [1, 2, 3, 4].map(id)
  try {
    await db.exec(`create role authenticated; create role anon; create schema auth;
      create table auth.users(id uuid primary key);
      create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
      create table public.profiles(id uuid primary key, role text);
      create table public.jobs(id uuid primary key, recruiter_id uuid, title text, deleted_at timestamptz);
      create table public.applications(id uuid primary key, user_id uuid, job_id uuid, status text);
      create table public.favourites(user_id uuid, job_id uuid);
      grant usage on schema public, auth to authenticated, anon;
      grant select on profiles, jobs, applications, favourites to authenticated;
      alter default privileges in schema public grant all on tables to authenticated, anon;`)
    await db.exec(await readFile(new URL('../supabase/migrations/0017_notifications.sql', import.meta.url), 'utf8'))
    for (const [user, role] of [[seeker, 'job_seeker'], [otherSeeker, 'job_seeker'], [recruiter, 'recruiter'], [otherRecruiter, 'recruiter']]) {
      await db.query('insert into auth.users values ($1)', [user])
      await db.query('insert into profiles values ($1, $2)', [user, role])
    }
    // Active boundaries: today and +3 days included; +4, yesterday, removed and unrelated jobs excluded.
    for (let n = 10; n <= 16; n++) {
      const delta = ({ 10: 0, 11: 3, 12: 4, 13: -1, 14: 1, 15: 1, 16: 1 })[n]
      await db.query(`insert into jobs(id,recruiter_id,title,deleted_at,application_deadline)
        values ($1,$2,$3,$4, (now() at time zone 'UTC')::date + $5::int)`,
        [id(n), recruiter, `Job ${n}`, n === 14 ? new Date().toISOString() : null, delta])
      if (n !== 15 && n !== 16) await db.query('insert into favourites values ($1,$2)', [seeker, id(n)])
    }
    await db.query('insert into favourites values ($1,$2)', [otherSeeker, id(16)])
    // Insert sends a recruiter alert, not an applicant-status alert.
    await db.query("insert into applications values ($1,$2,$3,'Applied')", [id(20), seeker, id(10)])
    assert.equal((await db.query('select count(*)::int as n from notifications')).rows[0].n, 1)
    assert.equal((await db.query('select user_id,kind from notifications')).rows[0].user_id, recruiter)
    assert.equal((await db.query('select kind from notifications')).rows[0].kind, 'new_application')
    await db.query("update applications set status='Under Review' where id=$1", [id(20)])
    await db.query("update applications set status='Under Review' where id=$1", [id(20)])
    await db.query("update applications set status='Interview' where id=$1", [id(20)])
    await db.query("update applications set status='Offered' where id=$1", [id(20)])
    await db.query("update applications set status='Rejected' where id=$1", [id(20)])
    assert.deepEqual((await db.query('select kind from notifications where user_id=$1 order by created_at,id', [seeker])).rows.map(r => r.kind).sort(),
      ['application_status', 'application_status', 'application_status', 'interview'])

    async function as(user, fn, role = 'authenticated') {
      await db.query("select set_config('request.jwt.claim.sub',$1,false)", [user ?? ''])
      await db.exec(`set role ${role}`)
      try { await fn() } finally { await db.exec('reset role') }
    }
    let readId
    await as(seeker, async () => {
      await db.exec('select refresh_deadline_reminders(); select refresh_deadline_reminders()')
      const rows = (await db.query('select * from notifications')).rows
      assert.equal(rows.length, 6) // four statuses + today/+3-day reminders, even saved + applied
      assert.equal(rows.filter(r => r.kind === 'deadline').length, 2)
      assert.ok(rows.every(r => r.user_id === seeker))
      readId = rows[0].id
      await db.query('update notifications set read_at=now() where id=$1', [readId])
      await db.exec('select refresh_deadline_reminders()')
      assert.ok((await db.query('select read_at from notifications where id=$1', [readId])).rows[0].read_at)
      await assert.rejects(db.exec("insert into notifications(user_id,kind,message,href) values ('"+seeker+"','deadline','forged','/jobs/x')"), /permission denied/)
      await assert.rejects(db.exec("update notifications set message='forged'"), /permission denied/)
      await assert.rejects(db.exec("update notifications set user_id='"+otherSeeker+"'"), /permission denied/)
      await assert.rejects(db.exec('delete from notifications'), /permission denied/)
      await assert.rejects(db.exec('select notify_application_event()'), /permission denied/)
    })
    await as(otherSeeker, async () => {
      assert.equal((await db.query('select * from notifications')).rows.length, 0)
      assert.equal((await db.query('update notifications set read_at=now() where id=$1', [readId])).affectedRows, 0)
      await db.exec('select refresh_deadline_reminders()')
      const rows = (await db.query('select * from notifications')).rows
      assert.equal(rows.length, 1)
      assert.match(rows[0].message, /Job 16/)
      assert.equal(rows[0].user_id, otherSeeker)
    })
    await as(recruiter, async () => {
      await db.exec('select refresh_deadline_reminders()')
      const rows = (await db.query('select * from notifications')).rows
      assert.equal(rows.length, 1)
      assert.equal(rows[0].kind, 'new_application')
    })
    await as(otherRecruiter, async () => assert.equal((await db.query('select * from notifications')).rows.length, 0))
    await as(null, async () => {
      await assert.rejects(db.exec('select refresh_deadline_reminders()'), /Authentication required/)
    })
    await as(null, async () => {
      await assert.rejects(db.exec('select * from notifications'), /permission denied/)
      await assert.rejects(db.exec('select refresh_deadline_reminders()'), /permission denied/)
    }, 'anon')
    // Deadline changed: one new reminder, not a reset of old read state.
    await db.query("update jobs set application_deadline=application_deadline+1 where id=$1", [id(10)])
    await as(seeker, async () => {
      await db.exec('select refresh_deadline_reminders()')
      assert.equal((await db.query("select * from notifications where kind='deadline'")).rows.length, 3)
      await db.exec('update notifications set read_at=now() where read_at is null')
      assert.equal((await db.query('select * from notifications where read_at is null')).rows.length, 0)
    })
    await db.query('delete from auth.users where id=$1', [seeker])
    assert.equal((await db.query('select * from notifications where user_id=$1', [seeker])).rows.length, 0)
  } finally { await db.close() }
})

test('notification destinations cannot point outside supported app pages', async () => {
  const source = await readFile(new URL('../src/lib/notifications.ts', import.meta.url), 'utf8')
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText
  const { notificationHref } = await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`)
  for (const href of ['/applications', `/jobs/${id(1)}`, `/recruiter/jobs/${id(1)}/applications`]) assert.equal(notificationHref(href), href)
  for (const href of ['//evil.example', 'https://evil.example', 'javascript:alert(1)', '/jobs/../profile']) assert.equal(notificationHref(href), '/notifications')
})
