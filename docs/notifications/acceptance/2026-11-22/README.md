# Issue #211 — Sprint 4 notification verification

Date: November 22, 2026. Executor: Codex-assisted automated verification requested by Eldar.
Tested main revision: `eac5a1ce8793a1ac48441bc471bde59a960029e0`.

**Local automated checks: PASS. Live Supabase rerun of #152–155: PASS on the tested main revision.**

## Actual results

| Check | Actual result | Evidence |
|---|---|---|
| Production-mode fixture build | PASS using locked dependencies, Next.js 16.4.6 | [Build log](build-results.txt) |
| PostgreSQL notification and safe-destination tests | 2 passed, 0 failed | [Database log](database-results.txt) |
| Chromium browser acceptance suites | 3 passed, 0 failed, 0 skipped | [Structured results](browser-results.json) |
| Main Unit tests workflow | Success at the tested revision | [GitHub run](https://github.com/CobyBurah/GroupD-SOEN341/actions/runs/44973481080) |
| Main E2E workflow | Success at the tested revision | [GitHub run](https://github.com/CobyBurah/GroupD-SOEN341/actions/runs/44973481094) |

Local browsers used installed Google Chrome through Playwright; the application used the synthetic Supabase fixture on port 54331. PostgreSQL verification used PGlite and migration 0017. These do not verify the deployed team database or its migrations.

The initial build could not download Google Fonts in the restricted environment. After installing the current lockfile and allowing network access, the build succeeded. No application defect was inferred from that environment failure.

## Coverage and live results

| Acceptance issue | Fresh supporting observations | Live rerun |
|---|---|---|
| [#152](https://github.com/CobyBurah/GroupD-SOEN341/issues/152) | PostgreSQL: Under Review, Interview, Offered, Rejected and unchanged-status suppression. Browser: interview, link, read state and other-seeker isolation. | PASS |
| [#153](https://github.com/CobyBurah/GroupD-SOEN341/issues/153) | Browser application submission generated recruiter alert and correct detail link; PostgreSQL recipient isolation passed. | PASS: two genuine seekers; duplicate rejected without another alert |
| [#154](https://github.com/CobyBurah/GroupD-SOEN341/issues/154) | PostgreSQL today/+3 boundaries, excluded +4/expired/deleted/unrelated, deduplication and changed-date reminder. Browser deadline form/detail and reminder. | PASS: includes no deadline, archived posting and logout/login |
| [#155](https://github.com/CobyBurah/GroupD-SOEN341/issues/155) | PostgreSQL recipient-only permissions; browser paging, mark-one/all, persisted read state, mobile, empty state, 401/403/400 and simulated outage/retry. | PASS: includes other-recipient invariance |
| Unread filter | Browser found 21 unread alerts older than 201 read alerts; loaded the second page, marked one and all, synchronized bell and persisted filter through navigation. | PASS |

Fresh screenshots are in [browser/](browser/): desktop/mobile inbox, unread filter, and cleared unread inbox. The mobile screenshot was visually inspected.

## Historical evidence

The four acceptance issues are closed and contain November 15 live PASS comments: [#152](https://github.com/CobyBurah/GroupD-SOEN341/issues/152#issuecomment-6901166439), [#153](https://github.com/CobyBurah/GroupD-SOEN341/issues/153#issuecomment-6901166983), [#154](https://github.com/CobyBurah/GroupD-SOEN341/issues/154#issuecomment-6901167438), [#155](https://github.com/CobyBurah/GroupD-SOEN341/issues/155#issuecomment-6901167835). Those are historical observations, not a fresh final-build rerun or proof every detailed scenario was executed.

## Live environment and results

- Application: normal production build, Next.js 16.4.6, at `http://127.0.0.1:32111`; real team Supabase project `qgmkgmzchregytvtkdum.supabase.co`. No synthetic API fixture in this live run.
- Browser: installed Google Chrome (Chromium), headless Playwright, four independent authenticated contexts.
- Live run completed November 22, 2026, 11:48 a.m. America/Toronto. [Timestamped results and non-secret fixture IDs](live/results.json), [execution log](live/execution-log.txt), [production build log](live/build-results.txt).
- Four dedicated QA accounts were created after Eldar explicitly confirmed. Random passwords/session tokens are stored only in a private temporary file outside the repository. No service-role key was used and no migration was applied.
- Synthetic resumes and nine clearly prefixed QA jobs were created. Two applications were submitted. One boundary posting was soft-deleted and one archived to test exclusions. QA records remain available for reproducibility and should be included in the planned #203 cleanup; no unrelated team data was changed.

| Live scenario | Observed actual result |
|---|---|
| #152: updates/interview | Under Review, Interview, Offered and Rejected were selected through recruiter UI and appeared in the seeker's real inbox. Re-saving Rejected added no alert. Second seeker had no first-seeker status alerts. Mark-read persisted across reload. |
| #153: new applications | Two different seekers submitted resumes through the real UI. Owner received exactly two new-application alerts; unrelated recruiter received none. Duplicate authenticated insert was rejected without another alert. View details opened the correct posting's received-applications page. |
| #154: reminders | Today and UTC +3 eligible; +4, yesterday, null deadline, deleted, archived and unrelated excluded. Saved plus applied and repeated refresh deduplicated. Moving tomorrow's deadline to +2 added exactly one new reminder; old read state and count survived logout/login. Job details showed the new date. |
| #155: privacy and read actions | Normal authenticated REST calls could not read/update another recipient or insert/delete/edit notification content/recipient. 32 real alerts paginated from 20 to 32. Unread filter displayed unread records; mark-all cleared every unread and left recruiter rows unchanged. Foreign-ID app API request was a no-op for the other recipient. |
| #155: errors, access and layout | Signed-out page redirected to login; API returned 401 signed-out, 403 foreign origin, 400 invalid ID. Other recruiter's empty state displayed. 390px mobile had no horizontal overflow. Browser-intercepted 503 showed retryable error and recovered after removing interception. The shared database was never taken offline. |

Fresh live evidence: [loaded inbox](live/status-notifications.png), [unread filter](live/unread-filter.png), [mobile cleared inbox](live/mobile-cleared.png), [simulated outage](live/simulated-outage.png). The loaded-inbox screenshot was recaptured after waiting for all rows; an earlier capture showed only a transient loading state. Initial harness failures came from exact-label/text assertions and were corrected without application changes. The successful full run reused existing QA records.

## Scope and publication

No application defect was observed in this run. The older-than-200 unread case remains covered by the fresh local browser suite; the live run exercised 32 records. This is verification of the current main revision, not a guarantee about future changes before the Sprint 4 deadline. Rerun if notification behavior or database policies change. The results are ready for repository review; do not describe a local fixture run as live evidence.
