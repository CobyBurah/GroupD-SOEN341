# Acceptance-test issue drafts — US-05

These are local drafts, not published GitHub issues. Suggested label: `acceptance test`. Parent: #40. Add links to the corresponding assigned task issues after approval. Run against the real configured environment before marking passed for evaluation.

## AT-US05-01 — Recruiter publishes a job
Given a signed-in recruiter, when they provide a title, company and description and publish, then success feedback is shown, the posting appears in their dashboard, persists after reload and is visible to signed-in job seekers. Owner is the authenticated recruiter. Blank required fields and invalid/overlong fields must return actionable errors without losing other input.

## AT-US05-02 — Recruiter edits their own job
Given a posting owned by recruiter A, when A edits it and saves, then existing fields are prefilled, changes persist and job seekers see the updated fields. Recruiter B cannot open its edit route or modify it through a direct authenticated request. A job seeker cannot modify it either.

## AT-US05-03 — Confirmed deletion preserves history
Given a posting owned by recruiter A, when deletion is canceled or confirmation is omitted, it remains active. When A confirms deletion, success feedback appears and it disappears from active dashboards, list results and seeker detail queries. The database row remains. Recruiter B and a seeker cannot remove it, transfer ownership or hard-delete it.

## AT-US05-04 — Role and ownership boundaries
Given an unauthenticated visitor, protected recruiter routes redirect to login. A signed-in job seeker cannot use recruiter routes or direct create/edit/delete actions. Recruiter A lists only A's active postings. Invalid IDs and another recruiter's posting produce an unavailable response without exposing edit details. Repeat sensitive checks through the authenticated Supabase API to validate database policies independently of the interface.

## AT-RECRUITER-APPLICATIONS-01 — Received applications (blocked)
After the application integration exists, submit a real application to A's job and confirm A sees only permitted applicant details, submission date and current status. B and unrelated seekers must not read it. Verify permitted resume access without exposing unrelated resumes. This test is pending the application team's implementation; the current page is a dependency notice.

## AT-RECRUITER-APPLICATIONS-02 — Empty, failed and historical applications (blocked)
After integration, distinguish a successful empty query from a failed query, show a useful retry on failure, and preserve access to historical applications when a job is removed. Confirm submission to removed jobs is rejected. Pending integration.
