# CI/CD pipeline

Until Sprint 3 a single `ci.yml` job ran lint, type checking, unit tests, build and Playwright one after the other. A failure only said "CI failed". In Sprint 4 each kind of check is its own workflow (9 workflows), so the PR checks list shows exactly what broke, the checks run in parallel, and each one can be made a required check on its own.

All workflows run on pull requests to `main` and on pushes to `main`, use Node.js 24 with the npm cache, cancel older runs of the same branch, and use the Node 24 based `actions/*@v5`.

| Workflow | Job (required check name) | What it verifies | Report |
|---|---|---|---|
| [`lint.yml`](../../.github/workflows/lint.yml) | `ESLint` | Lint rules, zero warnings allowed | `eslint-report` (JSON) |
| [`typecheck.yml`](../../.github/workflows/typecheck.yml) | `TypeScript` | `tsc --noEmit` in strict mode | log |
| [`unit-tests.yml`](../../.github/workflows/unit-tests.yml) | `node:test + PGlite` | All unit tests, including the RLS tests that run the real migrations in PGlite | `unit-test-results` (JUnit XML) |
| [`build.yml`](../../.github/workflows/build.yml) | `Next.js production build` | `next build` succeeds | log |
| [`e2e.yml`](../../.github/workflows/e2e.yml) | `Playwright (Chromium)` | Browser acceptance tests against the app with a fake Supabase API (no real data touched) | `playwright-report` (HTML) |
| [`dependency-audit.yml`](../../.github/workflows/dependency-audit.yml) | `npm audit (production dependencies)`, `Dependency review` | No high or critical CVEs in production dependencies; PRs add no vulnerable dependency | log |
| [`codeql.yml`](../../.github/workflows/codeql.yml) | `Analyze (javascript-typescript)`, `Analyze (actions)` | CodeQL security-and-quality queries | Security > Code scanning |
| [`migrations.yml`](../../.github/workflows/migrations.yml) | `Migrations apply cleanly (PGlite)` | All 21 migrations apply in order on an empty PostgreSQL with Supabase auth/storage stubs, and every public table has RLS enabled (runs when a migration changes) | log |
| [`pr-checks.yml`](../../.github/workflows/pr-checks.yml) | `PR is linked, labelled and described` | The PR closes an issue, has a label and the sprint milestone, fills in "What and why", and uses a `<type>/<description>` branch name | job summary |

Dependabot ([`.github/dependabot.yml`](../../.github/dependabot.yml)) opens weekly update PRs, and those PRs go through the same checks.

## Branch protection

`main` requires a pull request with one approving review from another team member, resolved conversations, and these passing checks: ESLint, TypeScript, node:test + PGlite, Next.js production build, Playwright (Chromium), npm audit, CodeQL (javascript-typescript), PR is linked, labelled and described. It is set by `node scripts/github/sprint4-github.mjs protect` ([`scripts/github/sprint4-github.mjs`](../../scripts/github/sprint4-github.mjs)).

## Running the same checks locally

```bash
npm ci
npm run lint -- --max-warnings=0
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm run build:test
npm run test:browser
npm audit --omit=dev --audit-level=high
node scripts/ci/check-migrations.mjs
```
