Sprint 3 AI Log - Responsible Person: Nour

## 1. 2026-11-09: Sprint 3 User Story and Issue Planning

<li> Task Title: Sprint 3 User Story and Issue Planning </li><br>

<li> Purpose of AI Use: I used AI to review the Sprint 3 requirements against the current project, confirm what functionality was still missing, and help organize the related GitHub user story and enhancement issues. </li><br><br>

<li> Prompt 1: can you confirm what is still missing from the Sprint 3 recruiter dashboard requirement based on the current project and suggest how we could organize the missing work into a user story and separate tasks </li><br><br>

<li> Relevant AI Response: </li><br>

```text
US-19 — Recruiter Application Filtering

As a recruiter, I want to filter the applications received for my job postings so that I can review candidates more efficiently.

Acceptance criteria:
- recruiters can filter applications by status
- recruiters can filter applications by date
- recruiters can return to viewing all applications
- filters only affect applications for the selected posting
- an appropriate message is shown when no applications match

Tasks:
- Add recruiter application status filtering
- Add recruiter application date filtering
- Add tests for recruiter application filters
```

<li> Prompt 2: i also need to create two enhancement issues. one is for the login page so users who have both recruiter and job seeker access can choose which role they want to log in as. the other is for resume renaming so users can change the resume name without being able to edit or remove the .pdf or .docx extension. what behavior should be expected for both issues </li><br><br>

<li> Relevant AI Response: </li><br>

```text
Enhancement — Let Users Choose Recruiter or Job Seeker at Login

Expected behavior:
- users with both roles can choose Recruiter or Job Seeker when logging in
- the selected role determines which dashboard and features they access
- users with only one role continue directly to that account
- permissions and data remain separated between the two roles
```

```text
Enhancement — Prevent Editing Resume File Extension When Renaming

Expected behavior:
- users can edit only the resume name before the extension
- the original .pdf or .docx extension remains fixed
- changing the resume name does not change the actual file type
- existing resume functionality continues to work normally
```

<li> AI-Suggested Content: AI helped identify the missing recruiter application filtering work and suggested clear issue descriptions and expected behavior for the Sprint 3 user story and enhancement issues. </li><br>

<li> Validation: I compared the suggestions with the Sprint 3 requirements and checked the current recruiter applications and resume rename behavior in the project. </li><br>

<li> Decision: Modified before use. I kept the proposed issue structure and simplified the wording to match the style of our existing GitHub issues. </li><br>

<li> Reflection: AI helped compare the Sprint 3 requirements with the current implementation and identify which parts were already completed versus which still needed new issues. It was also useful for keeping the issue descriptions focused on expected behavior instead of implementation details. </li><br><br>
