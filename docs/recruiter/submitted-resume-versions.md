# Submitted resume versions

Related work: US-05 / #40, received-applications acceptance scenario #98, and application tracking #78.

Previously, applications followed the editable `resumes` row. Replacing its file changed what a recruiter received, and deleting the row removed the application's resume link. Each new application now stores the selected filename and storage path at submission. Existing file objects are retained rather than copied. Renaming, replacing or deleting the resume in the seeker's list does not alter that submitted version.

## Deployment

1. Review and apply `supabase/migrations/0015_submitted_resume_versions.sql` after migrations 0001–0014, using the project's normal database administration process.
2. Deploy the matching application code in the same maintenance window. The new UI requires the snapshot columns; the migration also removes recruiters' access to editable resume rows.
3. Run the manual scenario below with dedicated test accounts and two distinct readable PDF/DOCX files.

The migration is transactional and briefly locks resume/storage writes while backfilling. It has been exercised in local PGlite tests; this change does not apply it to the shared Supabase project.

Existing applications can only retain a file that still exists at migration time. Their UI says **Resume saved during upgrade**: a previously replaced original cannot be reconstructed. Already deleted/missing files remain unavailable. Never claim the backfilled file is necessarily the original submitted version.

## Access and retention

- A database trigger derives snapshots from an owned resume, ignoring client-supplied snapshot values. It locks the selected resume against concurrent replacement/deletion and rejects missing files or paths outside the applicant's folder.
- Existing application RLS limits `/applications/[id]/resume` to the applicant and the posting's recruiter. The route requires a signed-in session and issues a 60-second signed Storage URL.
- Restrictive Storage policies block deletion, overwrite and moving a file while any current resume or submitted application references it. Replacement uploads a new object. Cleanup attempts for retained files leave the original intact.
- Withdrawing an application revokes new access through that application and attempts file cleanup. A version shared by another application or current resume is retained. A previously issued signed URL can remain valid for its remaining 60-second lifetime.
- Account deletion releases the user's application/resume references before removing all pages of stored files. Cleanup errors stop account deletion. This remains a multi-request operation: a later failure can leave already-removed applications/resumes removed, and the account deletion can be retried.
- Storage cleanup after ordinary replacement/deletion/withdrawal is best effort, as before; a storage outage can leave an unreferenced private object. Account deletion also lists those old files for cleanup. Database/storage administrators retain their normal privileged access.

## Regression coverage

- `tests/submitted-resumes.test.mjs`: real PostgreSQL/PGlite policies and triggers; replacement/deletion, filename preservation, forged snapshots/paths, private access, legacy backfill, immutable bytes metadata, shared retention and withdrawal.
- `tests/submitted-resume-route.test.mjs`: scoped snapshot lookup, missing/anonymous access and signed-link expiry.
- `tests/resume-account-cleanup.test.mjs`: reference release, pagination beyond 100 stored files and cleanup failure handling.
- `tests/browser/submitted-resumes.spec.mjs`: readable PDFs with different contents; applicant upload/apply/rename/replace/delete, recruiter downloads and UI status changes, applicant history, unrelated accounts and withdrawal. This uses the local fake Supabase fixture; database permissions are tested separately in PGlite.

## Recorded local validation

Validated on 2026-10-26 against `main` commit `340df28f1e00c88e1ca53368d122f6e42c987558`, including its job-navigation and pagination changes:

| Check | Result |
| --- | --- |
| `npm test` | 35 passed |
| Full Playwright browser suite | 24 passed |
| `npm run typecheck` | Passed |
| `npm run build` | Passed |
| `npm run build:test` | Passed |
| `npm run lint` | 0 errors; existing unused `_state` warning in applications/actions.ts |

The desktop continuation reran all checks in a clean checkout of the latest main. The browser suite used the standard project config and Playwright Chromium 156.0.8078.4 (build 1248), installed with `npx playwright install chromium`; no temporary browser config was needed. These results are local automated checks, not live Supabase acceptance results.

## Manual demo

1. As seeker A, upload `original.pdf` and apply to recruiter R1's first posting.
2. Rename that resume, replace it with visibly different `replacement.pdf`, and apply to R1's second posting.
3. Delete the resume from A's resume list. In **My applications**, the first application must still download the original bytes/name and the second the replacement bytes/name.
4. As R1, open both postings' applications and verify the same files. Change the first status through Under Review and Interview; A must see that history.
5. As R2 and seeker B, try the first application's resume URL: both must get 404.
6. Withdraw the first application as A. Its application URL must stop granting access; the second application's file must still work.

Record the real environment URL, deployed commit, tester, date, observed results and redacted evidence when this is run against Supabase. Do not mark that manual scenario complete based solely on automated local tests.
