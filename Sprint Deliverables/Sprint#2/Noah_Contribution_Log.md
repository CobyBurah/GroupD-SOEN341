# Sprint 2 Individual Contribution Log

**Team member:** Noah Dahan

**GitHub username:** noah11dahan-cpu

**Project:** CareerConnect — GroupD-SOEN341

**Sprint:** 2

## Contributions and time spent

| Activity | Contribution | Estimated time spent | Evidence |
|---|---|---|---|
| User profile management | Carried Sprint 1 profile work into Sprint 2 (protected routes, profile persistence). | ~1 hour | [#7](https://github.com/CobyBurah/GroupD-SOEN341/issues/7); [PR #33](https://github.com/CobyBurah/GroupD-SOEN341/pull/33) |
| Sync profile name to Supabase Auth | Fixed profile display-name updates not propagating to the Auth user record. | ~30 min | [PR #38](https://github.com/CobyBurah/GroupD-SOEN341/pull/38) |
| Resume management (US-04) | Resume upload, listing, and profile integration. | ~1.5 hours | [#39](https://github.com/CobyBurah/GroupD-SOEN341/issues/39); [PR #41](https://github.com/CobyBurah/GroupD-SOEN341/pull/41) |
| Multiple resumes | Extended uploads to accept several files at once, with rename support. | ~1 hour | [PR #64](https://github.com/CobyBurah/GroupD-SOEN341/pull/64) |
| Frontend design pass | Applied a consistent design across the job listing and surrounding pages. | ~1 hour | [PR #61](https://github.com/CobyBurah/GroupD-SOEN341/pull/61) |
| Recruiter application review (shared with Eldar) | Built the recruiter-side applications view and status-update flow; Eldar's dashboard work and this feature were developed and merged together. | ~1.5 hours | [PR #63](https://github.com/CobyBurah/GroupD-SOEN341/pull/63); [#82](https://github.com/CobyBurah/GroupD-SOEN341/issues/82) |
| CI pipeline | Set up GitHub Actions: lint, typecheck, unit tests, build, and Playwright, so every PR and push to `main` is checked automatically. | ~1 hour | [PR #65](https://github.com/CobyBurah/GroupD-SOEN341/pull/65) |
| Favourites (US-07, original team feature) | Implemented the saved-jobs/Favourites feature end to end: save/unsave, dedicated list, role restriction. | ~1 hour | [#68](https://github.com/CobyBurah/GroupD-SOEN341/issues/68); [PR #69](https://github.com/CobyBurah/GroupD-SOEN341/pull/69) |
| Code review | Reviewed and approved teammates' PRs for job search, job details, and filtering. | ~30 min | [PR #66](https://github.com/CobyBurah/GroupD-SOEN341/pull/66), [PR #67](https://github.com/CobyBurah/GroupD-SOEN341/pull/67), [PR #74](https://github.com/CobyBurah/GroupD-SOEN341/pull/74) |

**Total estimated time for development work above: approximately 8 hours**, across 8 merged PRs and 12 commits on `main` this sprint.

## Acceptance-test execution and GitHub cleanup (October 25)

On the day before submission, after reviewing a gap analysis of the repo against the Sprint 2 requirements, I ran and closed out the acceptance tests and GitHub project-management backlog:

- Manually tested the Sprint 1 auth/profile acceptance scenarios myself end to end: registration, login/logout, and profile persistence ([#91](https://github.com/CobyBurah/GroupD-SOEN341/issues/91), [#92](https://github.com/CobyBurah/GroupD-SOEN341/issues/92)).
- Personally drove the real password-reset flow against my own account to verify [#85](https://github.com/CobyBurah/GroupD-SOEN341/issues/85)/[#86](https://github.com/CobyBurah/GroupD-SOEN341/issues/86) — requesting the email, opening the one-time recovery link, and confirming the app correctly refuses to "reset" to the same password. (Left open pending one more confirmation step.)
- Reviewed, corrected, and closed the 29 acceptance-test and task issues Eldar published on October 25 ([#78](https://github.com/CobyBurah/GroupD-SOEN341/issues/78)–[#106](https://github.com/CobyBurah/GroupD-SOEN341/issues/106)): fixed a wrong parent-story link on [#82](https://github.com/CobyBurah/GroupD-SOEN341/issues/82), reassigned every acceptance test from a single assignee to the person who actually built that story, and closed each with a dated, evidenced result.
- Found and filed a real bug — `/jobs` pagination resets to page 1 on reload — as [#108](https://github.com/CobyBurah/GroupD-SOEN341/issues/108), and kept [#100](https://github.com/CobyBurah/GroupD-SOEN341/issues/100) open against it rather than closing it as a false pass.
- Wrote this Sprint 2 workplan (`Sprint2_Workplan.md`) and this log, after finding neither existed.

**Time spent on this pass: approximately 3 hours.**

### Validation and AI assistance

I used Claude Code throughout Sprint 2, and especially heavily on October 25, as a coding and testing assistant — not as an unsupervised author of the final record. Specifically on October 25:

- I asked it to audit the codebase, GitHub issues/PRs/board, Supabase schema, and run the app end to end to find what was missing for submission.
- For the 22 acceptance tests, it ran the actual test steps — browser automation against the real dev build and direct, read-only database queries against our Supabase project — rather than me clicking through each one by hand. I reviewed its evidence for each test before deciding to close the issue, corrected one of its findings myself (it initially misread a recruiter legitimately seeing an applicant's submitted resume as an access-control bug; checking the application records, I confirmed that resume had in fact been submitted to that recruiter's posting, so it isn't a bug), and ran parts of the resume-management tests (#93, #94) myself after its first automated attempt hit a tooling limitation.
- I reviewed and corrected its GitHub-cleanup plan (which issues to close, reassign, or leave open) before any of it was run, and ran the actual `gh` commands myself.
- The password-reset test on my own account ([#85](https://github.com/CobyBurah/GroupD-SOEN341/issues/85)) was something I drove personally end to end rather than delegating, since it touches my real login.

This log, the workplan above, and the issue closures from today reflect that division: AI-run verification, human (my) review and final decisions.
