# Sprint 4 Workplan

**Project** CareerConnect, GroupD-SOEN341

**Sprint** November 17 to December 7, 2026

**Prepared by** Parsa Morshedlou with Codex assistance

**Status snapshot** November 22, 2026, main at `ce9a5b1`

## Goals and responsibilities

| Goal | Deliverable and owner |
|---|---|
| Finalize six feature areas | Authentication/profiles/resumes, Coby #207. Search, Nour #208. Applications, Parsa #209. Recruiter management, Sabrina #210. Notifications, Eldar #211, and analytics, Nour #212. AI features, Noah #213. |
| Complete and validate both AI features | Noah's US-21 matching #167 and US-18 feedback validation #188/#213. Trace the prompts, input boundaries, observed results and failure cases. |
| Maintain build and security checks | Noah #166/#189/#190/#191. The repository currently has nine workflow files for lint, typecheck, unit tests, build, E2E, migrations, dependency audit, CodeQL and PR checks. |
| Fix and verify discovered defects | Sabrina #195-197 for deadlines, Nour #198-199 for search, Parsa #200 for the app icon. Coby owns Auth protection #194. |
| Review and prepare submission | Coby #193 for review enforcement, Eldar #202/#203/#204 for organization, QA cleanup and final report, Sabrina #205 for minutes, Parsa #201/#206 for this plan and demo preparation. Each member owns their contribution and AI PDF in #214-219. |

All 54 Sprint 4 issues were verified in the milestone and project board on November 22. Each has Priority, Size, Start date and Target date. The table copies those existing board values. Parsa’s active items are In progress. A closed issue records GitHub’s observed state. Later product or policy changes may require its acceptance checks to run again. [Project board](https://github.com/users/CobyBurah/projects/2)

## Sequence and dependencies

1. Review the icon and planning changes, finish the deadline and search fixes, and complete review/security settings by November 28.
2. Run each feature area's final checks on a recorded main revision by December 3. Application verification #209 requires team Supabase access for the live steps. Parsa requested that live execution be deferred in this session.
3. Coordinate QA cleanup #203 with the demo dataset in #206. Use identified disposable fixtures and preserve the demo accounts. Eldar owns the shared-project cleanup.
4. Rehearse the complete demo by December 5. Both AI features need a running Ollama model on the presentation machine. Each teammate supplies their own explanation of their contribution and AI decisions.
5. Update the one-page report, all six contribution logs and personal AI PDFs before December 7.

## Issues and board schedule

Priority and Size are the board’s existing relative estimates. Start and Target are planned dates, including dates on already completed items. The icon and workplan targets were November 21 and remain outstanding at this snapshot.

| Issue | Work | Owner | GitHub state | Priority / Size | Start | Target |
|---|---|---|---|---|---|---|
| [#166](https://github.com/CobyBurah/GroupD-SOEN341/issues/166) | Maintenance: upgrade Next.js to 16.4.6 to fix critical vulnerabilities | Noah | Closed | P0 / S | 2026-11-19 | 2026-11-20 |
| [#167](https://github.com/CobyBurah/GroupD-SOEN341/issues/167) | US-21: AI job matching suggestions | Noah | Closed | P0 / L | 2026-11-17 | 2026-11-28 |
| [#168](https://github.com/CobyBurah/GroupD-SOEN341/issues/168) | UC-01 (US-21): Get job matches for a resume | Noah | Closed | P1 / XS | 2026-11-17 | 2026-11-18 |
| [#169](https://github.com/CobyBurah/GroupD-SOEN341/issues/169) | UC-02 (US-21): No suitable postings | Noah | Closed | P1 / XS | 2026-11-17 | 2026-11-18 |
| [#170](https://github.com/CobyBurah/GroupD-SOEN341/issues/170) | UC-03 (US-21): AI service unavailable or invalid output | Noah | Closed | P1 / XS | 2026-11-17 | 2026-11-18 |
| [#171](https://github.com/CobyBurah/GroupD-SOEN341/issues/171) | UC-04 (US-21): Resume cannot be read | Noah | Closed | P1 / XS | 2026-11-17 | 2026-11-18 |
| [#172](https://github.com/CobyBurah/GroupD-SOEN341/issues/172) | UC-05 (US-21): Unauthorized use is refused | Noah | Closed | P1 / XS | 2026-11-17 | 2026-11-18 |
| [#173](https://github.com/CobyBurah/GroupD-SOEN341/issues/173) | UC-06 (US-21): Apply from a match | Noah | Closed | P1 / XS | 2026-11-17 | 2026-11-18 |
| [#174](https://github.com/CobyBurah/GroupD-SOEN341/issues/174) | US-21 task: job matching helpers (keyword pre-ranking, prompt, JSON schema, parser) | Noah | Closed | P0 / M | 2026-11-17 | 2026-11-20 |
| [#175](https://github.com/CobyBurah/GroupD-SOEN341/issues/175) | US-21 task: Ollama client for job matches | Noah | Closed | P0 / S | 2026-11-20 | 2026-11-21 |
| [#176](https://github.com/CobyBurah/GroupD-SOEN341/issues/176) | US-21 task: POST /api/job-matches route | Noah | Closed | P0 / M | 2026-11-21 | 2026-11-23 |
| [#177](https://github.com/CobyBurah/GroupD-SOEN341/issues/177) | US-21 task: AI matches page with header and dashboard links | Noah | Closed | P0 / M | 2026-11-23 | 2026-11-25 |
| [#178](https://github.com/CobyBurah/GroupD-SOEN341/issues/178) | US-21 task: unit, route and Playwright tests for job matching | Noah | Closed | P0 / M | 2026-11-23 | 2026-11-26 |
| [#179](https://github.com/CobyBurah/GroupD-SOEN341/issues/179) | US-21 task: use cases and acceptance tests for job matching | Noah | Closed | P0 / S | 2026-11-17 | 2026-11-19 |
| [#180](https://github.com/CobyBurah/GroupD-SOEN341/issues/180) | AT-US21-01: Get relevant matches for a resume | Noah | Closed | P0 / XS | 2026-11-27 | 2026-11-28 |
| [#181](https://github.com/CobyBurah/GroupD-SOEN341/issues/181) | AT-US21-02: Only open, not-yet-applied postings are suggested | Noah | Closed | P0 / XS | 2026-11-27 | 2026-11-28 |
| [#182](https://github.com/CobyBurah/GroupD-SOEN341/issues/182) | AT-US21-03: No suitable postings shows an empty state | Noah | Closed | P0 / XS | 2026-11-27 | 2026-11-28 |
| [#183](https://github.com/CobyBurah/GroupD-SOEN341/issues/183) | AT-US21-04: AI failures show an error, never invented matches | Noah | Closed | P0 / XS | 2026-11-27 | 2026-11-28 |
| [#184](https://github.com/CobyBurah/GroupD-SOEN341/issues/184) | AT-US21-05: Unreadable resumes are rejected before matching | Noah | Closed | P0 / XS | 2026-11-27 | 2026-11-28 |
| [#185](https://github.com/CobyBurah/GroupD-SOEN341/issues/185) | AT-US21-06: Only job seekers can use matching, with their own resumes | Noah | Closed | P0 / XS | 2026-11-27 | 2026-11-28 |
| [#186](https://github.com/CobyBurah/GroupD-SOEN341/issues/186) | Bug: instructions written in a resume override the AI resume feedback | Noah | Closed | P1 / S | 2026-11-26 | 2026-11-29 |
| [#187](https://github.com/CobyBurah/GroupD-SOEN341/issues/187) | AT-BUG-AIINJ-01: Instructions inside a resume do not change the AI feedback | Noah | Closed | P1 / XS | 2026-11-28 | 2026-11-29 |
| [#188](https://github.com/CobyBurah/GroupD-SOEN341/issues/188) | Document AI feature validation (resume feedback and job matching) | Noah | Closed | P0 / M | 2026-11-24 | 2026-11-30 |
| [#189](https://github.com/CobyBurah/GroupD-SOEN341/issues/189) | CI/CD: split the pipeline into separate workflows | Noah | Closed | P0 / M | 2026-11-18 | 2026-11-21 |
| [#190](https://github.com/CobyBurah/GroupD-SOEN341/issues/190) | Static analysis: add CodeQL and dependency audit to CI | Noah | Closed | P0 / M | 2026-11-19 | 2026-11-23 |
| [#191](https://github.com/CobyBurah/GroupD-SOEN341/issues/191) | Static analysis: document and fix CodeQL findings | Noah | Closed | P1 / M | 2026-11-24 | 2026-12-02 |
| [#192](https://github.com/CobyBurah/GroupD-SOEN341/issues/192) | Repository: remove unused AI-assistant instruction files | Noah | Closed | P2 / XS | 2026-11-19 | 2026-11-20 |
| [#193](https://github.com/CobyBurah/GroupD-SOEN341/issues/193) | Process: require code review on main (branch protection, templates) | Coby | Open | P1 / S | 2026-11-19 | 2026-11-24 |
| [#194](https://github.com/CobyBurah/GroupD-SOEN341/issues/194) | Security: enable leaked password protection in Supabase Auth | Coby | Open | P2 / XS | 2026-11-20 | 2026-11-21 |
| [#195](https://github.com/CobyBurah/GroupD-SOEN341/issues/195) | Bug: job seekers can apply after the application deadline | Sabrina | Open | P0 / M | 2026-11-18 | 2026-11-22 |
| [#196](https://github.com/CobyBurah/GroupD-SOEN341/issues/196) | AT-BUG-DEADLINE-01: Past deadlines are rejected on publish and edit | Sabrina | Open | P0 / XS | 2026-11-21 | 2026-11-22 |
| [#197](https://github.com/CobyBurah/GroupD-SOEN341/issues/197) | AT-BUG-DEADLINE-02: Expired postings leave listings and refuse applications | Sabrina | Open | P0 / XS | 2026-11-21 | 2026-11-22 |
| [#198](https://github.com/CobyBurah/GroupD-SOEN341/issues/198) | Bug: job search fails with surrounding spaces and treats % _ \ as wildcards | Nour | Open | P1 / S | 2026-11-21 | 2026-11-24 |
| [#199](https://github.com/CobyBurah/GroupD-SOEN341/issues/199) | AT-BUG-SEARCH-01: Search ignores surrounding spaces and matches % literally | Nour | Open | P1 / XS | 2026-11-23 | 2026-11-24 |
| [#200](https://github.com/CobyBurah/GroupD-SOEN341/issues/200) | Enhancement: add an app icon (favicon returns 404) | Parsa | Open | P2 / XS | 2026-11-20 | 2026-11-21 |
| [#201](https://github.com/CobyBurah/GroupD-SOEN341/issues/201) | Sprint 4 workplan and user stories | Parsa | Open | P1 / S | 2026-11-17 | 2026-11-21 |
| [#202](https://github.com/CobyBurah/GroupD-SOEN341/issues/202) | Repository: reorganize structure and add a docs index | Eldar | Closed | P1 / S | 2026-11-22 | 2026-11-26 |
| [#203](https://github.com/CobyBurah/GroupD-SOEN341/issues/203) | Clean QA and test data from Supabase before the demo | Eldar | Open | P1 / XS | 2026-12-01 | 2026-12-03 |
| [#204](https://github.com/CobyBurah/GroupD-SOEN341/issues/204) | Sprint 4 summary report | Eldar | Open | P0 / M | 2026-12-02 | 2026-12-06 |
| [#205](https://github.com/CobyBurah/GroupD-SOEN341/issues/205) | Sprint 4 meeting minutes | Sabrina | Open | P1 / S | 2026-11-17 | 2026-12-06 |
| [#206](https://github.com/CobyBurah/GroupD-SOEN341/issues/206) | Prepare the Sprint 4 demo | Parsa | Open | P1 / S | 2026-12-04 | 2026-12-07 |
| [#207](https://github.com/CobyBurah/GroupD-SOEN341/issues/207) | Sprint 4 verification: Feature 1 - authentication, profiles and resumes | Coby | Open | P0 / S | 2026-11-28 | 2026-12-04 |
| [#208](https://github.com/CobyBurah/GroupD-SOEN341/issues/208) | Sprint 4 verification: Feature 2 - job search and listings | Nour | Open | P0 / S | 2026-11-28 | 2026-12-04 |
| [#209](https://github.com/CobyBurah/GroupD-SOEN341/issues/209) | Sprint 4 verification: Feature 3 - application submission and tracking | Parsa | Open | P0 / S | 2026-11-28 | 2026-12-04 |
| [#210](https://github.com/CobyBurah/GroupD-SOEN341/issues/210) | Sprint 4 verification: Feature 4 - recruiter dashboard and posting management | Sabrina | Open | P0 / S | 2026-11-28 | 2026-12-04 |
| [#211](https://github.com/CobyBurah/GroupD-SOEN341/issues/211) | Sprint 4 verification: Feature 5 - notifications and reminders | Eldar | Closed | P0 / S | 2026-11-28 | 2026-12-04 |
| [#212](https://github.com/CobyBurah/GroupD-SOEN341/issues/212) | Sprint 4 verification: Feature 5 - analytics dashboard | Nour | Open | P0 / S | 2026-11-28 | 2026-12-04 |
| [#213](https://github.com/CobyBurah/GroupD-SOEN341/issues/213) | Sprint 4 verification: Feature 6 - AI-enhanced features | Noah | Closed | P0 / S | 2026-11-28 | 2026-12-04 |
| [#214](https://github.com/CobyBurah/GroupD-SOEN341/issues/214) | Sprint 4 contribution log and AI log PDF: Noah | Noah | Closed | P0 / S | 2026-11-30 | 2026-12-06 |
| [#215](https://github.com/CobyBurah/GroupD-SOEN341/issues/215) | Sprint 4 contribution log and AI log PDF: Coby | Coby | Open | P0 / S | 2026-11-30 | 2026-12-06 |
| [#216](https://github.com/CobyBurah/GroupD-SOEN341/issues/216) | Sprint 4 contribution log and AI log PDF: Nour | Nour | Open | P0 / S | 2026-11-30 | 2026-12-06 |
| [#217](https://github.com/CobyBurah/GroupD-SOEN341/issues/217) | Sprint 4 contribution log and AI log PDF: Eldar | Eldar | Open | P0 / S | 2026-11-30 | 2026-12-06 |
| [#218](https://github.com/CobyBurah/GroupD-SOEN341/issues/218) | Sprint 4 contribution log and AI log PDF: Parsa | Parsa | Open | P0 / S | 2026-11-30 | 2026-12-06 |
| [#219](https://github.com/CobyBurah/GroupD-SOEN341/issues/219) | Sprint 4 contribution log and AI log PDF: Sabrina | Sabrina | Open | P0 / S | 2026-11-30 | 2026-12-06 |

## Branches and review

The issue bodies name these branches. Use one reviewed PR for a distinct change. Additional evidence/demo changes use `test/sprint4-applications` and `docs/sprint4-demo`.

| Issue | Branch from issue |
|---|---|
| [#166](https://github.com/CobyBurah/GroupD-SOEN341/issues/166) | `chore/upgrade-nextjs-security` |
| [#167](https://github.com/CobyBurah/GroupD-SOEN341/issues/167) | `feature/ai-job-matching` |
| [#174](https://github.com/CobyBurah/GroupD-SOEN341/issues/174) | `feature/ai-job-matching` |
| [#175](https://github.com/CobyBurah/GroupD-SOEN341/issues/175) | `feature/ai-job-matching` |
| [#176](https://github.com/CobyBurah/GroupD-SOEN341/issues/176) | `feature/ai-job-matching` |
| [#177](https://github.com/CobyBurah/GroupD-SOEN341/issues/177) | `feature/ai-job-matching` |
| [#178](https://github.com/CobyBurah/GroupD-SOEN341/issues/178) | `feature/ai-job-matching` |
| [#179](https://github.com/CobyBurah/GroupD-SOEN341/issues/179) | `feature/ai-job-matching` |
| [#186](https://github.com/CobyBurah/GroupD-SOEN341/issues/186) | `fix/ai-prompt-injection` |
| [#188](https://github.com/CobyBurah/GroupD-SOEN341/issues/188) | `docs/ai-feature-validation` |
| [#189](https://github.com/CobyBurah/GroupD-SOEN341/issues/189) | `ci/split-workflows` |
| [#190](https://github.com/CobyBurah/GroupD-SOEN341/issues/190) | `ci/static-analysis` |
| [#191](https://github.com/CobyBurah/GroupD-SOEN341/issues/191) | `fix/static-analysis-findings` |
| [#192](https://github.com/CobyBurah/GroupD-SOEN341/issues/192) | `chore/remove-unused-files` |
| [#195](https://github.com/CobyBurah/GroupD-SOEN341/issues/195) | `fix/job-deadline-enforcement` |
| [#198](https://github.com/CobyBurah/GroupD-SOEN341/issues/198) | `fix/job-search-escaping` |
| [#200](https://github.com/CobyBurah/GroupD-SOEN341/issues/200) | `enhancement/favicon` |
| [#201](https://github.com/CobyBurah/GroupD-SOEN341/issues/201) | `docs/sprint4-planning` |
| [#202](https://github.com/CobyBurah/GroupD-SOEN341/issues/202) | `chore/repo-organization` |
| [#204](https://github.com/CobyBurah/GroupD-SOEN341/issues/204) | `docs/sprint4-report` |
| [#205](https://github.com/CobyBurah/GroupD-SOEN341/issues/205) | `docs/sprint4-minutes` |
| [#214](https://github.com/CobyBurah/GroupD-SOEN341/issues/214) | `docs/noah-sprint4-logs` |
| [#215](https://github.com/CobyBurah/GroupD-SOEN341/issues/215) | `docs/coby-sprint4-logs` |
| [#216](https://github.com/CobyBurah/GroupD-SOEN341/issues/216) | `docs/nour-sprint4-logs` |
| [#217](https://github.com/CobyBurah/GroupD-SOEN341/issues/217) | `docs/eldar-sprint4-logs` |
| [#218](https://github.com/CobyBurah/GroupD-SOEN341/issues/218) | `docs/parsa-sprint4-logs` |
| [#219](https://github.com/CobyBurah/GroupD-SOEN341/issues/219) | `docs/sabrina-sprint4-logs` |

PRs link their issue, carry a type label and the Sprint 4 milestone, and request another member's review. The reviewer checks correctness, maintainability, security, performance, tests and documentation. CI results and acceptance evidence must identify the tested revision and environment. After approval and merge, verify issue closure and update the attached board item. [Review guide](../../docs/quality/code-review.md)

## Deliverables and evidence

- [Product backlog](../../User_Stories.md) includes US-21 and the US-18 validation follow-up.
- [Contribution log template](CONTRIBUTION_LOG_TEMPLATE.md) records issues, authored/reviewed PRs, meetings and reported time.
- [Summary report draft](Sprint4_Summary_Report.md) is available to Eldar for #204.
- [AI validation results](../../docs/ai-validation/sprint4-acceptance-results.md) record Noah's live November 21 checks.
- [Notification verification](../../docs/notifications/acceptance/2026-11-22/README.md) records Eldar's live November 22 checks.
- The [meeting-minutes task #205](https://github.com/CobyBurah/GroupD-SOEN341/issues/205) belongs to Sabrina. Parsa requested that meeting-minute edits be skipped.
- Personal AI reports belong in each member's `AI_Log` folder as PDFs. Personal hours, meeting attendance and review approvals must be supplied by the responsible member or linked GitHub evidence.
