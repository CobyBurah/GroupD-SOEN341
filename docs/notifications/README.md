# US-17: In-app notifications and reminders

Sprint 3 implementation for review. Eldar authorized branch publication and a pull request on November 13, 2026. No shared Supabase migration has been performed; merge is left to review.

## Behavior

- When an application is inserted, a database trigger notifies the posting owner and links to that posting's received applications.
- When its status changes, a database trigger notifies the applicant. Interview produces an interview invitation alert; other statuses produce an application update. Saving the same status again does not send another alert. Interview means the existing application's Interview status; this feature does not schedule interview dates or send email.
- Recruiters can set an optional application deadline on the create/edit posting form. It is a date interpreted in UTC and is visible in job details. Existing postings have no deadline until the recruiter sets one. This field drives reminders; it does not add an application-submission cutoff rule.
- Seekers receive one reminder per job/deadline when a saved or applied-to active job has a deadline from today through three days ahead (UTC). Saving and applying to the same job still creates one reminder. Expired, removed and unrelated jobs do not generate reminders. Changing the deadline can generate one new reminder for the new date.
- A header bell for both roles shows the unread count. The notifications page lists newest first, allows marking one/all read and loads additional batches of 20 (up to the latest 200). The unread count and mark-all cover the entire inbox, including older records.
- Alerts refresh on opening the app, returning to a visible tab, every 30 seconds while visible, and manual Refresh. Read state persists in the database and updates the bell. Loading failures show a retryable message instead of a false empty inbox.

## Reminder delivery model

Status/new-application events are persisted immediately by database triggers even if the recipient is offline. Deadline reminders are generated for the authenticated user when the app checks for notifications, not by a background cron service. A user who stays offline until after a deadline will not receive an expired reminder on returning. There is no email, push delivery, or background scheduler dependency.

## Database setup (not yet applied to the shared project)

After reviewing the migration, have the database administrator apply migrations through `0016_resume_feedback.sql`, then `supabase/migrations/0017_notifications.sql` to the intended Supabase environment. The new migration adds `jobs.application_deadline`, the private notifications table, application-event trigger and caller-scoped reminder function. No backfill of historical status/new-application notifications is performed.

Until migration 0017 is installed, posting writes that include the new deadline column cannot succeed and notifications show unavailable. Deploy application code and migration together. No service-role credentials or new environment variables are required.

## Security and data lifecycle

Only authenticated recipients can select their notifications or update their read timestamp. They cannot insert notifications, edit their content/recipient or delete records. Triggers and the reminder function are the writers; the latter accepts no recipient parameter. Account deletion cascades notification removal. Notifications retain a small message snapshot and internal navigation link, not resumes, emails or credentials. An older link may lead to an unavailable job after removal.

The API verifies session and request origin and explicitly scopes reads/mark-read operations by the authenticated user. Database RLS independently enforces recipient boundaries. A signed-out request returns 401 and a foreign-origin write returns 403. Stored links are restricted to supported internal destinations before rendering.

## Local verification

```sh
npm ci
npm run lint
npm run typecheck
npm test
npm run build:test
PLAYWRIGHT_CHANNEL=chrome npm run test:browser
```

The browser fixture is synthetic and does not contact the configured real Supabase project. It simulates events for UI verification. `tests/notifications.test.mjs` separately executes migration 0017 in actual PostgreSQL via PGlite, testing recipients, permissions, event kinds, unchanged-status suppression, date boundaries, deduplication, deadline changes, read persistence and account deletion.

Browser coverage: recruiter deadline create/edit, saved-job deadline reminder, submitted-application recruiter notification, status-to-Interview seeker notification, repeated saves/refreshes, individual/all read, persistence, another user's empty inbox, responsive layout, loading failure/retry, unauthenticated/foreign-origin requests and invalid IDs. Screenshots are written to the ignored test-results directory.

The production test build deliberately points at the local fixture API. Rebuild with normal environment settings before using the real Supabase project. Full live integration still needs verification after migration review/application.

Final observed results and screenshots: [local verification record](verification.md).

The [Unread inbox demo](unread-inbox.md) shows how to find older alerts counted by the bell and verify read actions with a seeded local account.
