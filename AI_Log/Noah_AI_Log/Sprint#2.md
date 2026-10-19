# AI Log #1 - Sprint 2
Thursday October 19th, 2026

**Task ID/Title:**
- Task: Plan the implementation and testing of Sprint 2 Feature 1 - User Profile and Resume Management (#39 US-04 Resume management)

**Purpose of AI Use:**
- Read issue #39 and the Sprint 2 project guidelines PDF and plan implementation
- Find the gaps between Feature 1 and our current profile page (professional profile fields, upload/replace/manage resumes, displaying resumes and profile info)
- Come up with a step by step plan for what to build on a feature branch, how to test it, and how to commit, push and open a PR
- Ask me questions about the decisions instead of guessing

**AI Tool and Link to conversation:**
- Tool: Claude Code (desktop app)
- Link: https://claude.ai/share/019328b2-f8d0-4835-9860-2c7541920dd0

**AI-Suggested Content:**
- Summary of the current codebase: Next.js 16.3.6 with Supabase Auth, a protected route group, a profiles table with RLS and a job_seeker/recruiter role, Server Actions with useActionState on the profile page, no Supabase Storage yet and no test framework
- Pointed out that Next.js Server Actions only accept 1 MB request bodies by default, so a 5 MB upload needs serverActions.bodySizeLimit raised in next.config.ts (checked in node_modules/next/dist/docs)
- Gap table between Feature 1 and the current code: professional profile only has full name, no resume upload/replace, no display of resumes, acceptance tests and CI missing
- Plan for the branch:
  - Migration 0004: add headline, location and bio to profiles with length checks and column update grants
  - Migration 0005: private "resumes" storage bucket (5 MB, PDF/DOCX only), resumes table, RLS so users only see/delete their own resumes and only job seekers can upload, storage policies limited to the user's own folder
  - src/lib/resumes.ts: file validation (no file, empty file, over 5 MB, wrong extension, file content not matching the type such as a .txt renamed to .pdf)
  - Server actions for upload, replace and delete, a route that opens a resume through a 60 second signed URL, a new /resumes page, profile form extended with the new fields, profile page showing a read-only summary
  - Remove the user's resume files when the account is deleted, since the database cascade does not delete storage files
- Manual testing checklist in the same style as PR #33 (valid uploads, each invalid upload error, view, replace, delete, recruiter blocked, two accounts cannot see each other's resumes, persistence after logout/login), plus npm run build
- Git commands to create the branch, commit only the feature files, push and open the PR that closes #39

**Validation:**
- Checked the plan against the acceptance criteria in #39 and the Feature 1 bullets in the Sprint 2 PDF
- Checked the existing code it referenced (profile actions/forms, migrations 0001 to 0003, protected layout) to make sure the plan follows the same patterns
- Confirmed the 1 MB Server Action limit and the 10 MB proxy limit in the Next.js docs included in the project
- Looked at the Supabase storage-js functions (upload, remove, createSignedUrl) in node_modules to confirm they exist in our installed version

**Decision:**
- Answered the AI's questions myself: support PDF and DOCX, 5 MB max uploaded through a Server Action, a new /resumes page, testing should follow what the codebase already does (manual testing checklist and build, no new test framework)
- Chose headline, location and bio as the professional profile fields
- Acceptance test issues and the CI pipeline are not part of my task, they are done by other team members
- Used the AI only for planning; I will build, test, commit and push the feature myself
- Kept the AI's suggestions to restrict uploads to job seekers, use a signed link to view resumes, and not add a default resume or a resume count limit since the Sprint 2 PDF does not ask for them

**Reflection:**
- Having the AI compare the Sprint 2 PDF with the issue and the code showed me that Feature 1 needs more than issue #39 (replacing resumes and real professional profile fields)
- Making it ask questions first instead of assuming kept the plan matched to what our team actually needs
- The plan gives me a clear order to build things in and a checklist to test with before opening the PR

**Responsible Person:**
- Noah, who conducted the interaction and is completing Sprint 2 Feature 1 - User Profile and Resume Management (#39 US-04)

# AI Log #2 - Sprint 2
Monday October 19th, 2026

**Task ID/Title:**
- Task: Implement and test the recruiter side of application review - recruiters view applicants to their job postings and update each application's status

**Purpose of AI Use:**
- Build the page where a recruiter sees who applied to one of their postings (name, headline, location, submitted resume)
- Let the recruiter move an application between Applied, Interview, Offered and Rejected
- Write the database security rules so recruiters can only see and change applications to their own jobs
- Add tests for the feature and update the existing browser test that changed

**AI Tool and Link to conversation:**
- Tool: Claude Code
- Link: https://claude.ai/code/session_015W6CTBK3u4v63xvzwhZTjB

**AI-Suggested Content:**
- src/lib/applications.ts: list of the four allowed statuses (matching the check constraint in migration 0008) and a function to validate a status
- updateApplicationStatus Server Action in recruiter/actions.ts: checks the recruiter session, validates the job id, application id and status, updates the existing row instead of creating a new one, and filters on both the application id and the job id so a forged id from another posting cannot match
- Status form component (status-form.tsx) using useActionState, and an updated applications page listing each applicant with their profile info and a link to the resume they submitted
- Migration 0009:
  - Security definer helper functions (owns_job, applied_to_my_jobs, resume_in_my_applications, resume_file_in_my_applications) so the policies on applications, profiles and resumes can check each other without RLS recursion
  - Policies so recruiters can read and update applications only to their own jobs, and column grants so only the status column can be updated
  - Policies so recruiters can view the profile, resume row and resume file of people who applied to their jobs
- tests/application-review.test.mjs: checks that recruiters review and update status only for applications to their own jobs
- Updated the recruiter Playwright test and preview fixture since the empty state now reads "No applications yet"

**Validation:**
- Reviewed every file the AI changed before committing
- Checked that the status values match the constraint already defined in migration 0008
- Ran npm test and the Playwright browser tests (npm run test:browser)
- Checked the policies only allow updating the status column and only for the recruiter's own postings, and that job seekers still have no update access

**Decision:**
- Kept the AI's approach of updating the existing application row instead of inserting a new status history
- Kept the security definer helpers since plain policies on profiles/resumes that query applications would recurse through each other's RLS
- Limited what recruiters see of an applicant to their public profile fields and the one resume submitted with the application
- Committed the feature myself on the feature/recruiter-application-review branch

**Reflection:**
- The AI pointed out security problems I would likely have missed, such as needing the job id filter on the update and needing column-level grants so recruiters cannot edit other fields
- Writing the RLS policies with the AI showed me how policies on different tables can depend on each other and why helper functions are needed
- Having tests written alongside the feature made it easier to check the access rules actually work

**Responsible Person:**
- Noah, who conducted the interaction and implemented the recruiter application review feature
