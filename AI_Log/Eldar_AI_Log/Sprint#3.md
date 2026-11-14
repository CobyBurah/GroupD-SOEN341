# AI Log #1 - Sprint 3
November 13, 2026

**Task ID/Title:**
- US-17 — Implement in-app Notifications and Reminders (#118)

**Purpose of AI Use:**
- Check whether Sprint 3 notifications existed, then implement the missing feature locally.
- Support status/interview alerts, recruiter new-application alerts, upcoming deadlines and a private inbox.

**AI Tool and Link to conversation:**
- Tool: OpenAI Codex (desktop app).
- Public conversation link: not supplied. Recorded prompt excerpts and evidence are included below.

**Prompt excerpts:**
- “Implement the task number 3. Do not push anything until you get approval from me.”

**AI-Suggested Content:**
- Migration 0017: deadline column, private notifications table, database event triggers and caller-scoped reminder function.
- Notification API, unread bell, inbox, mark-one/all-read actions and optional recruiter deadline input.
- Database/browser tests, synthetic fixture support, setup notes and screenshots.

**Validation:**
- 49 unit/database tests passed; typecheck and production test build passed.
- ESLint: no errors, one existing unused-parameter warning.
- Full installed-Chrome suite: 24 passed, 4 resume/AI-feedback console-404 failures, also reproduced on untouched main. Both new notification browser scenarios passed.
- Inspected desktop/mobile screenshots and corrected bell contrast. Fixed the origin comparison after a browser failure and stabilized the recruiter test's server-validation timing race.

**Decision:**
- Persist application events using database triggers.
- Generate one reminder per user/job/deadline within three UTC days on signed-in app use, avoiding a cron dependency.
- Treat Interview status as an invitation alert, not interview scheduling.
- Enforce recipient privacy through database permissions as well as API scoping. Do not apply a shared migration during local development.

**Reflection / review notes:**
- Database tests catch privacy/trigger behavior that a synthetic browser fixture cannot establish. Screenshot review also caught a visibility issue that functional assertions initially missed.

**Evidence:**
- [Story #118](https://github.com/CobyBurah/GroupD-SOEN341/issues/118); [PR #145](https://github.com/CobyBurah/GroupD-SOEN341/pull/145).
- [Verification](../../docs/notifications/verification.md); [detailed implementation record](archive/2026-11-13-notifications.md).

**Responsible Person:**
- Eldar Sadeghi, who requested the AI assistance. AI-assisted execution and shared implementation credit are identified explicitly.

# AI Log #2 - Sprint 3
November 13, 2026

**Task ID/Title:**
- Local demonstration and publication for review

**Purpose of AI Use:**
- Show how seeker/recruiter notifications work using synthetic accounts.
- Publish the feature only after the user authorizes a review branch.

**AI Tool and Link to conversation:**
- Tool: OpenAI Codex (desktop app).
- Public conversation link: not supplied. Recorded prompt excerpts and evidence are included below.

**Prompt excerpts:**
- “can I see how this works”
- “lets push this so someone can review then merge it”

**AI-Suggested Content:**
- Started the local fixture preview and populated synthetic jobs, resumes, applications and example alerts.
- Prepared commit 171ebcc and PR #145 with setup requirements, test outcomes, screenshot links and migration limitations.

**Validation:**
- Verified the recruiter's new-application alert in the browser. Automated tests separately demonstrated seeker interview/deadline alerts and read state.
- Checked the pushed commit and open PR against main.

**Decision:**
- Publish only notification implementation/tests/docs and its AI log; leave unrelated Sprint 2 drafts outside the commit.
- Open the PR for team review instead of merging it in that step. Do not claim a live migration was applied.

**Reflection / review notes:**
- An interactive synthetic demo is useful for reviewing behavior, while shared-database deployment remains a separate integration step.

**Evidence:**
- [Implementation commit](https://github.com/CobyBurah/GroupD-SOEN341/commit/171ebcc8e2703387b9fbcaa10edbcb5ad82b4be6); [PR #145](https://github.com/CobyBurah/GroupD-SOEN341/pull/145).

**Responsible Person:**
- Eldar Sadeghi, who requested the AI assistance. AI-assisted execution and shared implementation credit are identified explicitly.

# AI Log #3 - Sprint 3
November 14, 2026

**Task ID/Title:**
- US-17 acceptance-test execution and GitHub publication

**Purpose of AI Use:**
- Check Sprint 3 acceptance-test coverage and publish the notification scenarios.
- Rerun local checks and record the actual evidence and remaining gaps.

**AI Tool and Link to conversation:**
- Tool: OpenAI Codex (desktop app).
- Public conversation link: not supplied. Recorded prompt excerpts and evidence are included below.

**Prompt excerpts:**
- “Check if there has been acceptance tests implemented for sprint 3”
- “do the acceptance test for my notifications/reminders feature.”
- “did you record the status marked as PASS in github?”

**AI-Suggested Content:**
- Published verification task #151 and four Acceptance Test issues #152–155, linked to #118 and PR #145, assigned to Eldar and in Sprint 3.
- Retained new logs and screenshots locally and added per-scenario observed outcomes/unexecuted steps.

**Validation:**
- Tested revision ac2cb7c: test build passed; 2 notification database/helper tests, 2 browser scenarios and 1 application-constraint test passed.
- Browser checks covered recruiter/seeker alerts, deadlines, read state, privacy, 24-alert pagination, error/retry and mobile layout.
- Confirmed all four published acceptance issues were open, labeled, assigned and in the milestone.

**Decision:**
- Record supporting local automated verification as PASS while overall live Supabase acceptance remains PENDING / NOT RUN.
- Do not close tests or claim manual live execution without dedicated accounts and migration verification.
- Keep new evidence files local until separately published.

**Reflection / review notes:**
- The test status needs to identify which checks actually ran. A local pass does not establish that every step of the live scenario has been executed.

**Evidence:**
- [Verification task #151](https://github.com/CobyBurah/GroupD-SOEN341/issues/151); [#152](https://github.com/CobyBurah/GroupD-SOEN341/issues/152), [#153](https://github.com/CobyBurah/GroupD-SOEN341/issues/153), [#154](https://github.com/CobyBurah/GroupD-SOEN341/issues/154), [#155](https://github.com/CobyBurah/GroupD-SOEN341/issues/155).
- [Detailed dated record](archive/2026-11-14-notification-acceptance.md).

**Responsible Person:**
- Eldar Sadeghi, who requested the AI assistance. AI-assisted execution and shared implementation credit are identified explicitly.
