# Repository organization verification — #202

Verified November 22, 2026 on branch `chore/repo-organization`, based on main `00afc1a8f0ce4d69e40fe9dade042de06be1e251`.

| Acceptance check | Actual result |
|---|---|
| Source, tests, schema and supporting operations have documented locations | PASS: repository structure table and scripts guides identify the existing boundaries. No application source moved. |
| Sample seed separated from migrations | PASS: moved to `scripts/sql/seed-jobs.sql`, SQL contents unchanged; current setup references updated. Historical contribution records retain the original path. |
| Seed works with current schema | PASS: applied all 20 migrations to isolated PGlite, created a synthetic recruiter, ran seed and asserted exactly 12 job rows. |
| QA preview works with current schema | PASS: both read-only candidate queries executed in isolated PGlite; job count remained 12. No shared Supabase calls or cleanup performed. |
| Migration integrity | PASS: `node scripts/ci/check-migrations.mjs` applied all 20 migrations and confirmed RLS on every public table. |
| Documentation navigation | PASS: all 53 relative file/directory link targets in the changed guides and PR template existed at verification time. |
| Contribution templates and review guidance | PASS: bug/task/acceptance templates and PR checklist cover traceability, actual results and review criteria. |
| Git hygiene | PASS: `git diff --check`; local assistant/editor paths matched `.gitignore`. Text line-ending rules added; existing files were not bulk-renormalized. Root README was normalized to LF when edited. |

The GitHub automation mentioned in historical records is absent from all fetched Git history for that path. `scripts/github/README.md` documents the gap and a manual maintenance workflow; the original issue-generation/protection script was not recreated. Actual QA deletion remains under #203. Teammate review and CI on the eventual PR must be checked separately before merge.
