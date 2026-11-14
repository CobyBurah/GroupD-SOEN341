import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { PGlite } from '@electric-sql/pglite'

const migration = name => readFile(new URL(`../supabase/migrations/${name}`, import.meta.url), 'utf8')

test('dual-role accounts: backfill, add_role, set_active_role and RLS follow the active role', async () => {
  const db = new PGlite()
  const legacyRecruiter = '00000000-0000-0000-0000-000000000001'
  const legacySeeker = '00000000-0000-0000-0000-000000000002'
  const newRecruiter = '00000000-0000-0000-0000-000000000003'
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
    // Accounts created before the dual-role migration.
    await db.query(`insert into auth.users values ($1, '{"role":"recruiter"}'), ($2, '{"role":"job_seeker"}')`, [legacyRecruiter, legacySeeker])
    await db.exec(await migration('0018_dual_roles.sql'))
    await db.query(`insert into auth.users values ($1, '{"role":"recruiter"}')`, [newRecruiter])

    const roles = async id => (await db.query('select role::text, roles::text[] from public.profiles where id = $1', [id])).rows[0]
    assert.deepEqual(await roles(legacyRecruiter), { role: 'recruiter', roles: ['recruiter'] })
    assert.deepEqual(await roles(legacySeeker), { role: 'job_seeker', roles: ['job_seeker'] })
    assert.deepEqual(await roles(newRecruiter), { role: 'recruiter', roles: ['recruiter'] })

    // The active role must always be one the account holds.
    await assert.rejects(db.query(`update public.profiles set role = 'recruiter' where id = $1`, [legacySeeker]))

    async function asUser(id, fn) {
      await db.query("select set_config('request.jwt.claim.sub', $1, false)", [id])
      await db.exec('set role authenticated')
      try { return await fn() } finally { await db.exec('reset role') }
    }
    const setActive = role => db.query('select public.set_active_role($1) as role', [role]).then(r => r.rows[0].role)
    const postJob = () => db.query(`insert into public.jobs (recruiter_id, title, company, description) values ($1, 'Dev', 'Co', 'Build.')`, [legacySeeker])

    await asUser(legacySeeker, async () => {
      // Users cannot grant themselves roles or switch modes with a direct update.
      await assert.rejects(db.query(`update public.profiles set roles = '{job_seeker,recruiter}' where id = $1`, [legacySeeker]))
      await assert.rejects(db.query(`update public.profiles set role = 'recruiter' where id = $1`, [legacySeeker]))

      // Choosing a role the account doesn't hold (e.g. at login) is a silent no-op.
      assert.equal(await setActive('recruiter'), 'job_seeker')
      await assert.rejects(postJob())

      // Adding the second role keeps the user in their current mode.
      await db.query(`select public.add_role('recruiter')`)
      await db.query(`select public.add_role('recruiter')`)
      assert.equal(await setActive('job_seeker'), 'job_seeker')
    })
    assert.deepEqual(await roles(legacySeeker), { role: 'job_seeker', roles: ['job_seeker', 'recruiter'] })

    await asUser(legacySeeker, async () => {
      // In recruiter mode the existing recruiter RLS policies apply.
      assert.equal(await setActive('recruiter'), 'recruiter')
      await postJob()
      // Back in seeker mode, recruiter-only actions are refused again.
      assert.equal(await setActive('job_seeker'), 'job_seeker')
      await assert.rejects(postJob())
    })

    // add_role only ever touches the caller's own profile.
    await asUser(legacyRecruiter, () => db.query(`select public.add_role('job_seeker')`))
    assert.deepEqual(await roles(legacyRecruiter), { role: 'recruiter', roles: ['recruiter', 'job_seeker'] })
    assert.deepEqual(await roles(newRecruiter), { role: 'recruiter', roles: ['recruiter'] })
  } finally {
    await db.close()
  }
})
