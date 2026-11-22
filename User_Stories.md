## AI-generated story backlog

### US-01 — User registration

User story: As a job seeker, I want to create an account so that I can access CareerConnect's personalized features.

Acceptance criteria:

* A new user can register with the required account information.

* An email address already associated with an account cannot be registered again.

* The system provides feedback when registration succeeds or fails.

Suggested tasks: Design the user database schema; implement the registration API; create the signup form; test successful and unsuccessful registration.

### US-02 — User authentication

User story: As a registered user, I want to securely log in and log out so that I can access my account and protect my personal information.

Acceptance criteria:

* Users can log in using valid credentials.

* Invalid credentials are rejected.

* Users can log out, and protected pages are no longer accessible through their previous session.

Suggested tasks: Implement authentication and password hashing; build login/logout UI; configure session handling; write authentication tests.

### US-03 — User profile management

User story: As a job seeker, I want to create and update my professional profile so that recruiters can access relevant information about my qualifications.

Acceptance criteria:

* Users can view their stored profile.

* Users can edit and save their profile information.

* Saved changes remain available after logging out and logging back in.

Suggested tasks: Design profile data storage; implement profile endpoints; develop profile UI; test persistence and access control.

### US-04 — Resume management

User story: As a job seeker, I want to upload and manage my resumes so that I can use them when applying for jobs.

Acceptance criteria:

* Users can upload a resume in a supported file format.

* Users can view their uploaded resumes and remove ones they no longer need.

* Invalid uploads produce an appropriate error message.

Suggested tasks: Implement file storage and validation; create resume upload UI; implement retrieval/deletion; test uploads and access permissions.

### US-05 — Recruiter job posting management

User story: As a recruiter, I want to create, edit, and remove job postings so that I can advertise employment opportunities.

Acceptance criteria:

* Authenticated recruiters can create job postings.

* Recruiters can edit and remove their own postings.

* Job seekers cannot create or modify recruiter postings.

Suggested tasks: Design job-posting database schema; implement CRUD endpoints; develop recruiter UI; test ownership and authorization.

### US-06 — Job Search, Filtering, and Job Listing Interface

User story: As a job seeker, I want to search and filter available jobs so that I can find opportunities relevant to my qualifications and preferences.

Acceptance criteria:

* Users can search job postings by keyword.

* Users can narrow results using available filters, such as location or job type.

* Matching results are displayed, with appropriate feedback when no matches exist.

Suggested tasks: Implement search/filter backend; build search interface; integrate results with job listings; test search cases.

### US-07 — Saved jobs

User story: As a job seeker, I want to save interesting job postings so that I can review them later.

Acceptance criteria:

* Users can save an available job.

* Saved jobs are displayed in a dedicated list.

* Users can remove a job from their saved list without deleting the original posting.

Suggested tasks: Design saved-jobs relationship; implement save/unsave endpoints; develop saved-jobs UI; test persistence.

### US-08 — Job application submission

User story: As a job seeker, I want to submit an application for an available job so that I can express my interest in the position.

Acceptance criteria:

* Users can submit an application to an available posting using the required information.

* A successfully submitted application is recorded in their account.

* The application initially receives the status `Applied`.

Suggested tasks: Design application database schema; implement submission endpoint; build application form; test submission and initial status.

### US-09 — Application status tracking

User story: As a job seeker, I want to track the status and history of my applications so that I can monitor my job-search progress.

Acceptance criteria:

* Users can view their submitted applications.

* Each application displays its current status: `Applied`, `Interview`, `Offered`, or `Rejected`.

* Users can view an application's recorded history.

Suggested tasks: Implement application status storage and updates; build tracking dashboard; implement history retrieval; test status transitions and visibility.

### US-10 — AI-assisted resume feedback

User story: As a job seeker, I want to request AI-generated feedback on my resume so that I can identify potential improvements before applying for jobs.

Acceptance criteria:

* Users can select an uploaded resume and request feedback.

* The system processes the selected resume using a Generative AI model or API.

* The user receives understandable feedback and improvement suggestions.

* If the AI service fails, the application displays an appropriate error rather than fabricated feedback.

Suggested tasks: Select and integrate an AI model or API; implement resume processing; build feedback UI; validate output and test error handling.

# Team-Generated User Stories

### US-11 — Click to Apply

**Proposed by:** Parsa

**User story:**
As a jobseeker, I want to send my resume with just one click,
so that I save time and apply to many jobs at once.

**Acceptance criteria:**
- [ ] Employers can enable the option of making their job postings one click apply
- [ ] Job seekers can click to have their default resume sent to the employer
- [ ] A list of one click apply jobs can be formed from the filter menu

**Why this matters:** To save job seekers' time

**Associated implementation tasks:**
- [ ] Make sure each user has a default resume/CV
- [ ] Add the one click apply a filter option in the jobs filter


### US-12 — Auto apply

**Proposed by:** Parsa

**User story:** 
As a job seeker, I want my CV/resume automatically sent to job postings that contain some key word(s),
so that I maximize the total amount of jobs I applied to.

**Acceptance criteria:**
- [ ] Must work when user is away.
- [ ] when a job posting is posted, the resume is sent to the employer automatically if the keyword(s) is/are present.

**Why this matters:** It significantly saves time for both parties.

**Associated implementation tasks:**
- [ ] Run every new job posting through a filter (key word search) upon creation
- [ ] keep a list of resumes ready to be sent for each keyword
- [ ] Implement spam detection by limiting key words to 3 general key words
- [ ] Create a cap to the daily number of job postings a resume is sent to

### US-13 — Personalized Cover Letters

**Proposed by:** Parsa

**User story:**
As a jobseeker, I want to have a tailored cover letter,
so that I maximize my chances of getting an interview.

**Acceptance criteria:**
- [ ] The user is given a Cover letter based on the job he/she is applying to
- [ ] The platform has a good knowledge of the user as context
- [ ] The platform uses GenAI to make these cover letters

**Why this matters:**
cover letter's boot users' chance of getting an interview and landing the job

**Associated implementation tasks:**
- [ ] Make GenAI's system prompt
- [ ] Have the job postings context cached to save tokens 

### US-14 — skills to improve feedback

**Proposed by:** Parsa

**User story:**
As a Job seeker, I want to know what skills are in high demand according to most/recent job postings,
so that I can plan on learning or improving upon those skills.

**Acceptance criteria:**
- [ ] User's get feedback on what skills are in demand

**Why this matters:**

**Associated implementation tasks:**
- [ ] scan each job posting for required skills
- [ ] make a point system to rank skills in demand

 ### US-15 — Email Notification for new job postings

**Proposed by:** Parsa

**User story:** 
As a job seeker, I want to be notified immediately when a new job posting is available on the platform,
so that I can apply to it right away.

**Acceptance criteria:**
- [ ] Email Notification must point directly to the job posting via a link
- [ ] Email must contain a summary of the job posting

**Why this matters:**

**Associated implementation tasks:**
- [ ] Implementing email notification system
- [ ] Adding the enable/disable notification feature in user settings
---


## Sprint 3 user stories

Each story is a GitHub issue, with its tasks and acceptance tests as sub-issues.

### US-16: Job search activity metrics ([#117](https://github.com/CobyBurah/GroupD-SOEN341/issues/117))

**Owner:** Nour

**User story:**
As a job seeker, I want to see how many applications I have submitted over time, so that I can track my job-search activity and stay motivated.

**Acceptance criteria:**
- [x] The My applications page shows a "Your activity" section.
- [x] It shows a chart of applications submitted over time.
- [x] It shows the total number of applications, how many were submitted this week, and how many this month.
- [x] If the job seeker has no applications, a message is shown.

**Acceptance tests:** AT-US16-01 ([#141](https://github.com/CobyBurah/GroupD-SOEN341/issues/141)) and AT-US16-02 ([#142](https://github.com/CobyBurah/GroupD-SOEN341/issues/142)), automated in `tests/browser/applications.spec.mjs`.

### US-17: In-app notifications and reminders ([#118](https://github.com/CobyBurah/GroupD-SOEN341/issues/118))

**Owners:** Parsa, Eldar

**User story:**
As a user, I want to receive in-app notifications about my applications and job postings, so that I don't miss status updates, interview invitations, deadlines or new applications.

**Acceptance criteria:**
- [x] A job seeker gets a notification when the status of one of their applications changes.
- [x] A job seeker gets a notification when they are invited to an interview.
- [x] A job seeker gets a reminder when a job they saved or applied to has a deadline within 3 days.
- [x] A recruiter gets a notification when someone applies to one of their job postings.
- [x] The header shows a bell with the number of unread notifications.
- [x] Users can open a notifications page, newest first, and mark notifications as read.
- [x] Users can only see their own notifications.

**Acceptance tests:** AT-US17-01 to AT-US17-04 ([#152](https://github.com/CobyBurah/GroupD-SOEN341/issues/152) to [#155](https://github.com/CobyBurah/GroupD-SOEN341/issues/155)), automated in `tests/browser/notifications.spec.mjs` and `tests/notifications.test.mjs`.

### US-18: AI-assisted resume feedback ([#119](https://github.com/CobyBurah/GroupD-SOEN341/issues/119))

**Owners:** Coby, Noah

**User story:**
As a job seeker, I want to request AI-generated feedback on my resume, so that I can identify improvements before applying for jobs.

**Acceptance criteria:**
- [x] Users can select an uploaded resume and request feedback.
- [x] The system processes the resume with a Generative AI model (local Ollama, llama3.1:8b).
- [x] The user receives understandable feedback and improvement suggestions.
- [x] If the AI service fails, an error is shown instead of fabricated feedback.

**Acceptance tests:** AT-US18-01 to AT-US18-06 ([#134](https://github.com/CobyBurah/GroupD-SOEN341/issues/134) to [#139](https://github.com/CobyBurah/GroupD-SOEN341/issues/139)), automated in `tests/browser/resume-feedback.spec.mjs` and `tests/resume-feedback*.test.mjs`.

### US-19: Recruiter application filtering ([#123](https://github.com/CobyBurah/GroupD-SOEN341/issues/123))

**Owner:** Sabrina

**User story:**
As a recruiter, I want to filter the applications received for my job postings, so that I can review candidates more efficiently.

**Acceptance criteria:**
- [x] Recruiters can filter applications for one of their postings by status.
- [x] Recruiters can filter applications by application date.
- [x] Recruiters can return to viewing all applications.
- [x] A message is shown when no applications match the filter.
- [x] Candidate review and status updates keep working.

**Acceptance tests:** AT-US19-01 ([#148](https://github.com/CobyBurah/GroupD-SOEN341/issues/148)) and AT-US19-02 ([#149](https://github.com/CobyBurah/GroupD-SOEN341/issues/149)). Unit tests are in `tests/application-filters.test.mjs`.

### US-20: Archive and restore job postings

**Owner:** Noah

**User story:**
As a recruiter, I want to archive a job posting when it is filled and restore it later, so that it stops receiving applications without losing the candidates who already applied.

**Acceptance criteria:**
- [x] Recruiters can archive one of their active postings from the dashboard, and restore it later.
- [x] The dashboard separates active and archived postings and shows the number of applications received for each posting.
- [x] Archived postings are hidden from job search and cannot receive new applications or be saved.
- [x] Applications to an archived posting stay available to the recruiter, and applicants still see the job in their history.
- [x] Archived postings send no deadline reminders.
- [x] Only the posting's owner can archive or restore it (enforced by RLS).

**Acceptance tests:** AT-US20-01 to AT-US20-03 (`docs/recruiter/archive-acceptance-tests.md`), automated in `tests/browser/job-archive.spec.mjs` and `tests/job-archive.test.mjs`.

## Sprint 4 user stories and validation

### US-21 — AI job matching suggestions

**Owner** Noah. **Story** [#167](https://github.com/CobyBurah/GroupD-SOEN341/issues/167).

As a job seeker, I want suggestions for open jobs that fit my resume and profile, with reasons and skills to strengthen, so I can decide which postings to explore.

**Acceptance criteria**

- Select an owned resume from the AI matches page.
- Suggest eligible postings that are open, unexpired and unapplied.
- Show a score, grounded reasons, skills to strengthen, posting details and an application link for each result.
- Keep only job IDs supplied to the model and validate the returned scores and content.
- Show an empty state when there is no suitable posting.
- Show an actionable error when the AI service fails or returns invalid output.
- Reject unreadable resumes before a model request.
- Enforce signed-in job-seeker access and resume ownership. Matches are generated on request.

Use cases #168–173, implementation tasks #174–179 and acceptance tests #180–185 trace this story. Noah's November 21 live results are recorded with the tested environment. [Use cases](docs/job-matching/use-cases.md) · [Acceptance tests](docs/job-matching/acceptance-tests.md) · [Live results](docs/ai-validation/sprint4-acceptance-results.md)

### US-18 — Resume feedback validation follow-up

**Owner** Noah, with Coby as the original story co-owner. [Validation #188](https://github.com/CobyBurah/GroupD-SOEN341/issues/188) · [Feature verification #213](https://github.com/CobyBurah/GroupD-SOEN341/issues/213).

Continue the Sprint 3 feedback story by checking representative resumes, empty/scanned files, unrelated experience, instructions embedded in resume text, service failures and account boundaries. Feedback should stay grounded in the supplied resume, preserve useful improvement suggestions, persist for its owner and disappear when that resume is deleted.

The prompt-injection defect and regression are tracked by #186 and #187. The validation record includes the early recruiter-role refusal found during the live run. [Validation plan](docs/ai-validation/resume-feedback.md) · [Observed results](docs/ai-validation/sprint4-acceptance-results.md)

[All Sprint 4 responsibilities and dates](Sprint%20Deliverables/Sprint%234/Sprint4_Workplan.md)
