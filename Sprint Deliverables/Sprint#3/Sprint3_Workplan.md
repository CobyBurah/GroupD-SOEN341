## Sprint 3 Workplan

**Project:** CareerConnect (GroupD-SOEN341)
**Sprint:** 3 (milestone "Sprint 3", due 2026-11-16)

### Sprint 3 goals

Per the course guidelines, Sprint 3 finishes the remaining core features, strengthens testing, and starts the Generative AI feature:

| # | Required feature | Status |
|---|---|---|
| 1 | Recruiter dashboard and posting management | Done. Create, edit and delete came from Sprint 2 ([#40](https://github.com/CobyBurah/GroupD-SOEN341/issues/40)). Sprint 3 added filtering applications by status and date (US-19, [#123](https://github.com/CobyBurah/GroupD-SOEN341/issues/123)), and archive/restore with per-posting application counts (US-20). |
| 2 | Application analytics and history dashboard | Done. Status history and status counts came from Sprint 2 ([#78](https://github.com/CobyBurah/GroupD-SOEN341/issues/78)). Sprint 3 added activity metrics and the applications-over-time chart (US-16, [#117](https://github.com/CobyBurah/GroupD-SOEN341/issues/117)). |
| 3 | Notifications and reminders | Done. US-17 ([#118](https://github.com/CobyBurah/GroupD-SOEN341/issues/118)) covers status changes, interview invitations, deadline reminders, new applications, an unread bell and an inbox. The unread filter was added in [PR #146](https://github.com/CobyBurah/GroupD-SOEN341/pull/146). |
| 4 | AI feature (start in Sprint 3) | Done. AI-powered resume feedback with a local Ollama model (US-18, [#119](https://github.com/CobyBurah/GroupD-SOEN341/issues/119)). |

**Team enhancements:**
- dual-role accounts ([#126](https://github.com/CobyBurah/GroupD-SOEN341/issues/126))
- locked file extension when renaming a resume ([#127](https://github.com/CobyBurah/GroupD-SOEN341/issues/127))
- applied status shown on job listings ([#143](https://github.com/CobyBurah/GroupD-SOEN341/issues/143))
- bug fix: workplace type added to search ([#122](https://github.com/CobyBurah/GroupD-SOEN341/issues/122))

### Planning process

Same as Sprints 1 and 2. Each user story is a GitHub issue in the "Sprint 3" milestone, with acceptance criteria, task sub-issues and acceptance-test sub-issues. Items move across the project board from Todo to In Progress to Done. Every change goes through a pull request, and CI runs lint, typecheck, unit tests, the build and the Playwright browser tests.

| Feature | Owners |
|---|---|
| US-16 Job search activity metrics | Nour |
| US-17 Notifications and reminders | Parsa, Eldar |
| US-18 AI resume feedback | Coby, Noah |
| US-19 Recruiter application filtering | Sabrina |
| US-20 Archive and restore postings | Noah |
| Dual roles and resume rename enhancements | Coby |
| Applied status on listings | Nour |
| Sprint 3 workplan | Noah |

### Appendix A: Sprint 3 issues

| Issue | Title | Type | Responsible | Final status |
|---|---|---|---|---|
| [#117](https://github.com/CobyBurah/GroupD-SOEN341/issues/117) | US-16 Job Search Activity Metrics | User Story | Nour | Completed ([PR #144](https://github.com/CobyBurah/GroupD-SOEN341/pull/144)) |
| [#120](https://github.com/CobyBurah/GroupD-SOEN341/issues/120), [#121](https://github.com/CobyBurah/GroupD-SOEN341/issues/121) | US-16 tasks (activity summary, chart) | Task | Nour | Completed |
| [#141](https://github.com/CobyBurah/GroupD-SOEN341/issues/141), [#142](https://github.com/CobyBurah/GroupD-SOEN341/issues/142) | AT-US16-01, AT-US16-02 | Acceptance Test | Nour | Passed |
| [#118](https://github.com/CobyBurah/GroupD-SOEN341/issues/118) | US-17 In-app notifications and reminders | User Story | Parsa, Eldar | Completed ([PR #145](https://github.com/CobyBurah/GroupD-SOEN341/pull/145), [PR #146](https://github.com/CobyBurah/GroupD-SOEN341/pull/146)) |
| [#151](https://github.com/CobyBurah/GroupD-SOEN341/issues/151) | US-17 verification against the team Supabase project | Task | Eldar | See the issue |
| [#152](https://github.com/CobyBurah/GroupD-SOEN341/issues/152) to [#155](https://github.com/CobyBurah/GroupD-SOEN341/issues/155) | AT-US17-01 to AT-US17-04 | Acceptance Test | Eldar | See each issue |
| [#119](https://github.com/CobyBurah/GroupD-SOEN341/issues/119) | US-18 AI-assisted resume feedback | User Story | Coby, Noah | Completed ([PR #140](https://github.com/CobyBurah/GroupD-SOEN341/pull/140)) |
| [#128](https://github.com/CobyBurah/GroupD-SOEN341/issues/128) to [#133](https://github.com/CobyBurah/GroupD-SOEN341/issues/133) | US-18 tasks | Task | Noah, Coby | Completed |
| [#134](https://github.com/CobyBurah/GroupD-SOEN341/issues/134) to [#139](https://github.com/CobyBurah/GroupD-SOEN341/issues/139) | AT-US18-01 to AT-US18-06 | Acceptance Test | Coby, Noah | See each issue |
| [#123](https://github.com/CobyBurah/GroupD-SOEN341/issues/123) | US-19 Recruiter Application Filtering | User Story | Sabrina | Completed ([PR #147](https://github.com/CobyBurah/GroupD-SOEN341/pull/147)) |
| [#124](https://github.com/CobyBurah/GroupD-SOEN341/issues/124), [#125](https://github.com/CobyBurah/GroupD-SOEN341/issues/125) | US-19 tasks (status filter, date filter) | Task | Sabrina | Completed |
| [#148](https://github.com/CobyBurah/GroupD-SOEN341/issues/148), [#149](https://github.com/CobyBurah/GroupD-SOEN341/issues/149) | AT-US19-01, AT-US19-02 | Acceptance Test | Sabrina | Passed |
| US-20 (issue to be created) | Archive and restore job postings | User Story | Noah | Completed (PR to be opened) |
| [#122](https://github.com/CobyBurah/GroupD-SOEN341/issues/122) | Bug: search bar doesn't include workplace type | Bug | Sabrina | Fixed ([PR #150](https://github.com/CobyBurah/GroupD-SOEN341/pull/150)) |
| [#126](https://github.com/CobyBurah/GroupD-SOEN341/issues/126) | Enhancement: log in as recruiter or job seeker | Enhancement | Coby | Completed ([PR #158](https://github.com/CobyBurah/GroupD-SOEN341/pull/158)) |
| [#127](https://github.com/CobyBurah/GroupD-SOEN341/issues/127) | Enhancement: lock the file extension when renaming a resume | Enhancement | Coby | Completed ([PR #159](https://github.com/CobyBurah/GroupD-SOEN341/pull/159)) |
| [#143](https://github.com/CobyBurah/GroupD-SOEN341/issues/143) | Enhancement: show applied status on job listings | Enhancement | Nour | Completed ([PR #157](https://github.com/CobyBurah/GroupD-SOEN341/pull/157)) |

### Database migrations added this sprint

The migrations live in `supabase/migrations/` and are applied in order in the Supabase SQL editor.

| Migration | Purpose |
|---|---|
| `0016_resume_feedback.sql` | US-18 feedback storage with owner-only RLS |
| `0017_notifications.sql` | US-17 notifications table, triggers and the deadline reminder RPC |
| `0018_dual_roles.sql` | Dual-role accounts |
| `0019_job_archive.sql` | US-20 archive column and policies. Reminders now skip archived postings and follow the account's roles. |
| `0020_security_hardening.sql` | Supabase advisor fixes: revoke RPC access to trigger functions and add foreign-key indexes |
