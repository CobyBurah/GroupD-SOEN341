# Local verification — November 13, 2026

Baseline: main at `69f2129`. Local feature branch: `codex/notifications-reminders`. Checks below were recorded before publication. Eldar subsequently authorized committing/pushing this branch for pull-request review. No shared database migration has been performed.

| Check | Result |
|---|---|
| npm run lint | Passed with one existing unused `_state` parameter warning in applications/actions.ts |
| npm run typecheck | Passed |
| npm test | 49 passed, 0 failed |
| npm run build:test | Passed |
| New notifications browser scenarios, installed Chrome | 2 passed |
| Full browser suite, installed Chrome | 24 passed, 4 failed |

The new browser scenarios cover deadline creation/prefill/display, saved-job reminders, new-application recruiter alerts, seeker interview alerts, duplicate suppression, per-user inbox isolation, individual/all read with reload persistence, pagination with 24 alerts, an unread count over all pages, API auth/origin/input checks, outage/retry, and mobile layout. Real trigger generation and permissions are separately tested using migration 0017 in PGlite PostgreSQL.

## Existing browser failures confirmed on unchanged main

Both resume-management scenarios and both AI-feedback scenarios reached their final console-error assertion with a resource 404. The same four failures reproduced in an isolated snapshot of unchanged main at 69f2129, built with its own synthetic backend on a separate local port. They were not suppressed or marked passed. The failing resource was not identified; a diagnostic saw the console message without a matching page response event.

The recruiter browser test initially timed out at location selection because its client blur error could appear before the server validation response remounted the form. Waiting for Publish posting to become enabled before refilling fixes the race without removing assertions. The final full run passed both recruiter scenarios.

## Visual evidence

Synthetic test data only; these are local UI checks, not live Supabase acceptance evidence.

- [Desktop inbox with two unread alerts](evidence/notifications-desktop.png)
- [Mobile inbox after marking alerts read](evidence/notifications-mobile.png)

Both images were visually inspected. The white header bell is visible against the dark header; notifications fit the 390px mobile viewport.

## Still needed for real environment verification

Review/apply migration 0017 to the intended test Supabase project, rebuild using that environment, then execute the scenarios in acceptance-tests.md with dedicated accounts. Validate actual Supabase triggers/RLS and persistence end to end. Deadline reminders are generated on signed-in app use, not by an offline background scheduler. The live scenarios remain NOT RUN.
