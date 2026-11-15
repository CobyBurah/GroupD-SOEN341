# Acceptance tests: US-20 Archive and restore job postings

Automated in `tests/browser/job-archive.spec.mjs` (Playwright, local fake Supabase) and `tests/job-archive.test.mjs` (real PostgreSQL RLS through PGlite). Run the manual steps against the team Supabase project after applying `supabase/migrations/0019_job_archive.sql`.

## AT-US20-01: Recruiter archives a posting
**Given** a signed-in recruiter with an active posting that has one application,
**when** they click "Archive posting" on the dashboard,
**then** a confirmation message appears, the posting moves to an "Archived postings" section showing "1 application received", and it can no longer be edited from the dashboard.

## AT-US20-02: Archived postings are closed to job seekers
**Given** an archived posting,
**when** a job seeker searches the jobs page, or opens the posting's detail or apply page,
**then** the posting is not listed, both pages say it is closed, no Apply button is shown, and the database rejects a direct application or favourite.
The seeker who applied earlier still sees the job on My applications with "This posting is closed to new applications". The recruiter can still open its applications and update their status. No deadline reminder is sent for it.

## AT-US20-03: Recruiter restores a posting
**Given** an archived posting,
**when** the recruiter clicks "Restore posting",
**then** a confirmation message appears, the posting returns to "Active postings" with its Edit link, and job seekers can find and apply to it again.
Another recruiter cannot archive or restore it.
