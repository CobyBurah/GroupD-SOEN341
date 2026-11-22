# Supporting scripts

- [ci/check-migrations.mjs](ci/check-migrations.mjs): apply every ordered migration to isolated PGlite and check public-table RLS. Run `node scripts/ci/check-migrations.mjs` after `npm ci`; it does not connect to the shared project.
- [sql/](sql/README.md): optional sample-job seed and read-only QA data preview. These are support operations, not schema migrations.
- [github/](github/README.md): issue/PR maintenance conventions and the status of historical automation references.

Schema changes remain in `supabase/migrations/`; browser test services remain in `tests/fixtures/`. Run scripts from the repository root unless their guide says otherwise.
