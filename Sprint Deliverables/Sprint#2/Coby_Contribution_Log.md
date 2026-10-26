# Sprint 2 Individual Contribution Log

**Team member:** Coby Burah

**GitHub username:** CobyBurah

**Project:** CareerConnect — GroupD-SOEN341

**Sprint:** 2

## Contributions and time spent

| Activity | Contribution | Estimated time spent | Evidence |
|---|---|---|---|
| Forgot / reset password | Built the full password recovery flow with Supabase Auth: a "Forgot your password?" page linked from login, the email link handlers (`/auth/callback` and `/auth/confirm`), and a reset password page. Moved the password rules into a shared helper so the profile and reset forms check passwords the same way, and added unit and Playwright tests. | ~1 hour | [Issue #59](https://github.com/CobyBurah/GroupD-SOEN341/issues/59); [PR #62](https://github.com/CobyBurah/GroupD-SOEN341/pull/62); [Commit ea0aaac](https://github.com/CobyBurah/GroupD-SOEN341/commit/ea0aaac3cf712cf5e0ff63bd32d417ac06c3705c) |
| My Applications page (US-09) | Built the `/applications` page where job seekers see every job they applied to, its current status and a timeline of past statuses, with a status filter and a Withdraw button. Wrote the migration that adds the status history table, a trigger that records every status change, and the row-level security so seekers can only read their own history. Added unit tests and Playwright tests. | ~2 hours | [Issue #75](https://github.com/CobyBurah/GroupD-SOEN341/issues/75); [US-09 #78](https://github.com/CobyBurah/GroupD-SOEN341/issues/78); [PR #77](https://github.com/CobyBurah/GroupD-SOEN341/pull/77); [Commit f77b8c4](https://github.com/CobyBurah/GroupD-SOEN341/commit/f77b8c46f229ed2f09b0c0b947c3e902706839fa) |
| AI log | Wrote my Sprint 2 AI log entries for both features. | ~30 min | [Sprint2.md](https://github.com/CobyBurah/GroupD-SOEN341/blob/main/AI_Log/Coby_AI_Log/Sprint2.md); [Commit 3c867cf](https://github.com/CobyBurah/GroupD-SOEN341/commit/3c867cfc914b4cc7c52513cda2b86b433dc6d083); [Commit 827c465](https://github.com/CobyBurah/GroupD-SOEN341/commit/827c465f1538df358b29f4da84a26d30c237504b) |
| Team meetings | Attended all three Sprint 2 meetings and took on the resume management and application submission and tracking work with Noah. | ~1.5 hours | [Meeting-Sprint#2.md](https://github.com/CobyBurah/GroupD-SOEN341/blob/main/Meeting_Minutes/Meeting-Sprint%232.md) |

**Total estimated time: around 9 hours**, across 2 merged PRs (#62, #77).

Before merging I ran:

- `npm test` (all 23 unit tests passed after PR #77)
- `npx tsc --noEmit`
- `npx playwright test`
- Manual testing on the local app, including a real reset email from Supabase

## Validation and AI assistance

I used Claude Code for both features to help plan and write the code. I reviewed what it built, ran the tests and tried each flow myself before merging.

- **Forgot password:** I kept the flow Claude suggested. I decided against setting up custom SMTP since the default Supabase email is enough for us, and I added our dev server to the redirect URLs in the Supabase settings myself.
- **My Applications:** I kept the trigger approach so history is recorded automatically without recruiters doing anything extra. I decided withdrawing should fully delete the application so seekers can apply to the same job again later.

Each AI interaction is documented in my [AI log](https://github.com/CobyBurah/GroupD-SOEN341/blob/main/AI_Log/Coby_AI_Log/Sprint2.md).
