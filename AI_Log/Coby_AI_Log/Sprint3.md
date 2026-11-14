# AI Log #1 - Sprint 3
Saturday November 14th, 2026

**Task ID/Title:**
- Task: Dual-role accounts (one account can be both a job seeker and a recruiter)

**Purpose of AI Use:**
- Help me plan how one account could hold both roles without rewriting every RLS policy and role check that already reads `profiles.role`
- Help me design a safe way for users to add a second role and switch between roles, since users can't edit their role column directly
- Help me add a "Log in as" choice on the login page and a mode switcher in the top bar

**Claude Link to conversation:**
https://claude.ai/code/cshk_018uTSg3rP8AsEqTSp1CqqkUE7A6HsT7ftFpE5ra5Swp2D

**AI-Suggested Content:**
- Claude wrote migration `0018_dual_roles.sql`. It adds a `roles` array to `profiles`, and `profiles.role` now means the *active* role, so all existing RLS policies keep working and follow whichever mode the user is in. A check constraint makes sure the active role is always one the account holds.
- Two `security definer` functions, `add_role()` and `set_active_role()`. Only signed-in users can call them, so users can only change their roles through these functions.
- A "Log in as" radio group on the login page, a "Switch to …" button and a mode label in the site header, and an "Account roles" section on the profile page to enable the other role
- Unit tests for the new role logic (`tests/dual-roles.test.mjs`), plus updates to the browser tests and test fixtures for the new login form

**Validation:**
- Ran `npm test` and all 81 unit tests passed

**Decision:**
- I kept Claude's approach of reusing `profiles.role` as the active role, because none of the existing RLS policies or role checks had to change
- I kept the behaviour where single-role users who pick the other role at login are signed in with their only role, without an error
- Adding a role doesn't switch you into it automatically. You stay in your current mode until you choose to switch.

**Reflection:**
- This helped me understand how `security definer` functions and column grants can let users change sensitive data only in controlled ways, and how a check constraint keeps the data valid no matter which code path updates it.

**Responsible Person:**
- Coby, who conducted the interaction and completed the dual-role accounts feature and its tests

# AI Log #2 - Sprint 3
Saturday November 14th, 2026

**Task ID/Title:**
- Task: Lock the file extension when renaming a resume

**Purpose of AI Use:**
- Help me stop users from changing or removing a resume's `.pdf`/`.docx` extension when they rename it
- Help me make sure the server enforces this too, not just the form

**Claude Link to conversation:**
https://claude.ai/code/cshk_018uTSg2PGvVmWevKW7Q35to1DBzsfo781bRxQQxu37t5x

**AI-Suggested Content:**
- Claude changed the rename field so it only edits the base name, and the extension is shown as a fixed label next to it, with screen-reader text explaining it's kept automatically
- On the server, `renameResume` reads the extension from the resume's stored file type in the database, never from what the client sends. If the user types the extension anyway it's removed, and the real one is always added back.
- Added `resumeExtensionForMimeType()` and `splitResumeName()` helpers in `src/lib/resumes.ts`, with new unit tests and updated browser tests

**Validation:**
- Ran `npm test` and all 81 unit tests passed

**Decision:**
- I kept Claude's suggestion to get the extension from the stored file type, so a user can't rename a PDF to `.docx` by editing the request
- Resumes renamed before this change keep their full old name as the editable base name, so no data migration was needed

**Reflection:**
- This showed me why rules like this have to be enforced on the server even when the UI already blocks them, because the client can always send its own values.

**Responsible Person:**
- Coby, who conducted the interaction and completed the resume rename extension fix and its tests
