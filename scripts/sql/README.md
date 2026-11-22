# SQL support scripts

These files are separate from the ordered schema migrations in `supabase/migrations/`. Nothing in this directory runs automatically on app startup or CI.

## Sample jobs

[seed-jobs.sql](seed-jobs.sql) is the unchanged sample data previously stored at `supabase/data_jobs.sql`. On a new development project, apply all migrations first, create a recruiter and replace the sample recruiter UUID in a local copy before running it in the SQL editor. See the [setup guide](../../README.md#2-add-the-sample-jobs). The script is not idempotent: running it again adds duplicate jobs. Do not run it against the shared project just to reorganize files.

## QA cleanup preview — issue #203

[cleanup-qa-data.sql](cleanup-qa-data.sql) only lists candidate QA postings and profiles. Run it in the team's Supabase SQL editor and review the exact IDs with the team before cleanup. Prefix matches are candidates, not authorization to delete. The script intentionally contains no DELETE statements; approved deletion and post-cleanup evidence remain work for [#203](https://github.com/CobyBurah/GroupD-SOEN341/issues/203).

Review dependent applications, history, favourites, notifications and resume storage before selecting a cleanup method. Credentials must remain outside the repository. The November 22 #211 result record lists the dedicated fixture IDs created by that run.
