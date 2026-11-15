# Sprint 3 Individual Contribution Log

**Team member:** Coby Burah

**GitHub username:** CobyBurah

**Project:** CareerConnect — GroupD-SOEN341

**Sprint:** 3

## Contributions and time spent

| Activity | Contribution | Estimated time spent | Evidence |
|---|---|---|---|
| Dual-role accounts (job seeker + recruiter) | Let one account be both a job seeker and a recruiter and switch between the two. Wrote migration `0018_dual_roles.sql`, which adds a `roles` list to `profiles` and makes `profiles.role` the *active* role, so every existing RLS policy and role check keeps working without changes. Added two locked-down database functions, `add_role()` and `set_active_role()`, so users can only change their roles through them. Added a "Log in as" choice on the login page, a "Switch to …" button in the header, and an "Account roles" section on the profile page. Added unit tests and updated the Playwright tests and fixtures for the new login flow. | ~1 hour | [Issue #126](https://github.com/CobyBurah/GroupD-SOEN341/issues/126); [PR #158](https://github.com/CobyBurah/GroupD-SOEN341/pull/158); [Commit 68e4b98](https://github.com/CobyBurah/GroupD-SOEN341/commit/68e4b98650fed50c4f605cee0810312c15efdc3b) |
| Lock resume extension on rename | Renaming a resume now only edits the base name, and the `.pdf` / `.docx` extension is shown next to the field but can't be changed. The server takes the extension from the stored file type, never from what the client sends, so the rule can't be bypassed. Added unit tests for the new helpers and updated the Playwright rename test. | ~30 min | [Issue #127](https://github.com/CobyBurah/GroupD-SOEN341/issues/127); [PR #159](https://github.com/CobyBurah/GroupD-SOEN341/pull/159); [Commit 6dfe68a](https://github.com/CobyBurah/GroupD-SOEN341/commit/6dfe68a1d3325567ac43fd16c2a88d1fe230a05b) |
| AI-Powered Resume Feedback (US-18) | Assisted Noah with the AI resume feedback feature, which lets job seekers get feedback on an uploaded resume from a local AI model. Noah built it in PR #140. | ~1 hour | [US-18 #119](https://github.com/CobyBurah/GroupD-SOEN341/issues/119); [Issue #132](https://github.com/CobyBurah/GroupD-SOEN341/issues/132); [Issue #133](https://github.com/CobyBurah/GroupD-SOEN341/issues/133); [PR #140](https://github.com/CobyBurah/GroupD-SOEN341/pull/140) |
| AI log | Wrote my Sprint 3 AI log entries for both features. | ~30 min | [Sprint3.md](https://github.com/CobyBurah/GroupD-SOEN341/blob/main/AI_Log/Coby_AI_Log/Sprint3.md); [Commit a13d9e0](https://github.com/CobyBurah/GroupD-SOEN341/commit/a13d9e0759a3ed921ffd056f72cf8bda9374904f) |
| Team meetings | Attended the second Sprint 3 meeting, where we confirmed the remaining Sprint 3 work and that Noah and I would handle AI-Powered Resume Feedback (US-18). | ~45 min | [Meeting-Sprint#3.md](https://github.com/CobyBurah/GroupD-SOEN341/blob/main/Meeting_Minutes/Meeting-Sprint%233.md) |

**Total estimated time: around 4 hours**, across 2 merged PRs (#158, #159), plus helping with US-18 (PR #140).

Before merging I ran:

- `npm test` (all 81 unit tests passed)
- `npx tsc --noEmit`
- `npx eslint`
- `npx playwright test`
- Manual testing on the local app, including switching modes on a dual-role account

## Validation and AI assistance

I used Claude Code for both features to help plan and write the code. I reviewed what it built, ran the tests and tried each flow myself before merging.

- **Dual-role accounts:** I kept Claude's idea of reusing `profiles.role` as the active role, because none of the existing RLS policies or role checks had to change. I decided that adding a role doesn't switch you into it automatically, and that a single-role user who picks the other role at login is just signed in with the role they have, without an error.
- **Resume extension:** I kept Claude's suggestion to take the extension from the stored file type, so a user can't rename a PDF to `.docx` by editing the request. Resumes renamed before this change keep their old name as the editable base, so no data migration was needed.

Each AI interaction is documented in my [AI log](https://github.com/CobyBurah/GroupD-SOEN341/blob/main/AI_Log/Coby_AI_Log/Sprint3.md).

