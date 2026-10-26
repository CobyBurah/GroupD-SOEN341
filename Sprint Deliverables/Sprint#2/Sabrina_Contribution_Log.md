# Sprint 2 Individual Contribution Log

**Team member:** Sabrina Marsillo

**GitHub username:** sm3339

**Project:** CareerConnect — GroupD-SOEN341

**Sprint:** 2

## Contributions and time spent

| Activity | Contribution | Estimated time spent | Evidence |
|---|---|---|---|
| Meeting minutes | Created and wrote the Sprint 2 meeting minutes for both Sprint 2 meetings (October 8 and October 19), including decisions, task assignments and next steps. | ~2 hours | [Meeting-Sprint#2.md](https://github.com/CobyBurah/GroupD-SOEN341/blob/main/Meeting_Minutes/Meeting-Sprint%232.md); [Commit e8017a5](https://github.com/CobyBurah/GroupD-SOEN341/commit/e8017a50eb264c89324fb6f42b55254d7ca6a527); [Commit 7527515](https://github.com/CobyBurah/GroupD-SOEN341/commit/75275155944644e15979a03020fb65af2a802ed0) |
| User stories and task breakdown | Updated the user stories and broke down US-06 (Job Search, Filtering & Job Listing Interface) into tasks, written in plain language, and split the work with Nour. | ~1 hour | [User_Stories.md commit 145349e](https://github.com/CobyBurah/GroupD-SOEN341/commit/145349ef66634e14504f54ae3e541baebfc2e84b); [US-06 #42](https://github.com/CobyBurah/GroupD-SOEN341/issues/42); [Tasks #45–#51](https://github.com/CobyBurah/GroupD-SOEN341/issues/45) |
| Jobs table (SQL) | Learned SQL/PostgreSQL and wrote the migration that creates the `jobs` table in Supabase: columns, employment type check, link to the recruiter who owns the job, indexes and row-level security. | ~3 hours | [Issue #49](https://github.com/CobyBurah/GroupD-SOEN341/issues/49); [PR #54](https://github.com/CobyBurah/GroupD-SOEN341/pull/54); [Commit b7a1437](https://github.com/CobyBurah/GroupD-SOEN341/commit/b7a1437377258f69b0d214974c62a1abb8ac96df) |
| Sample job data | Added 12 sample jobs (`supabase/data_jobs.sql`) so the job pages, search and filters have data to show. Handled the owner problem (no recruiter accounts existed yet) by attaching the jobs to an existing account, then to the test recruiter. | ~1.5 hours | [Issue #50](https://github.com/CobyBurah/GroupD-SOEN341/issues/50); [PR #56](https://github.com/CobyBurah/GroupD-SOEN341/pull/56); [Commit 9a65c52](https://github.com/CobyBurah/GroupD-SOEN341/commit/9a65c52058f8006c650600bfa3d0434dd4f42658) |
| Loading jobs into the app | Wrote `src/lib/jobs.ts` with `getJobs()` (all active jobs, newest first) and `getJob(id)` (one job for the details page, returns "not found" for invalid ids instead of crashing), and connected it to the Jobs page. | ~2.5 hours | [Issue #51](https://github.com/CobyBurah/GroupD-SOEN341/issues/51); [PR #57](https://github.com/CobyBurah/GroupD-SOEN341/pull/57); [Commit 62940f9](https://github.com/CobyBurah/GroupD-SOEN341/commit/62940f9fce42fd37ae43d89f913ceb429c0e97f4) |
| Search bar, search and filtering | Added the search bar to the Jobs page and the keyword search in `getJobs()` (title, company, category, location and employment type, ignoring capital letters), plus location and category filters. Applied Nour's review suggestions and made the filters ignore capital letters. | ~3 hours | [Issue #45](https://github.com/CobyBurah/GroupD-SOEN341/issues/45); [Issue #46](https://github.com/CobyBurah/GroupD-SOEN341/issues/46); [PR #67](https://github.com/CobyBurah/GroupD-SOEN341/pull/67); [Commit dd7c9fe](https://github.com/CobyBurah/GroupD-SOEN341/commit/dd7c9fe17db7a5e3df5104df975e199b0a8962c6); [Commit 5dbc291](https://github.com/CobyBurah/GroupD-SOEN341/commit/5dbc291951d37d82920d8611fc1a4274e0ce16ab); [Commit 313ea92](https://github.com/CobyBurah/GroupD-SOEN341/commit/313ea9236a4277e3ee59e717c96ec779a0a35d30) |
| "No jobs match your search" message | Added the empty-results message with a link back to all jobs, shown only when a search returns nothing (otherwise "No jobs posted yet"). | ~45 min | [Issue #48](https://github.com/CobyBurah/GroupD-SOEN341/issues/48); [PR #67](https://github.com/CobyBurah/GroupD-SOEN341/pull/67); [Commit 3af4f29](https://github.com/CobyBurah/GroupD-SOEN341/commit/3af4f2909e5d02d743de2fff125a02f42628f6f6) |
| Bug fix: employment type search | Found and fixed two bugs after PR #67 was merged: the employment type part of the keyword search was missing its search value, and "full time" (with a space) did not match `full_time`. | ~45 min | [PR #73](https://github.com/CobyBurah/GroupD-SOEN341/pull/73); [Commit 19627fe](https://github.com/CobyBurah/GroupD-SOEN341/commit/19627fed6d289a41264a37ad588b6d2f8dc49c9e) |

**Total estimated time: around 14.5 hours**, across 5 merged PRs (#54, #56, #57, #67, #73) plus meeting minutes, user stories, acceptance tests and AI log contributions.

The checks used before merging included:

- `npm run lint`
- `npm
