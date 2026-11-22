# Sprint 4 Individual Contribution Log

**Team member:** Noah Dahan

**GitHub username:** noah11dahan-cpu

**Project:** CareerConnect (GroupD-SOEN341)

**Sprint:** 4

## Contributions and time spent

| Date | Activity | Contribution | Estimated time spent | Evidence |
|---|---|---|---|---|
| Nov 16 | Sprint 4 audit | Checked the repo, GitHub issues, PRs and the Supabase project against the Sprint 4 guidelines. Tested every feature in the browser and against the database. Found the bugs fixed later this sprint: the application deadline was not enforced, job search failed with surrounding spaces and treated `%` as a wildcard, and `npm audit` reported critical vulnerabilities in `next` 16.3.6. | ~3 hours | [#166](https://github.com/CobyBurah/GroupD-SOEN341/issues/166), [#195](https://github.com/CobyBurah/GroupD-SOEN341/issues/195), [#198](https://github.com/CobyBurah/GroupD-SOEN341/issues/198) |
| Nov 19 | Sprint 4 planning and GitHub project | Split the sprint into issues with labels, the Sprint 4 milestone, assignees, priority, size, and start and target dates so the board's Roadmap view shows the sprint. Linked tasks and acceptance tests to their user stories as sub-issues, and backfilled labels and milestones on older issues and PRs. Assigned the work across the team. | ~3 hours | Issues [#166](https://github.com/CobyBurah/GroupD-SOEN341/issues/166) to [#219](https://github.com/CobyBurah/GroupD-SOEN341/issues/219) |
| Nov 19 | CI/CD split | Replaced the single `ci.yml` with separate workflows for ESLint, TypeScript, unit tests, build, Playwright, database migrations and PR traceability, so each check is reported on its own. Added a migration check that applies all 21 migrations on PGlite and checks RLS on every public table. | ~2 hours | [#189](https://github.com/CobyBurah/GroupD-SOEN341/issues/189); [PR #220](https://github.com/CobyBurah/GroupD-SOEN341/pull/220) |
| Nov 19 to 21 | Static analysis in CI | Added CodeQL (security-and-quality, TypeScript and Actions), `npm audit` that fails on high or critical vulnerabilities, dependency review and Dependabot. Dropped SonarCloud because it needed owner-only setup and never ran, and made dependency review skip until the Dependency graph is enabled. Documented the tools and findings in `docs/quality/static-analysis.md`. | ~2 hours 30 min | [#190](https://github.com/CobyBurah/GroupD-SOEN341/issues/190); [PR #221](https://github.com/CobyBurah/GroupD-SOEN341/pull/221) |
| Nov 19 to 20 | US-21: AI job matching suggestions (second AI feature) | A job seeker picks a resume and gets up to 6 open postings that fit, each with a fit score, reasons grounded in the resume, skills to strengthen and an Apply link. Keyword pre-ranking, a strict JSON parser that drops unknown job ids, the `POST /api/job-matches` route with role and ownership checks, the AI matches page, unit, route and Playwright tests, use cases and acceptance tests. | ~4 hours | [#167](https://github.com/CobyBurah/GroupD-SOEN341/issues/167), tasks [#174](https://github.com/CobyBurah/GroupD-SOEN341/issues/174) to [#179](https://github.com/CobyBurah/GroupD-SOEN341/issues/179); [PR #223](https://github.com/CobyBurah/GroupD-SOEN341/pull/223) |
| Nov 20 | AI feature validation | Documented both AI features (purpose, inputs, prompts and model settings, expected output, validation strategy, limitations, privacy, failure handling) with real `llama3.1:8b` runs on representative inputs and edge cases: a scanned PDF, a French resume, prompt injection, unrelated postings. | ~2 hours | [#188](https://github.com/CobyBurah/GroupD-SOEN341/issues/188); [PR #222](https://github.com/CobyBurah/GroupD-SOEN341/pull/222) |
| Nov 20 to 21 | Prompt-injection fix | The validation found that instructions written inside a resume could replace the AI feedback. The system prompt now treats the resume as data, and feedback with no improvements is rejected. #224 was merged into the feature branch after that branch had already been merged, so I re-opened the fix against `main` as #227. | ~1 hour 30 min | [#186](https://github.com/CobyBurah/GroupD-SOEN341/issues/186); [PR #224](https://github.com/CobyBurah/GroupD-SOEN341/pull/224), [PR #227](https://github.com/CobyBurah/GroupD-SOEN341/pull/227) |
| Nov 21 | Next.js security upgrade | Upgraded `next` and `eslint-config-next` to 16.4.6 and ran `npm audit fix`: 0 vulnerabilities. CI then failed because the Windows lock file had dropped two Linux-only packages, so I restored those two entries from `main`. Lint, typecheck, 98 unit tests, the build and 36 Playwright tests pass. | ~1 hour 30 min | [#166](https://github.com/CobyBurah/GroupD-SOEN341/issues/166); [PR #226](https://github.com/CobyBurah/GroupD-SOEN341/pull/226) |
| Nov 20 | Repository cleanup | Removed the unused AI-assistant instruction files and ignored them so they are not re-added. | ~15 min | [#192](https://github.com/CobyBurah/GroupD-SOEN341/issues/192); [PR #225](https://github.com/CobyBurah/GroupD-SOEN341/pull/225) |
| Nov 21 | PR follow-up | Checked every open PR for CI status, conflicts and merge order, merged them in order, and fixed #221 after the other merges. | ~1 hour 30 min | PRs [#220](https://github.com/CobyBurah/GroupD-SOEN341/pull/220) to [#227](https://github.com/CobyBurah/GroupD-SOEN341/pull/227) |
| Nov 21 | CodeQL findings | The first CodeQL scan on `main` reported two high `js/user-controlled-bypass` alerts in `src/app/auth/confirm/route.ts`. Added `parseEmailOtpType()` so the email link type is validated instead of cast, with a unit test, documented why the remaining condition is not a security check, and recorded the finding in `docs/quality/static-analysis.md`. Checked live that unknown types, missing hashes and forged hashes are all refused. | ~1 hour | [#191](https://github.com/CobyBurah/GroupD-SOEN341/issues/191); PR `fix/noah-sprint4-issues` |
| Nov 21 | Live acceptance testing of both AI features | Re-ran the US-21 acceptance tests, the prompt-injection test and the six US-18 resume feedback tests on localhost:3000 with the real `llama3.1:8b` model and the team Supabase project, checking the database for each result. Found and fixed a bug: generating feedback in recruiter mode ran the model and then failed with a 500 on save; it is now refused with a 404 before the model call. Results in `docs/ai-validation/sprint4-acceptance-results.md`. | ~2 hours 30 min | [#180](https://github.com/CobyBurah/GroupD-SOEN341/issues/180) to [#185](https://github.com/CobyBurah/GroupD-SOEN341/issues/185), [#187](https://github.com/CobyBurah/GroupD-SOEN341/issues/187), [#213](https://github.com/CobyBurah/GroupD-SOEN341/issues/213) |
| Nov 21 | AI log | Sprint 4 AI usage log | ~45 min | [AI_Log/Noah_AI_Log/Sprint#4.md](../../AI_Log/Noah_AI_Log/Sprint%234.md) |
| Nov 21 | Contribution log | This document | ~30 min | |

**Total estimated time:** around 25 hours 30 min

## Current status

- Merged: PRs #220, #221, #222, #223, #225, #226 and #227. #224 was merged into the feature branch, and its fix reached `main` through #227.
- The PR from `fix/noah-sprint4-issues` holds the CodeQL fix, the recruiter-mode feedback fix, the acceptance test results and these logs, and closes my remaining Sprint 4 issues. It needs a review from another team member.
- The Dependency graph has to be enabled by the repository owner (Settings > Code security) for the dependency review check to run.
- Before the demo, warm up the model (`ollama run llama3.1:8b "hi" --keepalive 60m`): a job matching request with no good fits took about 110 seconds against a 120 second timeout.

## Validation and AI assistance

I used Claude Code (desktop app) for most of my Sprint 4 work, as a coding, testing and review assistant. The full process, with my prompts, is in [`AI_Log/Noah_AI_Log/Sprint#4.md`](../../AI_Log/Noah_AI_Log/Sprint%234.md).

- **What the AI did:**
  - audited the repo and tested the features in a browser and against the Supabase project
  - drafted the Sprint 4 issues, the CI workflows, the US-21 code and tests, and the AI validation documents
  - ran the automated checks (lint, typecheck, unit tests, build, Playwright, `npm audit`)
  - diagnosed CI failures (the lock file, the stale #221 checks, dependency review)
  - drove the live acceptance tests in Chromium (Playwright) with a QA test account and the real model, and checked each result in Supabase with read-only queries
- **What I did:**
  - decided the scope and who owns which issue
  - decided to drop SonarCloud and keep CodeQL as the static analysis tool
  - asked for the live acceptance tests on localhost:3000 and reviewed each result and database check
  - reviewed the changes before each commit and PR
  - decided the merge order and merged the PRs
- **What I checked or rejected:**
  - every generated change had to pass the same checks as CI before I pushed it
  - I rejected keeping SonarCloud once it was clear it could not run without the repository owner
  - after the first merges, the AI noticed that the prompt-injection fix (#224) had not reached `main`, and I re-opened it as #227
