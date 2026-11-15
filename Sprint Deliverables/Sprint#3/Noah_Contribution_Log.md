# Sprint 3 Individual Contribution Log

**Team member:** Noah Dahan

**GitHub username:** noah11dahan-cpu

**Project:** CareerConnect — GroupD-SOEN341

**Sprint:** 3

## Contributions and time spent

| Activity | Contribution | Estimated time spent | Evidence |
|---|---|---|---|
| Feature planning: AI-Powered Resume Feedback (US-18, co-owned with Coby) | Analyzed the repo and the Sprint 3 requirements. Chose a local Ollama model (llama3.1:8b) and planned how to wire it into the app. Wrote the use cases and acceptance tests. | ~1 hour | [#119](https://github.com/CobyBurah/GroupD-SOEN341/issues/119); `docs/resume-feedback/use-cases.md`, `docs/resume-feedback/acceptance-tests.md` |
| Resume text extraction | Server-side PDF (unpdf) and DOCX (mammoth) text extraction, so the AI can read stored resumes. | ~30 min | [#128](https://github.com/CobyBurah/GroupD-SOEN341/issues/128); [PR #140](https://github.com/CobyBurah/GroupD-SOEN341/pull/140) |
| Local Ollama client | Calls the local model with structured JSON output (summary, strengths, improvements), a timeout, and clear errors when the model is unavailable. Never shows made-up feedback. | ~45 min | [#129](https://github.com/CobyBurah/GroupD-SOEN341/issues/129); [PR #140](https://github.com/CobyBurah/GroupD-SOEN341/pull/140) |
| Resume feedback API route | `GET`/`POST /api/resumes/[id]/feedback`, with ownership checked through RLS and separate error codes (401/404/422/503/502/500). | ~45 min | [#130](https://github.com/CobyBurah/GroupD-SOEN341/issues/130); [PR #140](https://github.com/CobyBurah/GroupD-SOEN341/pull/140) |
| resume_feedback table and RLS | Migration 0016: owner-only access, and only a job seeker who owns the resume can save feedback. Feedback is deleted with its resume. Applied it to the team Supabase project. | ~30 min | [#131](https://github.com/CobyBurah/GroupD-SOEN341/issues/131); `supabase/migrations/0016_resume_feedback.sql` |
| Feedback UI and tests (assigned to Coby, built on my branch) | AI feedback panel on the Resumes page, 11 unit and RLS tests, and 2 Playwright tests. | ~1 hour | [#132](https://github.com/CobyBurah/GroupD-SOEN341/issues/132), [#133](https://github.com/CobyBurah/GroupD-SOEN341/issues/133); [PR #140](https://github.com/CobyBurah/GroupD-SOEN341/pull/140) |
| Manual acceptance testing with real Ollama | Tested the feature end to end at localhost:3000 with llama3.1:8b and the team Supabase project. AT-US18-01, 02, 03 and 06 pass. | ~45 min | [#134](https://github.com/CobyBurah/GroupD-SOEN341/issues/134), [#135](https://github.com/CobyBurah/GroupD-SOEN341/issues/135), [#136](https://github.com/CobyBurah/GroupD-SOEN341/issues/136), [#139](https://github.com/CobyBurah/GroupD-SOEN341/issues/139) |
| Splitting US-18 into GitHub issues | Split #119 into 6 task sub-issues and 6 acceptance-test sub-issues, following the team's conventions. Moved #119 to In progress. | ~30 min | [#128](https://github.com/CobyBurah/GroupD-SOEN341/issues/128)–[#139](https://github.com/CobyBurah/GroupD-SOEN341/issues/139) |
| CI fix | Both CI jobs on PR #140 failed because package-lock.json was missing two packages that CI's npm requires. Rebuilt the lock file and checked that every CI step passes. | ~30 min | [PR #140](https://github.com/CobyBurah/GroupD-SOEN341/pull/140) (commit `66f77d3`) |

| Sprint 3 audit | Checked the repo, the GitHub issues, PRs and branches, and the Supabase migrations against the Sprint 3 guidelines. Found that posting archive was missing, plus several documentation gaps. | ~1 hour | This log; `Sprint Deliverables/Sprint#3/Sprint3_Workplan.md` |
| US-20: Archive and restore job postings | Migration 0019 (`archived_at`, RLS that blocks applications and favourites on archived postings, reminders skip archived postings). Dashboard sections for active and archived postings, application counts, Archive and Restore actions, and a closed notice for seekers. 4 unit and RLS tests and 1 Playwright acceptance test. | ~2 hours 30 min | `supabase/migrations/0019_job_archive.sql`; `tests/job-archive.test.mjs`; `tests/browser/job-archive.spec.mjs`; `docs/recruiter/archive-acceptance-tests.md` |
| Fixes from the audit | Deadline reminders now reach dual-role users in recruiter mode. Migration 0020 applies the Supabase advisor fixes (revokes RPC access to the trigger functions, adds foreign-key indexes). Fixed the local lint ignore and an unused-argument warning. | ~45 min | `supabase/migrations/0020_security_hardening.sql`; `eslint.config.mjs` |
| Sprint 3 documentation | Added US-16 to US-20 to `User_Stories.md`, wrote the Sprint 3 workplan, and updated the README feature list and test commands. | ~45 min | `User_Stories.md`; `Sprint Deliverables/Sprint#3/Sprint3_Workplan.md`; `README.md` |

**Total estimated time for the work above: approximately 11 hours 15 minutes**, across PR [#140](https://github.com/CobyBurah/GroupD-SOEN341/pull/140), the US-20 enhancement PR, and 12 sub-issues of [#119](https://github.com/CobyBurah/GroupD-SOEN341/issues/119).

## Current status

- PR [#140](https://github.com/CobyBurah/GroupD-SOEN341/pull/140) is merged. It closed #119, the 6 tasks and the 4 passed acceptance tests.
- The US-20 archive PR adds migrations 0019 and 0020. Both have to be applied to the team Supabase project in order.
- [AT-US18-04](https://github.com/CobyBurah/GroupD-SOEN341/issues/137) (scanned resume) and [AT-US18-05](https://github.com/CobyBurah/GroupD-SOEN341/issues/138) (privacy with a second account) still need a manual run. Automated tests cover them in the meantime.
- Before the demo, warm up the model (`ollama run llama3.1:8b "hi" --keepalive 60m`). The first request took 116 seconds, against a 120 second timeout.
- The PR claims migration number 0016, so other Sprint 3 branches should start at 0017.

### Validation and AI assistance

I used Claude Code for most of this feature, as a coding and testing assistant. It didn't author the final record unsupervised. The full process is in `AI_Log/Noah_AI_Log/Sprint#3.md` ([conversation link](https://claude.ai/share/b0c25f76-a8f5-4e97-bdf7-89f4ebf5e99a)).

- **What the AI did:**
  - planned the feature
  - wrote the code, tests and docs on the `feature/ai-resume-feedback` branch, using subagents for the backend, the UI and the tests
  - ran the automated checks
  - diagnosed the CI failure
- **What I did:**
  - made the design decisions: model choice, how to split the issues, who is assigned to what
  - reviewed the main backend code
  - applied migration 0016 to our Supabase project myself in the SQL Editor
  - ran the manual acceptance tests myself with real Ollama
  - ran every git and `gh` command myself to commit, push, create the issues and open the PR
- The AI was not allowed to write to our shared Supabase project or to GitHub directly, so every shared change went through me.
- The "Feedback UI and tests" row is assigned to Coby on GitHub, but it was built on my branch as part of the same PR. It's listed here so the work is traceable, and it's ready for Coby to review on PR #140.
