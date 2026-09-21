September 21st, 2026 : Using Claude 
Prompt:
Our group of 6 software engineering students are creating a web application for a project.

Objective: This project will provide students with hands-on experience in software development using Agile
practices, GitHub-based collaboration, project management, testing, and continuous integration. The
project is divided into four sprints. Teams are encouraged to use Generative AI tools responsibly to
support software engineering activities such as requirements elicitation, documentation, planning,
testing, and implementation. All AI-generated content must be validated and documented by the team.
Project Description: CareerConnect is a web-based platform designed to help job seekers manage their job search activities.
The system allows users to create profiles, upload and manage resumes, search for job opportunities,
track submitted applications, and follow the progress of their application process. The platform aims
to centralize job-search activities and help users stay organized throughout their career development
journey.
Primary Users: Job Seekers and Recruiters.
System Features: User registration, authentication, and profile management.

* Resume upload and management.Job posting management for recruiters.
* Job search and filtering capabilities.
* Job application submission.
* Application status tracking (Applied, Interview, Offered, Rejected).
* Application history dashboard.
* Notifications and reminders for application deadlines.
* Saved jobs and favourites.
* AI-assisted resume feedback or job matching suggestions (optional advanced feature).
* Teams are encouraged to design creative and meaningful AI-based functionality that enhances

the application.

What technologies, frameworks, etc. make the most sense for our project.

Response:
Given the feature list and the fact that you'll be graded on Agile process, testing, and CI, you want a stack that's fast to set up, easy for 6 people to work on in parallel, and has good testing and deployment tooling. Since you've already shipped Next.js + Supabase on Vercel, you can also be the one who sets up the foundation quickly.

Recommended stack

Layer	Choice	Why
Language	TypeScript everywhere	One language across the team; types catch bugs before review
Frontend + API	Next.js (App Router)	Pages and API routes in one repo, less integration pain
UI	Tailwind + shadcn/ui	Consistent components without anyone owning "design"
Database	Supabase (Postgres)	Relational fits users, jobs, applications, and status history
Auth + roles	Supabase Auth + Row Level Security	Job seeker vs recruiter permissions enforced in the DB
Resume storage	Supabase Storage	Private bucket per user, signed URLs
Validation	Zod	Shared schemas for forms and API input
Notifications	Resend (email) + Vercel Cron or pg_cron	Daily job that checks deadlines and sends reminders; in-app notifications table
AI features	Claude or OpenAI API + pgvector	LLM for resume feedback; embeddings in Postgres for job matching
Resume parsing	pdf-parse / mammoth	Extract text from PDF/DOCX before sending to the AI
Unit/integration tests	Vitest + React Testing Library	Fast, works well with Next.js
E2E tests	Playwright	Test full flows (apply to job, change status)
CI/CD	GitHub Actions + Vercel previews	Lint, typecheck, and tests on every PR; each PR gets a live preview URL
Project management	GitHub Projects + Issues	Keeps sprints, stories, and PRs linked in one place for grading

AI feature ideas that go beyond the basics

Resume vs. job description gap analysis: missing skills, suggested bullet rewrites
Match score on each job listing using embeddings of the resume and the posting
Cover letter draft generated from resume + posting, which the user then edits
Interview prep questions generated when an application moves to "Interview"

Team setup tips

Split work by feature (vertical slices), not frontend vs. backend. With Next.js, everyone can own a feature end to end, which avoids blocking each other.
Lock in the database schema and RLS policies in Sprint 1. Almost every feature depends on them.
Use branch protection: required PR review plus green CI before merging.
Set up a local Supabase with the CLI so migrations are version-controlled and teammates don't overwrite a shared dev DB.
Keep an AI_USAGE.md or a PR template field to log AI-generated content and how it was validated, since the course requires it.

When to pick something else

If the course expects a separate backend (e.g., a layered architecture or specific design patterns), or most of the team is stronger in Java, use React (Vite) + Spring Boot + PostgreSQL, with JUnit/Mockito for tests. It's more setup, but it gives a clearer frontend/backend separation for architecture diagrams and grading.
