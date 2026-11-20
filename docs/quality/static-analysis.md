# Static analysis

Sprint 4 adds static analysis to CI so security and quality problems are found on every pull request, not by hand. This page lists the tools, where to see their reports, and every finding with the commit that fixed it.

## Tools

| Tool | What it checks | Workflow | Runs on | Where to see results |
|---|---|---|---|---|
| **CodeQL** (`security-and-quality` queries) | Security vulnerabilities (injection, XSS, unsafe redirects, secrets) and code quality in TypeScript/JavaScript and in the GitHub Actions workflows | [`codeql.yml`](../../.github/workflows/codeql.yml) | PRs, pushes to `main`, weekly | **Security > Code scanning** on GitHub, and inline on the PR diff |
| **SonarCloud** | Bugs, vulnerabilities, security hotspots, code smells, duplication, maintainability rating | [`sonarcloud.yml`](../../.github/workflows/sonarcloud.yml) + [`sonar-project.properties`](../../sonar-project.properties) | PRs, pushes to `main` | sonarcloud.io project `CobyBurah_GroupD-SOEN341`, and the SonarCloud comment on each PR |
| **npm audit** | Known vulnerabilities (CVEs) in production dependencies, high severity and above fail the job | [`dependency-audit.yml`](../../.github/workflows/dependency-audit.yml) | PRs, pushes to `main`, weekly | Job log; `npm audit --omit=dev` locally |
| **Dependency review** | Blocks PRs that add a dependency with a known high-severity vulnerability | `dependency-audit.yml` | PRs | PR checks |
| **Dependabot** | Opens weekly PRs for npm and GitHub Actions updates | [`.github/dependabot.yml`](../../.github/dependabot.yml) | Weekly | Pull requests labelled `dependencies` |
| **ESLint** (`eslint-config-next`, core web vitals + TypeScript rules) | Code style, React hooks rules, Next.js rules; warnings fail CI (`--max-warnings=0`) | [`lint.yml`](../../.github/workflows/lint.yml) | PRs, pushes to `main` | Job log and the `eslint-report` artifact |
| **TypeScript** (`tsc --noEmit`, strict mode) | Type errors | [`typecheck.yml`](../../.github/workflows/typecheck.yml) | PRs, pushes to `main` | Job log |

### SonarCloud setup (one time, repo owner)

1. Sign in at <https://sonarcloud.io> with GitHub and import the organization `cobyburah` and the repository `GroupD-SOEN341` (Free plan, public repo).
2. In the SonarCloud project: **Administration > Analysis Method**, turn **Automatic Analysis** off (CI runs the scan instead).
3. **My Account > Security**, generate a token.
4. On GitHub: **Settings > Secrets and variables > Actions > New repository secret**, name `SONAR_TOKEN`, paste the token.
5. Re-run the SonarCloud workflow. Until the secret exists the job is skipped, not failed.

If SonarCloud shows a different project key or organization, update `sonar-project.properties`.

## Findings and fixes

Severity is the tool's own rating. Every fix is linked to its commit, issue and PR. Fill in the commit and PR links once each branch is merged.

| # | Finding | Tool | Severity | Fix | Issue / PR / commit | Status |
|---|---|---|---|---|---|---|
| 1 | `next` 16.3.6: remote code execution in Image Optimization and `use cache`, SSRF, cache poisoning and DoS advisories | npm audit | Critical | Upgrade to `next@16.4.6` and `eslint-config-next@16.4.6` | Issue: Maintenance upgrade Next.js / PR: `chore/upgrade-nextjs-security` / commit: _link_ | Fixed |
| 2 | `sharp` < 0.35.5 (CVE in bundled librsvg), pulled in by `next` | npm audit | High | `npm audit fix` after the Next.js upgrade | Same PR as #1 | Fixed |
| 3 | `source-map-js` 1.0.0 - 1.2.1, event-loop DoS | npm audit | High | `npm audit fix` | Same PR as #1 | Fixed |
| 4 | Workflows used `actions/checkout@v4`, `setup-node@v4`, `upload-artifact@v4`, which run on the deprecated Node 20 runtime | GitHub Actions warnings | Warning | Move to `@v5` actions | PR: `ci/split-workflows` / commit: _link_ | Fixed |
| 5 | Job search passed `%`, `_` and `\` to SQL `ILIKE` unescaped, and unquoted values into PostgREST `or()` filters (filter-syntax injection: a keyword with `,` or `)` could change the filter) | Manual review / testing | Medium | `escapeLikePattern()` and quoting of PostgREST values in `src/lib/jobs.ts` | Issue: Bug job search / PR: `fix/job-search-escaping` / commit: _link_ | Fixed |
| 6 | Application deadline not enforced by the database: any signed-in seeker could insert an application to an expired posting through the API | Manual review / testing | Medium | Migration `0021_application_deadline.sql` adds the check to the RLS insert policy | Issue: Bug deadline / PR: `fix/job-deadline-enforcement` / commit: _link_ | Fixed (migration must be applied in Supabase) |
| 6b | Prompt injection: instructions written inside a resume made the AI resume feedback return the attacker's summary with no improvements | AI validation (real model run) | Medium | System prompt treats the resume as data; feedback without improvements is rejected | Issue: Bug instructions in a resume / PR: `fix/ai-prompt-injection` / commit: _link_ | Fixed |
| 7 | Supabase Auth leaked-password protection disabled | Supabase security advisor | Warning | Enable in the dashboard (Authentication > Email > Prevent use of leaked passwords) | Issue: Security leaked password protection | Open |
| 8 | `SECURITY DEFINER` functions callable by `authenticated` (`add_role`, `set_active_role`, `delete_own_account`, ...) | Supabase security advisor | Warning | Intended: these RPCs must run with elevated rights and check `auth.uid()` themselves; `0020_security_hardening.sql` already pins `search_path` and revokes access from `anon` | - | Accepted (by design) |
| 9+ | First CodeQL and SonarCloud results on `main` | CodeQL / SonarCloud | _tbd_ | _tbd_ | Issue: Static analysis findings | Open: add one row per finding |

### How to add a finding

1. Open the alert (Security > Code scanning) or the SonarCloud issue.
2. Fix it on a branch, with the alert URL in the commit message, for example `fix: escape user input in X (CodeQL js/xss, alert #3)`.
3. Add a row above with the commit link. False positives: dismiss them in the tool with a reason and add a row with status "Dismissed" and the reason.
