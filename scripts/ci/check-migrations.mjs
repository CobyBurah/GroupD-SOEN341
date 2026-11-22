// Applies every SQL migration in supabase/migrations, in order, to an empty
// in-process PostgreSQL (PGlite) with a minimal stand-in for the Supabase
// auth and storage schemas. It fails if any migration has a syntax error,
// references an object that does not exist yet, or breaks a later migration.
// Then it checks that every public table has row level security enabled.
//
// Run locally:  node scripts/ci/check-migrations.mjs
// Run in CI:    .github/workflows/migrations.yml
import { readdir, readFile } from 'node:fs/promises'
import { PGlite } from '@electric-sql/pglite'

const dir = new URL('../../supabase/migrations/', import.meta.url)
const files = (await readdir(dir)).filter(f => /^\d{4}_.+\.sql$/.test(f)).sort()

// The parts of Supabase that the migrations rely on but do not create.
const SUPABASE_STUB = `
  create role authenticated; create role anon; create role service_role;
  create schema auth; create schema storage; create schema extensions;
  create table auth.users (
    id uuid primary key,
    email text,
    raw_user_meta_data jsonb default '{}'::jsonb,
    created_at timestamptz default now()
  );
  create function auth.uid() returns uuid language sql stable
    as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  create function auth.role() returns text language sql stable
    as $$ select coalesce(current_setting('request.jwt.claim.role', true), 'anon') $$;
  create table storage.buckets (
    id text primary key, name text, public boolean default false,
    file_size_limit bigint, allowed_mime_types text[]
  );
  create table storage.objects (
    id uuid primary key default gen_random_uuid(),
    bucket_id text references storage.buckets(id), name text, owner uuid,
    created_at timestamptz default now()
  );
  alter table storage.objects enable row level security;
  create function storage.foldername(name text) returns text[] language sql immutable
    as $$ select (string_to_array(name, '/'))[1:array_length(string_to_array(name, '/'), 1) - 1] $$;
  grant usage on schema public, auth, storage to authenticated, anon;
  alter default privileges in schema public grant all on tables to authenticated, anon;
`

const db = new PGlite()
let failed = false
try {
  await db.exec(SUPABASE_STUB)
  for (const file of files) {
    const sql = await readFile(new URL(file, dir), 'utf8')
    try {
      await db.exec(sql)
      console.log(`ok    ${file}`)
    } catch (error) {
      failed = true
      console.error(`FAIL  ${file}\n      ${error.message}`)
      break
    }
  }

  if (!failed) {
    const { rows } = await db.query(`
      select c.relname as table, c.relrowsecurity as rls
        from pg_class c join pg_namespace n on n.oid = c.relnamespace
       where n.nspname = 'public' and c.relkind = 'r'
       order by c.relname`)
    const withoutRls = rows.filter(r => !r.rls).map(r => r.table)
    console.log(`\n${files.length} migrations applied. Public tables: ${rows.map(r => r.table).join(', ')}`)
    if (withoutRls.length) {
      failed = true
      console.error(`FAIL  row level security is disabled on: ${withoutRls.join(', ')}`)
    } else {
      console.log('ok    row level security is enabled on every public table')
    }
  }
} finally {
  await db.close()
}
process.exit(failed ? 1 : 0)
