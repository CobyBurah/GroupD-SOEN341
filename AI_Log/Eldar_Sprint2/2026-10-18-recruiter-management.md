# AI usage — recruiter posting management

- Responsible team member: Eldar Sadeghi.
- Tool: OpenAI Codex. Date: October 18, 2026 (America/Toronto).
- User request: Propose a plan for US-05, start only after approval, then implement locally for debugging; do not push anything. User approved: “Perfect, start working … Do not push anything yet.”
- Purpose: Implement recruiter dashboard and posting management using the existing Next.js/Supabase structure; maintain AI records and test evidence.
- Context: Sprint 2 PDF, repository issue #40, source and database migrations at main commit 9c5eeeaeb7ff07580af760a72a514bb1a747f94d. Read repository AGENTS.md and the installed Next.js 16.3.6 form, server-action, redirect and dynamic-route documentation before implementation.
- Generated output: Recruiter dashboard/routes/forms; session/role/ownership checks; create/edit/delete actions; migration 0007; active-list filtering; tests; local synthetic preview; acceptance/task drafts; setup/integration documentation.
- Decisions: Derive ownership from verified session and enforce it again with RLS. Use deletion timestamps to preserve future application history. Reuse the team's jobs schema and avoid replacing the application team's unfinished schema. Show an explicit dependency notice on the applications page; real received-application display is not complete.
- Validation: TypeScript and production build passed. Four automated tests passed: form validation/ownership whitelist; invalid inputs; real PostgreSQL RLS using PGlite and actual migrations 0001/0006/0007; server actions with mocked session/query client. Database tests cover recruiter creation, blocked seeker creation, blocked cross-owner edits/deletion, ownership transfer rejection, owner edits, hard-delete denial, soft deletion, history retention and hidden removed rows.
- UI validation: Native Codex in-app browser using a localhost synthetic HTTP fixture verified login/dashboard routing, empty state, required-field messages, create success, prefilled edit/save success, integration-pending notice, deletion confirmation/success and disappearance from seeker listings. Dashboard screenshot saved outside the repository for Eldar's review.
- Validation limitation: The standalone Playwright browser could not launch on this host (missing managed browser, and installed Chrome process aborted in the sandbox). The included Playwright suite was not verified; native in-app browser checks were used instead. Live Supabase and real applications/resume access remain untested. No shared database changes were applied.
- Modifications during validation: Added dedicated server-action and database authorization tests; used a local synthetic preview to exercise UI without real credentials. Test artifacts are ignored. No unrelated teammate features were implemented.
- Human review/modifications: Pending Eldar/Parsa review and live debugging. No human contribution hours inferred from AI activity.
- Repository publication: No commit, push, PR, issue creation, board update or shared database write performed. Explicit user approval is still required before pushing.

## Follow-up: separate demo roles

User requested signing into the job-seeker workspace. Updated only the local HTTP preview fixture to distinguish jobseeker@example.test from recruiter@example.test, return matching profile roles and email claims, handle logout, and provide an empty demo resume list. Signed in through the real local login form and verified the job-seeker dashboard rendered with Browse jobs and Your profile links. This is synthetic authentication; shared Supabase and GitHub remain unchanged. The job-seeker dashboard remains basic. Screenshot saved to outputs/job-seeker-preview.png. The preview restart clears in-memory postings. Earlier packaged source predates this fixture-only follow-up.

## Follow-up: consistent signed-in navigation and formatting

User reported the Job Seeker profile lacked the recruiter's navigation and formatting. Moved the workspace shell/navigation to the protected layout, retained recruiter-only authorization in its nested layout, and made the navigation role-aware (My postings for recruiters; Dashboard for seekers; CareerConnect, Browse jobs and My profile for both). Added scoped profile section/form styling while retaining existing forms/actions. Updated seeker dashboard copy. Production build and all four tests passed. Native browser verified the Job Seeker profile shows its account type and all four navigation links. No GitHub or shared database changes.


## Publication authorization

Eldar explicitly approved creating a feature branch, committing the local work, pushing it to GitHub and opening a draft pull request: “Perfect do this please. I give you the permission.” Main is to remain unchanged until team approval and a separate merge decision. Refreshed origin/main before publication; no new team commits were present. The applications view remains an explicit dependency notice, live Supabase checks and automated standalone browser execution remain pending. Review scope includes shared signed-in navigation/profile formatting and local demo tooling. No acceptance issues, shared database migration or merge is authorized by this publication step.
