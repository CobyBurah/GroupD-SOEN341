# Sprint 3 Individual Contribution Log

**Team member:** Eldar Sadeghi

**GitHub username:** EldarSadeghi

**Project:** CareerConnect — GroupD-SOEN341

**Sprint:** 3

## Contributions and time spent

| Date | Activity | Contribution | Evidence |
|---|---|---|---|
| November 13, 2026 | Notifications and Reminders (US-17): planning and implementation | Compared the Sprint 3 requirements with the existing project and directed the AI-assisted implementation of the missing notification feature. Added application-status updates and interview alerts for seekers, plus new-application alerts for the posting owner. Database triggers generate the application events. | [Story #118](https://github.com/CobyBurah/GroupD-SOEN341/issues/118); [PR #145](https://github.com/CobyBurah/GroupD-SOEN341/pull/145); [implementation commit](https://github.com/CobyBurah/GroupD-SOEN341/commit/171ebcc8e2703387b9fbcaa10edbcb5ad82b4be6) |
| November 13, 2026 | Deadline reminders and private notification inbox | Added an optional UTC application deadline to recruiter postings; reminders for saved/applied-to active jobs due within three days; a notification bell with unread count; and an inbox with individual/all mark-as-read actions. Included recipient-only database access, persistent read state, pagination and retry feedback. | [PR #145](https://github.com/CobyBurah/GroupD-SOEN341/pull/145); [setup and behavior documentation](../../docs/notifications/README.md); [migration 0017](../../supabase/migrations/0017_notifications.sql) |
| November 13, 2026 | Automated validation and local demonstration | Used Codex to run database/helper and browser tests, inspect desktop/mobile screenshots, correct bell contrast and request-origin handling, and stabilize a recruiter test's server-validation timing race. Requested a local demonstration using synthetic recruiter/seeker accounts. | [Verification record](../../docs/notifications/verification.md); [database tests](../../tests/notifications.test.mjs); [browser tests](../../tests/browser/notifications.spec.mjs); [desktop evidence](../../docs/notifications/evidence/notifications-desktop.png); [mobile evidence](../../docs/notifications/evidence/notifications-mobile.png) |
| November 14, 2026 | Acceptance-test preparation, local execution and GitHub publication | Prepared and published four acceptance scenarios covering status/interview alerts, recruiter alerts, deadline reminders and inbox privacy/behavior. Linked the parent story and verification task, recorded observed local automated results, and kept unexecuted live steps explicit. | [Verification task #151](https://github.com/CobyBurah/GroupD-SOEN341/issues/151); [#152](https://github.com/CobyBurah/GroupD-SOEN341/issues/152), [#153](https://github.com/CobyBurah/GroupD-SOEN341/issues/153), [#154](https://github.com/CobyBurah/GroupD-SOEN341/issues/154), [#155](https://github.com/CobyBurah/GroupD-SOEN341/issues/155) |
| November 14, 2026 | AI usage documentation | Organized the AI records into one personal folder with separate sprint files, documented prompts/output/validation/decisions, preserved detailed dated records in an archive, and authorized publication and merge of the documentation. | [AI log PR #156](https://github.com/CobyBurah/GroupD-SOEN341/pull/156); [Sprint 3 AI log](../../AI_Log/Eldar_AI_Log/Sprint%233.md) |

**Total estimated personal time: approximately 3 hours**, supplied by Eldar on November 15, 2026 for the Sprint 3 notification/reminder work and acceptance-test preparation. No per-activity time breakdown was supplied; the total is not AI runtime and does not reuse Sprint 2 estimates. AI-log organization is documented above without adding an unreported amount of time.

## Validation and current status

- Notification implementation PR [#145](https://github.com/CobyBurah/GroupD-SOEN341/pull/145) and AI-log organization PR [#156](https://github.com/CobyBurah/GroupD-SOEN341/pull/156) are merged into `main`.
- November 13 local checks: **49 unit/database tests passed**; typecheck and production test build passed. ESLint reported no errors and one existing unused-parameter warning.
- The full installed-Chrome browser suite finished with **24 passes and 4 resume/AI-feedback console-404 failures**. The same four failures reproduced on unchanged `main`; both new notification browser scenarios passed.
- November 14 acceptance verification on revision `ac2cb7c`: the test build, **2 notification database/helper tests, 2 notification browser scenarios and 1 existing application-constraint test passed**.
- The four GitHub acceptance issues record **supporting local automated verification: PASS** and **overall live Supabase acceptance: PENDING / NOT RUN**. They remain open; no completed manual live acceptance testing is claimed here.
- Deadline reminders are generated on signed-in app use, not by an offline background scheduler. The work recorded here did not apply migration 0017 or mutate test accounts in the shared Supabase project.

## AI assistance and attribution

I used OpenAI Codex as an implementation, testing and documentation assistant. I supplied the requirements, requested the local implementation and demonstration, authorized the feature's publication for review, requested acceptance testing and AI-log organization, and supplied the approximately 3-hour personal effort estimate.

Codex generated code, migration, tests and documentation; ran the local automated checks; inspected screenshots; and executed Git/GitHub publication commands after authorization. These are AI-assisted activities, not claims that I manually wrote every line or personally executed the live acceptance scenarios. The [Sprint 3 AI log](../../AI_Log/Eldar_AI_Log/Sprint%233.md) records the prompts, outputs, decisions, evidence and limits in more detail.

US-17 was assigned jointly to Eldar and Parsa in the sprint discussions. This log records Eldar's involvement and the AI-assisted work published through PR #145; it does not claim or estimate Parsa's individual effort or authorship of separate follow-up work.
