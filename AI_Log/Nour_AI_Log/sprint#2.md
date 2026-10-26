Sprint 2 AI Log - Responsible Person: Nour

## 1. 2026-10-18: Initial Job Listing Structure

<li> Task Title: Reusable Job Listing Structure </li><br>

<li> Purpose of AI Use: I used AI to restructure the existing jobs page into a reusable job card component while keeping the Supabase retrieval logic unchanged. I also used it to update the sample jobs so they were owned by the existing recruiter account. </li><br><br>

<li> Prompt 1: the sample jobs are currently assigned to the first profile returned from the database. whats the SQL syntax so the existing test recruiter account is used as the owner instead? </li><br><br>

<li> Relevant AI Response: </li><br>

```sql
update public.jobs
set recruiter_id = 'RECRUITER_ID'::uuid;
```

<li> Prompt 2: for the jobs listing page, we already have the page.tsx file that loads all the jobs. can you separate each job listing into its own JobCard component/file </li><br><br>

<li> Relevant AI Response: </li><br>

```tsx
import { getJobs } from '@/lib/jobs'
import { JobCard } from './jobs-card'

export default async function JobsPage() {
  const jobs = await getJobs()

  return (
    <main>
      <ul>
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </ul>
    </main>
  )
}
```

```tsx
import type { Job } from '@/lib/jobs'

type JobCardProps = {
  job: Job
}

export function JobCard({ job }: JobCardProps) {
  return (
    <li>
      <h2>{job.title}</h2>
      <p>{job.company}</p>

      {job.location && <p>{job.location}</p>}
      {job.category && <p>{job.category}</p>}
      {job.employment_type && <p>{job.employment_type}</p>}
      {job.salary && <p>{job.salary}</p>}
    </li>
  )
}
```

<li> AI-Suggested Content: AI suggested keeping `getJobs()` in the page while moving each posting into a reusable `JobCard` component, and directly updating the recruiter ownership of the sample jobs. </li><br>

<li> Validation: I verified the ownership update in Supabase and confirmed that the jobs still loaded correctly after restructuring the page. I also checked postings with missing optional fields. </li><br>

<li> Decision: Modified before use. I kept the reusable component structure and ownership change and adapted the initial card structure to the project. </li><br>

<li> Reflection: AI helped separate the jobs page from the individual job card without changing the existing retrieval logic. I still adjusted the structure to fit the rest of the project. </li><br><br>

---

## 2. 2026-10-18: Job Listing Interface Implementation

<li> Task Title: Job Listing Interface Implementation </li><br>

<li> Purpose of AI Use: I created the visual direction for the job listing interface and used AI to translate it into the existing Next.js project while keeping the current job data. </li><br><br>

<li> Prompt: using the layout i made as the visual reference, can you translate it into the existing Next.js jobs page? use #072422 as the main colour, Montserrat for titles/headings, Inter for regular text, rounded pills for the job information with a location and clock icon, and take into account responsiveness desktop vs mobile. </li><br><br>

<li> Relevant AI Response: </li><br>

```tsx
function MapPinIcon() {
  return (
    <svg
      className={styles.icon}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg
      className={styles.icon}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  )
}

<p className={styles.meta}>
  <span>{job.company}</span>

  {job.category && (
    <>
      <span>|</span>
      <span>{job.category}</span>
    </>
  )}
</p>

<div className={styles.bottomRow}>
  <div className={styles.pills}>
    {job.location && (
      <div className={`${styles.pill} ${styles.jobPill}`}>
        <MapPinIcon />
        <span>{job.location}</span>
      </div>
    )}

    {job.employment_type && (
      <div className={`${styles.pill} ${styles.jobPill}`}>
        <ClockIcon />
        <span>{formatEmploymentType(job.employment_type)}</span>
      </div>
    )}

    {job.salary && (
      <div className={`${styles.pill} ${styles.jobPill}`}>
        <span>{job.salary}</span>
      </div>
    )}
  </div>
</div>
```

```css
.jobTitle {
  margin: 0 0 4px;
  font-family: var(--font-montserrat);
  font-size: 21px;
  font-weight: 600;
  line-height: 1.3;
}

.meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin: 4px 0 22px;
  font-family: var(--font-inter);
  font-size: 16px;
}

.pills {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  list-style: none;
  padding: 0;
  margin: 0;
  max-width: 100%;
}

.pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  padding: 9px 18px;
  border-radius: 999px;
  background: var(--cc-pill);
  color: var(--cc-text);
  font-family: var(--font-inter);
  font-size: 15px;
  white-space: nowrap;
  max-width: 100%;
}

.icon {
  width: 19px;
  height: 19px;
  flex-shrink: 0;
  color: #072422;
}

@media (max-width: 750px) {
  .bottomRow {
    flex-direction: column;
    align-items: center;
    gap: 24px;
  }

  .pills {
    flex-direction: column;
    align-items: center;
    gap: 10px;
    width: 100%;
  }
}
```

<li> AI-Suggested Content: AI suggested a reusable card layout with company and category together, optional job information displayed as pills, and shared styling for the cards. </li><br>

<li> Validation: I compared the implementation with my design and tested different postings and browser widths. I adjusted the layout when dynamic content did not behave as expected. </li><br>

<li> Decision: Modified before use. I kept the general card structure but adjusted the styling and responsive behavior through visual testing. </li><br>

<li> Reflection: AI helped translate my visual design into the existing project structure. The generated layout was a useful starting point, but I still adjusted the styling and responsiveness through testing. </li><br><br>

---

## 3. 2026-10-19: Dynamic Job Details Page

<li> Task Title: Job Details Page </li><br>

<li> Purpose of AI Use: I used AI to create the initial dynamic Job Details page using the existing `getJob(id)` function instead of creating separate pages for each posting. </li><br><br>

<li> Prompt: i'm working on the job details page now. i already have getJob(id) in the project but there is no individual job page yet. i want /jobs/[id] to load the correct job, show the company and location in the header, show the available job information without displaying empty fields, and show the full job description. can you structure the page using the shared styling we already have? </li><br><br>

<li> Relevant AI Response: </li><br>

```tsx
import Link from 'next/link'

import { getJob } from '@/lib/jobs'
import styles from '@/app/ui.module.css'

type JobDetailsPageProps = {
  params: Promise<{
    id: string
  }>
}

export default async function JobDetailsPage({
  params,
}: JobDetailsPageProps) {
  const { id } = await params
  const job = await getJob(id)

  if (!job) {
    return (
      <main>
        <h1>Job not found</h1>

        <p>
          <strong>
            <Link href="/jobs">← Back to Jobs</Link>
          </strong>
        </p>
      </main>
    )
  }

  const hasJobInformation = Boolean(
    job.category ||
    job.employment_type ||
    job.salary
  )

  return (
    <main>
      <header className={styles.header}>
        <div>
          <h1>{job.title}</h1>

          <p>
            {job.company}
            {job.location ? ` · ${job.location}` : ''}
          </p>
        </div>
      </header>

      <p className={styles.backLink}>
        <Link href="/jobs">
          ← Back to Jobs
        </Link>
      </p>

      {hasJobInformation && (
        <section>
          <h2>Job Information</h2>

          {job.category && (
            <p>
              <strong>Category:</strong> {job.category}
            </p>
          )}

          {job.employment_type && (
            <p>
              <strong>Employment Type:</strong>{' '}
              {job.employment_type
                .replace(/\_/g, ' ')
                .replace(/\b\w/g, (letter) => letter.toUpperCase())}
            </p>
          )}

          {job.salary && (
            <p>
              <strong>Salary:</strong> {job.salary}
            </p>
          )}
        </section>
      )}

      <section>
        <h2>Job Description</h2>

        <p className={styles.description}>
          {job.description}
        </p>
      </section>
    </main>
  )
}
```

<li> AI-Suggested Content: AI suggested using the dynamic `[id]` route, retrieving the posting with `getJob(id)`, handling invalid IDs, and hiding optional fields when they were empty. </li><br>

<li> Validation: I tested several valid job IDs, an invalid ID, and postings with missing optional fields. </li><br>

<li> Decision: Modified before use. I kept the generated structure and adjusted it to fit the shared project styling. </li><br>

<li> Reflection: AI helped create the starting structure for the dynamic page using the existing retrieval function. I then adjusted it to match the rest of the application. </li><br><br>

---

## 4. 2026-10-21 to 2026-10-23: Job Search and Filtering

<li> Task Title: Job Search and Filtering </li><br>

<li> Purpose of AI Use: I first used AI while reviewing the existing search implementation and identifying missing behavior. I later used it to expand the filters so multiple selected values could remain active at once. </li><br><br>

<li> Prompt 1: the current job search already searches by title and category. can u add company to the keyword search and employment type as another filter so i can test if the existing search implementation can support another filter </li><br><br>

<li> Relevant AI Response: </li><br>

```ts
export async function getJobs(
  keyword = '',
  location = '',
  category = '',
  employmentType = ''
) {
```

```ts
query = query.or(
  'title.ilike.' +
  search +
  ',company.ilike.' +
  search +
  ',category.ilike.' +
  search +
  ',location.ilike.' +
  search
)
```

```ts
if (employmentType !== '') {
  query = query.eq('employment_type', employmentType)
}
```

```tsx
const employmentType = params.employmentType ?? ''
```

```tsx
const jobs = await getJobs(keyword, '', '', employmentType)
```

```tsx
<input
  name="keyword"
  placeholder="Search by title, company, category..."
/>
```

```tsx
<select
  name="employmentType"
  defaultValue={employmentType}
  aria-label="Filter by employment type"
>
  <option value="">All employment types</option>
  <option value="full_time">Full time</option>
  <option value="part_time">Part time</option>
  <option value="contract">Contract</option>
  <option value="internship">Internship</option>
</select>
```

```tsx
<p>
  Try adjusting your search or <Link href="/jobs">see all jobs</Link>.
</p>
```

<li> Validation: I reviewed these suggestions before leaving them on the existing job-search PR, then tested company search and employment type filtering after the changes were added. </li><br>

<li> Prompt 2: i want users to be able to select multiple filter values without selecting a new one removing the ones they already chose. category, employment type and workplace type selections should stay active and stay in the url until the user removes or resets them. </li><br><br>

<li> Relevant AI Response: </li><br>

```tsx
function toArray(value: string | string[] | undefined) {
  if (!value) return []
  return Array.isArray(value) ? value : [value]
}
```

```tsx
const keyword = params.keyword ?? ''
const locations = toArray(params.location)
const categories = toArray(params.category)
const employmentTypes = toArray(params.employmentType)
const workplaceTypes = toArray(params.workplaceType)
```

```tsx
const [jobs, filterOptions, claimsResult] = await Promise.all([
  getJobs(
    keyword,
    locations,
    categories,
    employmentTypes,
    workplaceTypes
  ),
  getJobFilterOptions(),
  supabase.auth.getClaims(),
])
```

```tsx
{categories.map((value) => (
  <input key={value} type="hidden" name="category" value={value} />
))}

{employmentTypes.map((value) => (
  <input key={value} type="hidden" name="employmentType" value={value} />
))}

{workplaceTypes.map((value) => (
  <input key={value} type="hidden" name="workplaceType" value={value} />
))}
```

<li> AI-Suggested Content: AI first helped add company search and employment type filtering, then helped preserve multiple selected filters through URL parameters. </li><br>

<li> Validation: I tested company search, employment type filtering, multiple selected values, individual filter removal and resetting the filters. </li><br>

<li> Decision: Modified before use. I adapted the suggestions to the existing implementation and adjusted the multi-select behavior after testing. </li><br>

<li> Reflection: AI helped identify missing behavior in the original search and later helped expand the filtering to support multiple selections. Manual testing was still important because some combinations did not behave correctly at first. </li><br><br>

---

## 5. 2026-10-22 to 2026-10-23: Location Search and Recruiter Location Autocomplete

<li> Task Title: Location Search and Location Autocomplete </li><br>

<li> Purpose of AI Use: I used AI to change how location worked for both job seekers and recruiters. Location was moved beside keyword search, while recruiter postings used structured Geoapify suggestions. </li><br><br>

<li> Prompt 1: instead of having the location be part of the filters on the side, it should be next to the keyword search with a normal input and suggestions based on locations that exist in job postings. users should also still be able to type their own location. </li><br><br>

<li> Relevant AI Response: </li><br>

```tsx
const suggestions = useMemo(() => {
  const search = locationValue.trim().toLowerCase()

  return locationOptions
    .filter((option) => !search || option.toLowerCase().includes(search))
    .slice(0, 8)
}, [locationValue, locationOptions])
```

```tsx
function selectLocation(option: string) {
  setLocationValue(option)
  setShowLocations(false)

  setTimeout(() => formRef.current?.requestSubmit(), 0)
}
```

<li> Prompt 2: for recruiter job postings i want a real location autocomplete instead of people entering random versions of cities. i want to use geoapify and keep the city region and country separately so filtering is more consistent. </li><br><br>

<li> Relevant AI Response: </li><br>

```ts
const response = await fetch(
  `/api/locations?q=${encodeURIComponent(query)}`
)
```

```tsx
<input type="hidden" name="location" value={location} />
<input type="hidden" name="location_city" value={city} />
<input type="hidden" name="location_region" value={region} />
<input type="hidden" name="location_country" value={country} />
```

```ts
const locationSearch = formData.get('location_search')

const typedLocation =
  typeof locationSearch === 'string'
    ? locationSearch.trim()
    : ''

if (!values.location && typedLocation) {
  errors.location = 'Choose a location from the suggestions.'
}
```

<li> AI-Suggested Content: AI suggested a separate location search beside the keyword field and structured Geoapify values for recruiter postings, including validation for typed versus selected locations. </li><br>

<li> Validation: I tested typing locations, selecting suggestions and clearing the search. I also tested recruiter locations with a selected suggestion, typed-only text and a blank value. </li><br>

<li> Decision: Modified before use. I kept location beside keyword search and the structured recruiter autocomplete while allowing location to remain optional. </li><br>

<li> Reflection: AI helped separate flexible job-seeker location search from structured recruiter location data. I still tested the different input cases to make sure both flows behaved correctly. </li><br><br>

---

## 6. 2026-10-22 to 2026-10-23: Job Categories and Workplace Types

<li> Task Title: Job Category and Workplace Type Data </li><br>

<li> Purpose of AI Use: I used AI to standardize recruiter job categories and separate workplace type from geographic location so filtering used consistent values. </li><br><br>

<li> Prompt: i need workplace type to be separate from location because remote hybrid and onsite shouldn't be stored as the location itself. i also want recruiters to choose from predefined job categories so the filters don't end up with slightly different versions of the same category. </li><br><br>

<li> Relevant AI Response: </li><br>

```ts
export const WORKPLACE_TYPES = {
  onsite: 'On-site',
  hybrid: 'Hybrid',
  remote: 'Remote',
} as const
```

```ts
export const JOB_CATEGORIES = [
  'Accounting',
  'Administration',
  'Business Development',
  'Communications & Public Relations',
  'Consulting',
  'Customer Service',
  'Cybersecurity',
  'Data & Analytics',
  'Design & UX/UI',
  'Education',
  'Engineering',
  'Finance',
  'Government & Public Service',
  'Healthcare',
  'Hospitality & Tourism',
  'Human Resources',
  'IT & Infrastructure',
  'Legal',
  'Marketing',
  'Operations',
  'Product Management',
  'Project Management',
  'Quality Assurance',
  'Research',
  'Retail',
  'Sales',
  'Software Development',
  'Supply Chain & Logistics',
  'Other',
] as const
```

```sql
alter table public.jobs
  add column if not exists workplace_type text;

alter table public.jobs
  add constraint jobs_workplace_type_check
  check (
    workplace_type is null
    or workplace_type in ('onsite', 'hybrid', 'remote')
  );
```

<li> AI-Suggested Content: AI suggested fixed category/workplace values, server-side validation and a separate database field for workplace type. </li><br>

<li> Validation: I tested creating and editing postings with the new values and verified that they were stored, displayed and filtered correctly. I also checked existing remote jobs after the migration. </li><br>

<li> Decision: Modified before use. I kept the separate workplace field and standardized categories and adapted them to the existing posting schema. </li><br>

<li> Reflection: AI helped identify the data-model problem caused by mixing workplace type with physical location. Separating them made the recruiter form and filters more consistent. </li><br><br>

---

## 7. 2026-10-23: Job Listing Pagination

<li> Task Title: Job Listing Pagination </li><br>

<li> Purpose of AI Use: I used AI to add pagination while preserving the current search and filter values. </li><br><br>

<li> Prompt: i want to limit the job listings to 10 per page. when someone goes to the next page i don't want the keyword or filters they already selected to disappear. </li><br><br>

<li> Relevant AI Response: </li><br>

```ts
const JOBS_PER_PAGE = 10

const firstJob = (page - 1) * JOBS_PER_PAGE
const lastJob = firstJob + JOBS_PER_PAGE - 1
```

```ts
const result = await query
  .order('created_at', { ascending: false })
  .range(firstJob, lastJob)
```

<li> AI-Suggested Content: AI suggested using Supabase range queries and preserving existing search parameters in the pagination links. </li><br>

<li> Validation: I tested different pages with active searches and filters and confirmed that only ten jobs appeared per page while the selected values remained active. </li><br>

<li> Decision: Accepted with minor adjustments. The approach fit the existing filtered query without loading all matching jobs at once. </li><br>

<li> Reflection: AI helped add pagination without separating it from the existing search and filtering logic. I still tested navigation with active filters to confirm they were preserved. </li><br><br>

---

## 8. 2026-10-23: Automated Tests and Browser Test Setup

<li> Task Title: Job Search Tests and Browser Test Environment </li><br>

<li> Purpose of AI Use: I used AI to identify missing test coverage for the new job-search features and troubleshoot Playwright failures in the browser-test setup. </li><br><br>

<li> Prompt 1: the sprint requires tests for the features we added. what should we test for the job search filters pagination and recruiter location autocomplete without just testing implementation details? </li><br><br>

<li> Relevant AI Response: AI suggested testing combined filter results, filter ordering/removal, pagination, recruiter location validation and autocomplete selection. </li><br>

```js
test('job search applies keyword, location and selected filters', ...)
```

```js
test('jobs are limited to 10 per page', ...)
```

```js
test('active filters keep the order they were selected in', ...)
```

```js
test('removed filters disappear and newly selected filters are added last', ...)
```

The related feature tests were added or updated in:

- `tests/job-filtering.test.mjs`
- `tests/jobs.test.mjs`
- `tests/recruiter.test.mjs`
- `tests/browser/recruiter.spec.mjs`

<li> Prompt 2: the recruiter browser test used to type Montreal directly into the location input but now the form requires choosing a suggestion. how should i update the test without using the real geoapify API? </li><br><br>

<li> Relevant AI Response: </li><br>

```js
await page.route('**/api/locations**', route =>
  route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      results: [
        {
          id: 'montreal',
          city: 'Montreal',
          region: 'Quebec',
          country: 'Canada',
          label: 'Montreal, Quebec, Canada',
        },
      ],
    }),
  })
)
```

```js
await page.getByLabel('Location').fill('Montreal')
await page.getByRole('button', { name: 'Publish posting' }).click()

await expect(
  page.getByText('Choose a location from the suggestions.')
).toBeVisible()
```

```js
await page.getByRole(
  'button',
  { name: 'Montreal, Quebec, Canada', exact: true }
).click()
```

<li> Prompt 3: my Playwright tests arent running properly locally. some of them are failing before the tests even start and im getting errors with the preview/test setup. can you help me figure out whats causing it? </li><br><br>

<li> Relevant AI Response: AI identified that the failures were coming from the preview/test environment rather than the tests themselves and suggested a dedicated browser-test build using the same mock Supabase configuration. </li><br>

```json
"build:test": "node tests/fixtures/build-browser.mjs"
```

```yml
- run: npm run build
```

```yml
- run: npm run build:test
- run: npm run test:browser
```

The related browser-test setup files were:

- `tests/fixtures/build-browser.mjs`
- `tests/fixtures/recruiter-preview.mjs`

<li> AI-Suggested Content: AI suggested behavior-focused tests, mocking Geoapify in Playwright, and separating the browser-test build from the normal production build. </li><br>

<li> Validation: I ran the full checks locally. The final results were 19/19 unit and integration tests and 8/8 Playwright tests passing, along with successful lint, typecheck, production build and test build. </li><br>

<li> Decision: Modified before use. I adapted the tests to the existing structure and updated the browser-test setup so the mock environment was used consistently. </li><br>

<li> Reflection: AI helped identify both missing test coverage and the cause of the Playwright setup failures. It was especially useful for separating test-environment problems from actual application issues. </li><br><br>

---

## 9. 2026-10-25: Job Navigation and Pagination Fixes

<li> Task Title: Job Listing Navigation and Pagination Fixes </li><br>

<li> Purpose of AI Use: I used AI to fix job navigation and pagination issues and identify additional edge cases to test. </li><br><br>

<li> Prompt 1: when someone is on another page of the jobs listing or has filters/search active, opening the job details or apply page and clicking Back to Jobs brings them back to the normal /jobs page. can you fix it so they return to the same listing they came from without changing the rest of the search/filter logic? </li><br><br>

<li> Relevant AI Response: AI suggested passing the current jobs URL through the details and application links using a `returnTo` value and validating it before using it. If there is no valid return URL, it falls back to `/jobs`. </li><br>

```ts
export function getJobsReturnUrl(value: string | string[] | undefined): string {
  return typeof value === 'string' &&
    (value === '/jobs' || value.startsWith('/jobs?'))
    ? value
    : '/jobs'
}
```

<li> Prompt 2: you mentioned some pagination edge cases that could still cause problems, including out-of-range page numbers like `/jobs?page=999` and extremely large page values. how do we fix those without breaking the current filters or normal pagination? </li><br><br>

<li> Relevant AI Response: AI suggested checking the number of matching jobs before requesting a later page and returning to page 1 when the requested page does not exist. The existing keyword and filters are kept when the page number is removed. </li><br>

```tsx
const { jobs, total, page } = jobsResult

if (page !== requestedPage) {
  listingParams.delete('page')
  const query = listingParams.toString()
  redirect(query ? `/jobs?${query}` : '/jobs')
}
```

<li> Prompt 3: before i finish this fix can you check for other pagination edge cases that should be tested with it? </li><br><br>

<li> Relevant AI Response: AI suggested testing an empty job list, exactly ten jobs, invalid and very large page numbers, and jobs with the same posting date. It also suggested using the job ID as a second sort value so jobs with the same date stay in a consistent order between pages. </li><br>

```ts
query = query
  .order('created_at', { ascending: false })
  .order('id', { ascending: true })
```

<li> AI-Suggested Content: AI suggested preserving the original job listing URL when navigating between pages, safely handling invalid pagination values, keeping the current search and filters after a redirect, and adding tests for pagination boundary cases. </li><br>

<li> Validation: I tested the navigation and pagination fixes and ran the related automated tests to make sure the main job-listing behavior still worked correctly. </li><br>

<li> Decision: Accepted after reviewing the suggested fixes and test results. </li><br>

<li> Reflection: AI helped find and fix pagination cases that I had not considered when I first added pagination. </li><br><br>