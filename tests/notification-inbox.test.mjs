import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { PGlite } from '@electric-sql/pglite'

test('the inbox exposes only the recipient’s rows and permits only marking them read', async () => {
  const db = new PGlite()
  const a = '00000000-0000-0000-0000-000000000001'
  const b = '00000000-0000-0000-0000-000000000002'
  try {
    await db.exec(`create role anon; create role authenticated;
      create schema auth;
      create table auth.users(id uuid primary key);
      create function auth.uid() returns uuid language sql stable as $$
        select current_setting('request.jwt.claim.sub')::uuid $$;
      grant usage on schema auth to authenticated;
      alter default privileges in schema public grant all on tables to anon, authenticated;`)
    await db.exec(await readFile(new URL('../supabase/migrations/0017_notification_inbox.sql', import.meta.url), 'utf8'))
    await db.query('insert into auth.users(id) values ($1), ($2)', [a, b])
    await db.query(`insert into notifications(user_id,title,message) values
      ($1, 'Interview', 'Frontend role'), ($2, 'Application', 'New applicant')`, [a, b])
    await db.exec('set role authenticated')
    const signIn = user => db.query("select set_config('request.jwt.claim.sub', $1, false)", [user])
    await signIn(a)
    assert.deepEqual((await db.query('select title, is_read from notifications')).rows,
      [{ title: 'Interview', is_read: false }])
    assert.equal((await db.query('update notifications set is_read = true where is_read = false')).affectedRows, 1)
    assert.equal((await db.query('update notifications set is_read = true where is_read = false')).affectedRows, 0)
    await signIn(b)
    assert.deepEqual((await db.query('select title, is_read from notifications')).rows,
      [{ title: 'Application', is_read: false }])
    const { rows: [rights] } = await db.query(`select
      has_table_privilege('anon', 'notifications', 'SELECT') as anonymous_read,
      has_table_privilege('authenticated', 'notifications', 'INSERT') as can_create,
      has_column_privilege('authenticated', 'notifications', 'user_id', 'UPDATE') as change_recipient,
      has_column_privilege('authenticated', 'notifications', 'message', 'UPDATE') as edit_message`)
    assert.deepEqual(rights, { anonymous_read: false, can_create: false, change_recipient: false, edit_message: false })
  } finally { await db.close() }
})
