# GroupD-SOEN341-Team Members 
<li>Noah Dahan noah11dahan-cpu </li>
<li>Nour Belkacemi NourBelka</li>
<li>Eldar Sadeghi EldarSadeghi</li>
<li>Coby Burah CobyBurah</li>
<li>Parsa Morshedlou bluwine </li>
<li>Sabrina Marsillo sm3339</li>

# Project Description 
CareerConnect is a web application designed to make job searching easier for everyone. Users can create and manage their profiles, search and apply for jobs, and track their applications. The goal is to help both job seekers and recruiters stay organized by keeping everything in one place. 

# Identified Problem 
It is difficult for job seekers to keep track of their job search activities when they apply for a number of positions on various websites. Application deadlines, which resume version was sent, the dates of interviews, and the status of each application can be hard to keep track of. It can also be challenging for applicants to know if their resumes fit a job's requirements. Recruiters have similar problems, and they need a simple or easier way to post job openings and track applications. Given these problems, a platform that can help organize job searches, track applications and improve communication between job seekers and recruiters would make it much more beneficial. 

# Proposed Solution
CareerConnect will provide a single online platform where job seekers can create profiles, manage resumes, look for job openings, easily apply for jobs, and keep track of their progress. Recruiters will be able to post job listing and track the job applicants being received. This platform will also be able to have reminders and AI-powered tools to help users stay organized and make their job search much easier. 

# Technologies 
<li> Programming Language: TypeScript</li>
<li> Framework: Next.js </li>
<li> Database: Supabase</li>
<li> Deployment: Vercel</li>
<li> Location Search: Geoapify</li>

# Setup Instructions
## Accessing CareerConnect

CareerConnect will be deployed online using Vercel.

To access the application:
1. Open the CareerConnect website using a modern web browser such as Google Chrome, Safari, Microsoft Edge, or Firefox.
2. Click **Register** to create an account and enter the required information.
3. Log in using the email address and password associated with the account.
4. Once logged in, users can access the available CareerConnect features.

## Running CareerConnect Locally

### Requirements
Before running the project locally, make sure the following are installed:
- Node.js
- npm
- Git
- Access to the Supabase project (see Database Setup)
- A Geoapify API key, used for location suggestions when recruiters post a job

### Installation

1. Clone the GitHub repository:
   ````bash
   git clone https://github.com/CobyBurah/GroupD-SOEN341.git
   ````

2. Navigate into the project folder:
   ````bash
   cd GroupD-SOEN341
   ````

3. Install the project dependencies:
   ````bash
   npm install
   ````

4. Create a `.env.local` file in the root of the project and use `.env.example` as a template.
5. Fill in the environment variables (see the table below).
6. If you are using a new Supabase project, set up the database (see [Database Setup](#database-setup)).
7. Start the development server:
   ````bash
   npm run dev
   ````
8. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

| Variable | Required | What it is | Where to find it |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | The URL of the Supabase project | Supabase dashboard → **Connect** or **Settings → API Keys** |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Yes | The public (publishable) key of the Supabase project | Supabase dashboard → **Settings → API Keys** |
| `GEOAPIFY_API_KEY` | Yes, for posting jobs | Key for the city suggestions in the recruiter job form. Without it, recruiters can't choose a location. | Your Geoapify account → **Projects → API keys** |
| `NEXT_PUBLIC_SITE_URL` | Optional | Public base URL used in password-reset links. Defaults to the address you're browsing from. | Your deployed site URL (e.g. the Vercel URL) |

After changing `.env.local`, stop the server (**Ctrl + C**) and run `npm run dev` again so the new values are loaded.

## Database Setup

This is only needed if you are using a **new** Supabase project or if new migrations were added since you last set it up.

### 1. Run the migrations (in order)

The database structure lives in `supabase/migrations/`. Open the Supabase dashboard → **SQL Editor**, then copy, paste and run each file **one at a time, in number order**. Each migration builds on the ones before it.

| # | File | What it adds |
|---|---|---|
| 0001 | `0001_profiles.sql` | Profiles table (one per user, with their role: job seeker or recruiter), created automatically on sign up |
| 0002 | `0002_delete_account.sql` | Lets a user permanently delete their own account |
| 0003 | `0003_sync_profile_name.sql` | Keeps the user's display name in sync with their profile |
| 0004 | `0004_professional_profile.sql` | Headline, location and bio fields for job seeker profiles |
| 0005 | `0005_resumes.sql` | Private storage bucket and table for resume files |
| 0006 | `0006_jobs.sql` | Jobs table, each job owned by the recruiter who posted it |
| 0007 | `0007_recruiter_job_management.sql` | Recruiters create, edit and soft-delete their own postings |
| 0008 | `0008_applications.sql` | Job applications (with the selected resume), starting as *Applied* |
| 0009 | `0009_recruiter_application_review.sql` | Recruiters review applications and update their status |
| 0010 | `0010_under_review_status.sql` | Adds the *Under Review* status |
| 0011 | `0011_favourites.sql` | Saved jobs / favourites for job seekers |
| 0012 | `0012_job_location_fields.sql` | City, region and country fields for job locations |
| 0013 | `0013_workplace_type.sql` | Workplace type (on-site, hybrid, remote) for jobs |
| 0014 | `0014_application_history.sql` | Application status history and seeker withdrawal |
| 0015 | `0015_submitted_resume_versions.sql` | Preserves submitted resume versions and restricts access to retained files |

A migration that ran successfully says **"Success. No rows returned."** If one fails, fix the error before moving on to the next one.

### 2. Add the sample jobs

`supabase/data_jobs.sql` adds 12 sample jobs so the job list, search and filters have data to show. It is kept outside the migrations folder because it is test data, not part of the database structure. Run it **after all the migrations**.

Every job must belong to a recruiter. Jobs posted through the recruiter dashboard are linked to the recruiter automatically, but this file is a SQL script, so it uses the id of the team's test recruiter account.

On a new Supabase project, the database starts empty, so you need to create a recruiter first:

1. Run the app and **sign up as a recruiter**.
2. In Supabase, go to **Table Editor → profiles** and copy the `id` of that recruiter.
3. In `supabase/data_jobs.sql`, replace the id `b7198249-22d3-4187-8d7b-284476c8a656` with your recruiter's id. Don't commit this change.
4. Paste the file into the **SQL Editor** and run it.

The sample jobs don't include a workplace type. To mark the two remote sample jobs as remote (like migration 0013 does for existing jobs), run:

```sql
update public.jobs
set workplace_type = 'remote', location = null
where lower(location) = 'remote';
```

### Checks and Continuous Integration

Every pull request and every push to `main` runs the GitHub Actions workflow in `.github/workflows/ci.yml`. None of these checks need Supabase credentials, so you can run the same ones locally before pushing:

```bash
npm run lint        # ESLint (Next.js core-web-vitals + TypeScript rules)
npm run typecheck   # tsc --noEmit
npm test            # unit tests (in-process PostgreSQL via PGlite)
npm run build       # production build
npm run test:browser  # Playwright browser tests (run `npm run build` first; first time: npx playwright install chromium)
```

# Proposed Features
## Job Seeker Features
<li> Profile management </li>
<li> Resume upload and management </li>
<li> Job search and filtering </li>
<li> Job application submission </li>
<li> Applications status tracking </li>
<li> Application history dashboard </li>
<li> Applications deadline notifications and reminders </li>
<li> Saved jobs and favourites </li>
<li> Generative AI feature: AI generated interview questions based on the selected job posting (TBC) </li>

## Recruiter Features 
<li> Recruiter profile management </li>
<li> Job posting management </li>
<li> Application management </li>
<li> Application status updates </li>

## Shared Features
<li> User registration and authentication </li>
<li> Login and logout </li>
<li> Forgot password and password reset by email </li>
<li> Account deletion </li>

