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
   ```bash```
   git clone https://github.com/CobyBurah/GroupD-SOEN341.git

2. Navigate into the project folder:
```bash```
cd GroupD-SOEN341
```

3. Install the project dependencies:
``` bash
npm install
```
4. Create a `.env.local` file in the root of the project and use `.env.example` as a template.
5. Fill in the required environment variables (see table below).
6. Start the development server:
   ```bash```
   ```npm run dev```
7. Open http://localhost:3000 in your browser

### Checks and Continuous Integration

Every pull request and every push to `main` runs the GitHub Actions workflow in `.github/workflows/ci.yml`. None of these checks need Supabase credentials, so you can run the same ones locally before pushing:

```bash
npm run lint        # ESLint (Next.js core-web-vitals + TypeScript rules)
npm run typecheck   # tsc --noEmit
npm test            # unit tests (in-process PostgreSQL via PGlite)
npm run build       # production build
npm run test:browser  # Playwright browser tests (run `npm run build` first; first time: npx playwright install chromium)
```

The browser tests point the built app at a local fake Supabase API. `next build` inlines `NEXT_PUBLIC_SUPABASE_URL` from `.env`/`.env.local`, so build without those files (as CI does) before running `npm run test:browser`, or the app will talk to the real project instead.


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
