# US-17 acceptance scenarios (local drafts)

Parent: https://github.com/CobyBurah/GroupD-SOEN341/issues/118. These scenarios are not published or marked as live passes.

## AT-US17-01: Application updates and interview invitations

Given seeker A has applied to recruiter R1's posting, when R1 changes its status to Under Review and then Interview, A receives corresponding in-app alerts and the bell count increases. A can follow the application link, mark one notification read, reload and see the read state persist. Saving Interview a second time creates no duplicate. Other seeker B sees none of A's alerts. Repeat with Offered and Rejected.

## AT-US17-02: Recruiter receives new-application alerts

Given R1 owns a posting, when A submits a valid application, R1 receives one new-application alert linking to the posting's received applications. R2 receives none. A duplicate application rejected by the existing constraint creates no additional notification. Verify a genuine second application/user independently.

## AT-US17-03: Upcoming deadlines and deduplication

Given A saves or applies to a job with a recruiter-set deadline, when the deadline is today or within three days (UTC) and A opens the app, A receives one reminder. Saving and applying to the same job, repeated refreshes and logging back in do not duplicate it or reset read state. No new reminders are created for yesterday, four days away, deleted jobs, no deadline or another user's jobs. Change to another eligible date and verify one new reminder. Opening an eligible reminder's details shows the posted deadline.

## AT-US17-04: Private inbox, unread count and failure handling

Given two seekers and two recruiters with independent alerts, each sees only their own inbox/count. A cannot mark B's alert read, insert a forged alert, edit a message or change its recipient through direct authenticated requests. Mark all as read clears all of A's unread rows, including beyond the first page, and leaves B's unchanged. Verify pagination, empty state, signed-out redirection, a database/API outage with retry, and a mobile viewport. The browser suite and PostgreSQL tests provide separate synthetic/local evidence; real Supabase execution remains pending.

## Live result record

- Environment / commit: pending
- Migration 0017 applied and reviewed by: pending
- Tester / actual time: pending
- Accounts and fixture IDs (no credentials): pending
- Actual outcomes and screenshots: pending
- Defects / retest results: pending
