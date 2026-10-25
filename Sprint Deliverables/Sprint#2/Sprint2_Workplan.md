## Sprint 2 Workplan

**Project:** CareerConnect — GroupD-SOEN341
**Sprint:** 2
**Document created:** 2026-10-25 (end of sprint, consolidating the plan set at the two Sprint 2 meetings and its final status — see note at the bottom)

### Sprint 2 goals

Per the course guidelines, Sprint 2 targets:

1. Continued, iterative feature delivery against this plan.
2. Sound project management practice (backlog, task breakdown, CI).
3. Transparent, documented use of AI throughout the process.
4. Meeting minutes.

The four required features, and how far each got this sprint:

| # | Required feature | Status |
|---|---|---|
| 1 | User profile and resume management | Done — profile edit/persist (carried from Sprint 1, [#7](https://github.com/CobyBurah/GroupD-SOEN341/issues/7)) plus resume upload, replace, rename, delete ([#39](https://github.com/CobyBurah/GroupD-SOEN341/issues/39)) |
| 2 | Job search and job listing interface | Done — search, filters, pagination, job details ([#42](https://github.com/CobyBurah/GroupD-SOEN341/issues/42)) |
| 3 | Job application submission and tracking | Done — submission with Applied status ([#44](https://github.com/CobyBurah/GroupD-SOEN341/issues/44)), status tracking and history split out as its own story ([#78](https://github.com/CobyBurah/GroupD-SOEN341/issues/78)) |
| 4 | Recruiter dashboard and posting management (start in Sprint 2, finish Sprint 3) | Further along than required — full CRUD, ownership enforcement, and reviewing received applications all shipped this sprint ([#40](https://github.com/CobyBurah/GroupD-SOEN341/issues/40)) |

Team-original feature added this sprint: **saved jobs / Favourites** ([#68](https://github.com/CobyBurah/GroupD-SOEN341/issues/68)), decided at the second Sprint 2 meeting (see `Meeting_Minutes/Meeting-Sprint#2.md`).

### Planning process

Same approach as Sprint 1: each story and task is a GitHub issue with an assignee, acceptance criteria, and a priority, moved across the project board (Backlog → In Progress → In Review → Done) as work progressed. Feature ownership was assigned at the first Sprint 2 meeting (October 8) and reviewed at the second (October 19):

| Feature | Owners |
|---|---|
| Resume management | Noah, Coby |
| Job search & listing UI | Sabrina, Nour |
| Job application submission & tracking | Coby, Noah, Eldar |
| Recruiter dashboard & posting management | Eldar, Parsa |
| Favourites (added mid-sprint) | Noah |
| Sprint planning document | Nour |
| Meeting minutes | Sabrina |

### Appendix A — Sprint 2 issues

| Issue # | Issue Title | Issue Type | Responsible Member(s) | Priority | Final Status |
|---|---|---|---|---|---|
| [#39](https://github.com/CobyBurah/GroupD-SOEN341/issues/39) | US-04 — Resume management | User Story | Coby, Noah | High | Completed |
| [#40](https://github.com/CobyBurah/GroupD-SOEN341/issues/40) | US-05 — Recruiter job posting management | User Story | Parsa, Eldar | High | Completed |
| [#42](https://github.com/CobyBurah/GroupD-SOEN341/issues/42) | US-06 — Job Search, Filtering & Job Listing Interface | User Story | Sabrina, Nour | High | Completed |
| [#44](https://github.com/CobyBurah/GroupD-SOEN341/issues/44) | US-08 — Job application submission | User Story | Coby, Noah | High | Completed |
| [#68](https://github.com/CobyBurah/GroupD-SOEN341/issues/68) | US-07 — Saved jobs (Favourites) | User Story | Noah | Medium | Completed |
| [#78](https://github.com/CobyBurah/GroupD-SOEN341/issues/78) | US-09 — Application status and history | User Story | Coby, Noah | High | Completed |
| [#59](https://github.com/CobyBurah/GroupD-SOEN341/issues/59) | Forgot password feature | Task | Coby | Medium | Completed |
| [#45](https://github.com/CobyBurah/GroupD-SOEN341/issues/45)–[#53](https://github.com/CobyBurah/GroupD-SOEN341/issues/53), [#55](https://github.com/CobyBurah/GroupD-SOEN341/issues/55) | US-06 task breakdown (jobs table, search bar, filters, listing page, job details) | Task | Sabrina, Nour | High | Completed |
| [#70](https://github.com/CobyBurah/GroupD-SOEN341/issues/70)–[#72](https://github.com/CobyBurah/GroupD-SOEN341/issues/72) | US-06 acceptance tests | Acceptance Test | Sabrina | High | Completed |
| [#85](https://github.com/CobyBurah/GroupD-SOEN341/issues/85)–[#106](https://github.com/CobyBurah/GroupD-SOEN341/issues/106) | Acceptance tests for every Sprint 1 and Sprint 2 user story (2+ per story) | Acceptance Test | Coby, Noah, Eldar, Parsa, Sabrina, Nour | High | Completed, except [#85](https://github.com/CobyBurah/GroupD-SOEN341/issues/85) (password-reset email, in progress) and [#100](https://github.com/CobyBurah/GroupD-SOEN341/issues/100) (FAIL, bug filed as [#108](https://github.com/CobyBurah/GroupD-SOEN341/issues/108)) |
| [#108](https://github.com/CobyBurah/GroupD-SOEN341/issues/108) | Bug: `/jobs` pagination resets to page 1 on reload or deep link | Bug | Sabrina, Nour | Medium | Open |
| [#65](https://github.com/CobyBurah/GroupD-SOEN341/issues/65) | CI pipeline (lint, typecheck, tests, build, Playwright) | Task | Noah | High | Completed |
| Meeting minutes (`Meeting_Minutes/Meeting-Sprint#2.md`) | Task | Sabrina | Medium | Completed |
| This document | Task | Nour | Medium | Completed |

### Note on this document's timing

Sprint 2's plan was set and tracked live at the two meetings recorded in `Meeting_Minutes/Meeting-Sprint#2.md` and on the GitHub project board throughout the sprint. This file consolidates that plan and its final status into the same Appendix-A format used in Sprint 1, written at sprint close rather than at sprint open — unlike Sprint 1, where `Sprint1_Workplan.md` was the planning artifact itself. Treat the meeting minutes as the primary record of in-sprint planning decisions and this document as the end-of-sprint summary.
