# Recruiter posting management — local review

Parent story: https://github.com/CobyBurah/GroupD-SOEN341/issues/40
Baseline: main at 9c5eeeaeb7ff07580af760a72a514bb1a747f94d.

## Implemented

- Home → Dashboard routes recruiters to `/recruiter`. Signed-in pages share navigation and formatting: recruiters see My postings, job seekers see Dashboard, and both see CareerConnect, Browse jobs and My profile.
- Recruiters list only their own active jobs, create postings, edit existing fields and confirm deletion.
- Required fields: title, company, description. Optional: location, category, salary, employment type. Server validation trims fields and retains values on validation failure.
- Each server action verifies the session and database role. Ownership comes from the verified session, never form data. Update/delete queries also filter by owner and active status.
- Migration `0007_recruiter_job_management.sql` adds matching Postgres row-level security and a server-maintained update timestamp. No service-role credentials are used.
- Delete is a soft delete (`deleted_at`): it removes the posting from recruiter active lists and job-seeker list/detail queries while preserving the underlying row for future application references. Deleted postings cannot be restored through these actions. There is no authenticated hard-delete policy.
- Responsive, accessible posting forms, feedback, unavailable-posting page and error handling.

## Explicit remaining dependency: received applications

`/recruiter/jobs/[id]/applications` verifies recruiter role and job ownership but currently displays an integration-pending message. It does **not** display real applications and must not be marked complete.

The repository has no application table or submission implementation at the inspected baseline. Coordinate with Coby/Noah on their branch/schema before adding database queries or permissions. Agree on job ID, applicant ID, application ID, submission timestamp, status and any submitted resume reference. The required statuses are Applied, Under Review, Interview, Offered, Rejected.

Access must be enforced in the database: a recruiter can read only applications for jobs they own. Applicant profiles/resumes currently have owner-only policies; do not broadly expose profiles or the resume bucket. Prefer explicit permitted fields and an authorized submitted-resume endpoint. Keep historical applications accessible when a posting is removed. Agree with the application team that submissions are rejected for soft-deleted jobs at the database boundary, including concurrent submission/deletion.

## Run against a real Supabase project (approval needed first)

1. Review migration 0007 and the test results with Eldar. No shared database migration has been applied.
2. After authorization, apply migrations in order through 0007 to the intended Supabase project. Existing jobs are preserved. Migration 0007 is required before this app version: queries reference `deleted_at`.
3. Copy `.env.example` to `.env.local` and enter the project's public URL and publishable key locally. Never commit credentials.
4. `npm ci`, then `npm run dev`; sign in using a recruiter account and open `/dashboard`.
5. Run the manual acceptance scenarios below using two recruiters and one job seeker. Sample jobs currently owned by another account will not appear in your dashboard; create your own posting instead of silently reassigning team data.

## Safe local preview without project credentials

Run `npm run build` and `npm run preview:recruiter`. The terminal prints a local URL. Open `/login` at that URL; use `recruiter@example.test` or `jobseeker@example.test` and any nonempty password. This preview runs a fake local HTTP service with in-memory jobs. It is for UI debugging only, uses synthetic data, and resets on restart. It does not test Supabase authentication or database policies; profile/resume writes are not simulated. Keep the preview bound to localhost.

## Checks and limitations

- `npm test`: four passing tests covering validation, actual PostgreSQL RLS in PGlite, and server actions with a mocked session/query client.
- `npx tsc --noEmit`: passed.
- `npm run build`: passed.
- Native in-app browser with the synthetic preview: login/dashboard routing, empty list, required-field errors, create, prefilled edit/save, applications-pending notice, confirmed deletion and disappearance from job listings all verified.
- A Playwright browser suite is included (`npm run build && npm run test:browser`; install its Chromium with `npx playwright install chromium`, or use `PLAYWRIGHT_CHANNEL=chrome`). This host could not launch the standalone browser, so that automated suite remains unverified here. Native browser checks were used instead. Responsive CSS is present; automated mobile viewport coverage remains pending.
- Live Supabase configuration, user accounts, storage access and real application integration have not been tested. No CI workflow is added by this feature.
- This change is prepared for a draft PR after explicit user approval. No shared database migration, issue creation, project-board changes or merge is included.
