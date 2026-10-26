# Sprint 2 AI Usage Log — Submitted Resume Versions

Dates: October 25–26, 2026. Responsible member: Parsa Morshedlou (`bluwine`). Tool: OpenAI Codex. Work began in the shared ChatGPT conversation and continued in the desktop app after a GitHub integration permission failure.

## Feature 4: Recruiter Dashboard and Posting Management

Parsa selected submitted-resume version preservation as an improvement connected to his assigned recruiter work. He reported approximately two hours of human effort for the work, including directing/reviewing it and getting it published. This is Parsa's estimate, not AI runtime.

### Preserve the resume originally submitted with an application

- **Purpose and request:** Identify unfinished work connected to Parsa's recruiter tasks, then implement the selected improvement so later resume changes do not alter the file attached to an existing application.
- **AI-generated output:** Migration 0015 with trusted snapshot capture, legacy backfill and file-retention policies; authenticated application-specific resume downloads; seeker/recruiter UI changes; withdrawal and account-cleanup handling; regression tests; deployment/demo instructions; contribution and AI logs.
- **Decisions and modifications:** Derive the submitted filename and storage path from an owned resume in a database trigger. Keep referenced file objects immutable, enforce access through existing application permissions, and issue signed URLs with a 60-second lifetime. Label legacy files as saved during the upgrade because missing or previously replaced originals cannot be reconstructed.
- **Validation:** All 35 automated tests and 24 browser tests passed locally. Type checking and both production build commands passed; lint had no errors and one existing unused-parameter warning. Both GitHub CI jobs passed for commit `c04887e`. These results do not establish completed live Supabase acceptance testing.
- **Evidence:** [User story #40](https://github.com/CobyBurah/GroupD-SOEN341/issues/40), [received-applications acceptance test #98](https://github.com/CobyBurah/GroupD-SOEN341/issues/98), [PR #116](https://github.com/CobyBurah/GroupD-SOEN341/pull/116), and [implementation commit](https://github.com/CobyBurah/GroupD-SOEN341/commit/de8b8e64a718cf16a457b243d28433a43f59f4a4).
- **Human time reported:** Approximately 2 hours total, including the supporting testing/documentation and publication work described below; no per-step breakdown was supplied.

The [individual contribution log](../../Sprint%20Deliverables/Sprint%232/Parsa_Contribution_Log.md) records the same approximately two-hour total.

## Requests and generated output

- Parsa requested useful unfinished work related to his recruiter tasks, selected submitted-resume version preservation and explicitly requested implementation.
- Codex inspected the application/resume code and reproduced the old replacement behavior with a simulated database/storage client.
- Prepared the database migration, download route, UI changes and retention-aware cleanup, together with database, route, account-cleanup and browser regressions.
- Prepared deployment instructions and a six-step demo covering original/replacement files, resume deletion, recruiter access and status updates, unrelated-account denial and withdrawal.
- After the web session could not publish, prepared a verified patch package. In the desktop continuation, checked its checksums, applied it to current `main` in a separate checkout, reran validation and updated the setup migration list.

## Validation and decisions

- The desktop checkout used `main` commit `340df28f1e00c88e1ca53368d122f6e42c987558`. The intervening upstream changes were documentation only, and the patch applied cleanly.
- `npm test`: 35 passed. Database tests used PGlite with the actual migrations and minimal auth/storage scaffolding.
- `npm run test:browser`: 24 passed using the standard project config and Playwright Chromium 156.0.8078.4 (build 1248). The browser fixture used synthetic local data and distinct readable PDFs.
- `npm run typecheck`, `npm run build` and `npm run build:test`: passed. `npm run lint`: no errors; one existing unused `_state` warning.
- Files referenced by other applications or current resumes remain retained. Ordinary file cleanup is best effort; account deletion stops on cleanup failures and can be retried.
- Migration 0015 must be applied before deploying the matching application code. No shared database migration was applied during this work.

## Human contribution record

Parsa selected the improvement, requested implementation, supplied the extracted handoff for the desktop continuation, and completed GitHub CLI authorization as `bluwine`. He subsequently requested that both logs follow Eldar's format and supplied the approximately two-hour estimate. Implementation, automated test execution and documentation were AI-assisted. Personal manual acceptance results remain to be recorded after execution.

## User prompts and adopted changes

- “Your recommendation is exactly what I was going for. Implement.” Implemented submitted-resume version preservation and its regression coverage.
- “Continue this chat.” Resumed the implementation and prepared the handoff when GitHub publishing was blocked.
- “Continue work here.” Continued from the extracted package in the desktop app, verified the implementation and published it after CLI authorization.
- “Do my AI log and Contribution log like Eldar did his.” Reorganized both records around Eldar's sections, contribution table and evidence links.
- “2 hours.” Recorded Parsa's estimate as the total human effort; no additional or per-activity hours were inferred.

The prompts above are excerpts of relevant instructions, not a complete transcript. The time estimate was supplied by Parsa.

## Published evidence

- [PR #116 — Preserve submitted resume versions for application review](https://github.com/CobyBurah/GroupD-SOEN341/pull/116).
- [Implementation commit `de8b8e6`](https://github.com/CobyBurah/GroupD-SOEN341/commit/de8b8e64a718cf16a457b243d28433a43f59f4a4).
- [Publication-record commit `c04887e`](https://github.com/CobyBurah/GroupD-SOEN341/commit/c04887e03145cc3bb363b27d5d092e7756a85b97).
- [Successful GitHub CI run for `c04887e`](https://github.com/CobyBurah/GroupD-SOEN341/actions/runs/40358366736).
- [Implementation, validation and manual demo notes](../../docs/recruiter/submitted-resume-versions.md).

## Validation limits

PGlite policy/trigger tests and browser tests against a synthetic Supabase fixture are complementary local checks. Neither demonstrates execution against the shared Supabase service. The migration and live manual acceptance scenario remain NOT RUN. A previously issued signed URL may remain usable for its remaining 60-second lifetime after withdrawal. Legacy backfill cannot recover original files that were already replaced or deleted.

## Publication follow-up

GitHub branch creation through the connector returned `403: Resource not accessible by integration`, including during the desktop continuation. Parsa completed device authorization for the official GitHub CLI. Codex then pushed `feature/submitted-resume-versions`, opened PR #116 under `bluwine`, and linked the PR in both logs. The local checkout was clean and synchronized with the remote branch after publication, and both CI jobs passed. The PR remains subject to team review and a separate merge/deployment decision.
