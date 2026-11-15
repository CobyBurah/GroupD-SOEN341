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

---

## 2. 2026-11-12: Application Activity Metrics and Interface

<li> Task Title: Application Activity Summary and Chart </li><br>

<li> Purpose of AI Use: I used AI to implement and refine the activity section on My Applications, including application counts, a chart with selectable time ranges, and responsive styling consistent with the site. </li><br><br>

<li> Prompt 1: review the activity metrics section on My Applications using the files I already modified. the layout still has a few inconsistencies with the rest of the site, especially the spacing, sizing and how the section behaves on smaller screens. improve that part only and keep the current project structure and styling </li><br><br>

<li> Relevant AI Response: </li><br>

```tsx
<dl className={styles.activitySummary} aria-label="Application activity summary">
  <div className={styles.activityMetric}>
    <dt className={styles.activityMetricLabel}>Total applications</dt>
    <dd className={styles.activityMetricValue}>{activity.total}</dd>
  </div>

  <div className={styles.activityMetric}>
    <dt className={styles.activityMetricLabel}>This week</dt>
    <dd className={styles.activityMetricValue}>{activity.thisWeek}</dd>
  </div>

  <div className={styles.activityMetric}>
    <dt className={styles.activityMetricLabel}>This month</dt>
    <dd className={styles.activityMetricValue}>{activity.thisMonth}</dd>
  </div>
</dl>
```

```css
.applicationsLayout { display: grid; grid-template-columns: minmax(0, 1fr) 320px; align-items: start; }
.activitySidebar { position: sticky; top: 24px; border-left: 2px solid var(--cc-line); }
.activitySummary { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); }
```

<li> Prompt 2: the applications per week chart feels too limited right now because it only lets me look at activity by week. i want the user to be able to choose different time periods, like recent days or a few months, and for the grouping to adjust depending on the selected range. also improve how the dates are displayed because having too many labels under the chart makes it look cramped </li><br><br>

<li> Relevant AI Response: </li><br>

```ts
export type ActivityRange = '7d' | '30d' | '3m' | '12m'

series: {
  '7d': group(new Date(today.getTime() - 6 * ONE_DAY_MS), 'day'),
  '30d': group(new Date(today.getTime() - 29 * ONE_DAY_MS), 'day'),
  '3m': group(startOfMonth(today, -2), 'week'),
  '12m': group(startOfMonth(today, -11), 'month'),
}
```

```tsx
<select
  aria-label="Activity time period"
  value={range}
  onChange={(event) => setRange(event.target.value as ActivityRange)}
>
  <option value="7d">Last 7 days</option>
  <option value="30d">Last 30 days</option>
  <option value="3m">Last 3 months</option>
  <option value="12m">Last 12 months</option>
</select>
```

<li> AI-Suggested Content: AI helped implement total, weekly and monthly application counts, date aggregation, chart labels, tooltips and responsive styling. </li><br>

<li> Validation: Unit and browser tests covered application counts, date boundaries, time-range grouping, chart labels, tooltips, empty states and responsive layouts. </li><br>

<li> Decision: Modified during use. I requested several layout changes, larger text, simpler titles, horizontal summary cards, removal of shadows and gradients, and tooltips only for non-zero bars. I also removed the All time option and chose 7 days as the default. </li><br>

<li> Reflection: AI helped implement and revise the chart, but the initial layouts and date labels needed several adjustments. Reviewing the interface helped identify which information was useful and which elements made it harder to understand. </li><br><br>

---

## 3. 2026-11-12: Application and Favourite Job Navigation

<li> Task Title: Return Navigation and Already-Applied Job State </li><br>

<li> Purpose of AI Use: I used AI to improve navigation between job details, My Applications and Favourites, and correct the action displayed for jobs already applied to. </li><br><br>

<li> Prompt 1: when i open a job from My Applications and click View Job, it brings me to the job details page but there is no direct way to return to the same applications page i came from. i want the return link to keep the application page and any status filter that was already selected, while still keeping the existing returnTo behavior for the regular job listing </li><br><br>

<li> Relevant AI Response: </li><br>

```tsx
const returnTo = encodeURIComponent(
  status
    ? `/applications?status=${encodeURIComponent(status)}`
    : '/applications'
)

<JobCard
  job={application.job}
  href={`/jobs/${application.job.id}?returnTo=${returnTo}`}
>
```

```ts
export function getJobReturnLink(returnTo?: string | string[]) {
  const href = getJobsReturnUrl(returnTo)

  if (href.startsWith('/applications')) {
    return { href, label: '← Back to My applications' }
  }

  if (href.startsWith('/favourites')) {
    return { href, label: '← Back to Favourites' }
  }

  return { href, label: '← Back to Jobs' }
}
```

<li> Prompt 2: also fix the job details page when the user already applied. right now they can open a job they already applied to and still see Apply Now, which does not make sense. use the signed-in user's application to show that they already applied and give them a way to return to My Applications, while keeping the same return navigation from Applications and Favourites </li><br><br>

<li> Relevant AI Response: </li><br>

```tsx
{application ? (
  <>
    <p role="status">
      You have applied for this job. Status: {application.status}.
    </p>

    <Link href="/applications">
      View my applications
    </Link>
  </>
) : (
  <Link href={`/jobs/${job.id}/apply?returnTo=${returnTo}`}>
    Apply Now
  </Link>
)}
```

<li> AI-Suggested Content: AI helped update return-link validation, details and apply-page links, application-status handling, and page revalidation after applying or withdrawing. </li><br>

<li> Validation: Unit tests covered allowed return destinations and invalid URLs. Browser tests covered returning to My Applications and Favourites, preserving filters, displaying existing application status, and applying again after withdrawal. </li><br>

<li> Decision: Accepted with adjustments to preserve the existing job-search navigation and match the back-link styling already used on the details page. </li><br>

<li> Reflection: AI helped extend an existing navigation pattern consistently across multiple entry points. Testing the complete navigation flow was important because the correct destination depended on where the user opened the job. </li><br><br>

---

## 4. 2026-11-12: Chart Preference Persistence and Browser Test Debugging

<li> Task Title: Preserve Chart Range and Fix Ambiguous Browser Assertion </li><br>

<li> Purpose of AI Use: I used AI to remember the selected chart range after refresh, eliminate the initial range jump, and investigate a browser-test failure after adding the chart. </li><br><br>

<li> Prompt 1: if the user changes the chart time range, for example from 7 days to 3 months, i want that choice to stay selected even if they refresh the My Applications page instead of resetting back to the default </li><br><br>

<li> Prompt 2: after saving the selected range, there is still a visible issue on refresh. if i choose 3 months and refresh the page, it first loads the 7 day chart and then switches back to 3 months. i want the page to load directly with the saved range so the user does not see that switch </li><br><br>

<li> Relevant AI Response: </li><br>

```ts
export const ACTIVITY_RANGE_COOKIE = 'cc-application-activity-range'

function saveRange(range: ActivityRange) {
  currentRange = range

  document.cookie =
    `${ACTIVITY_RANGE_COOKIE}=${range}; Path=/applications; Max-Age=31536000; SameSite=Lax`

  window.dispatchEvent(new Event(RANGE_CHANGE_EVENT))
}
```

```tsx
const initialRange = getPreferredActivityRange(
  (await cookies()).get(ACTIVITY_RANGE_COOKIE)?.value
)

<ApplicationActivitySection
  activity={activity}
  initialRange={initialRange}
/>
```

```ts
const range = useSyncExternalStore(
  subscribeToRange,
  () => getSavedRange(initialRange),
  () => initialRange
)
```

<li> Prompt 3: check why the browser test is failing after the chart changes. the test is looking for the text “1 application” but that same text now appears in both the page header and the activity chart, so make the test target the correct one without changing the actual page behavior </li><br><br>

<li> Relevant AI Response: </li><br>

```js
await expect(
  seeker
    .locator('main > header')
    .getByText('1 application', { exact: true })
).toBeVisible()
```

<li> AI-Suggested Content: AI helped implement server-readable range persistence, fallback handling for invalid preferences, regression tests for the initial rendered range, and a more specific browser-test selector. </li><br>

<li> Validation: The activity unit tests, typecheck, production build and browser tests passed after the fixes. The completed activity and navigation work was merged through PR #144. </li><br>

<li> Decision: Kept the cookie-based persistence approach and the header-scoped assertion after checking their test results. </li><br>

<li> Reflection: AI helped distinguish the saved-preference problem from the initial-render problem and helped isolate the browser-test failure without changing the application behavior. </li><br><br>

---

## 5. 2026-11-12: Acceptance Tests

<li> Task Title: US-16 Acceptance Tests </li><br>

<li> Purpose of AI Use: I used AI to organize acceptance tests for the two parts of US-16 and make sure they matched the current implementation. </li><br><br>

<li> Prompt 1: based on the current US-16 implementation in the repo, make two separate acceptance tests. one should cover the application activity summary and the other should cover the chart. keep the same acceptance-test structure we already use and make sure the expected results match the current behavior, including the available time ranges </li><br><br>

<li> Relevant AI Response: </li><br>

```text
AT-US16-01: Application Activity Summary

Expected results:
- Total, weekly and monthly counts are correct.
- Status filters do not change the activity counts.
- With no applications, counts show 0 and the chart is hidden.
```

```text
AT-US16-02: Application Activity Chart

Expected results:
- The chart updates correctly for each selected range.
- Activity is grouped by day, week or month as appropriate.
- Empty periods show 0.
- Non-zero bars show the date and count on hover/focus.
- The chart remains usable on different screen sizes.
```

<li> AI-Suggested Content: AI helped separate US-16 into two acceptance-test scenarios and match the expected results to the implemented behavior. </li><br>

<li> Validation: Both US-16 acceptance tests were manually marked PASS after checking the implemented summary and chart behavior. </li><br>

<li> Decision: Modified before use. I kept the acceptance tests concise and separated them according to the two US-16 tasks. </li><br>

<li> Reflection: AI helped turn the implemented functionality into clear acceptance tests without adding behavior that was not actually in the project. </li><br><br>

---

## 6. 2026-11-14: Applied Indicator on Job Listings

<li> Task Title: Show Applied State on Job Listings and Favourites </li><br>

<li> Purpose of AI Use: I used AI to implement issue #143 so jobs already applied to show a simple Applied indicator instead of the Apply button. </li><br><br>

<li> Prompt 1: implement issue #143 using the current repo structure. on the main job listings page, if the signed-in job seeker already has an application for one of the visible jobs, replace the Apply button with a non-clickable Applied indicator. do not show the detailed application status like Interview or Rejected on the listing because that should stay in My Applications and job details. keep View Details, Favourites, search, filters, pagination and recruiter behavior unchanged </li><br><br>

<li> Relevant AI Response: </li><br>

```ts
export async function getAppliedJobIds(userId: string, jobIds: string[]): Promise<Set<string>> {
  if (!userId || jobIds.length === 0) return new Set<string>()

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('applications')
    .select('job_id')
    .eq('user_id', userId)
    .in('job_id', jobIds)

  if (error) throw new Error('Could not load applied jobs: ' + error.message)

  return new Set((data ?? []).map((row) => row.job_id as string))
}
```

```tsx
const [favouriteIds, appliedIds] = profile?.role === 'job_seeker'
  ? await Promise.all([
    getFavouriteJobIds(claims?.claims.sub ?? ''),
    getAppliedJobIds(claims?.claims.sub ?? '', jobs.map((job) => job.id)),
  ])
  : [new Set<string>(), new Set<string>()]
```

```tsx
{appliedIds.has(job.id) ? (
  <span className={`${styles.statusBadge} ${styles.statusApplied}`}>
    Applied
  </span>
) : (
  <Link
    className={styles.secondary}
    href={`/jobs/${job.id}/apply?returnTo=${returnTo}`}
    aria-label={`Apply for ${job.title}`}
  >
    Apply
  </Link>
)}
```

<li> Prompt 2: also apply the same behavior to Favourites because a saved job can already have an application too. make sure that after the user withdraws the application, the Applied indicator disappears and the Apply option becomes available again. add tests for this without changing the existing navigation or favourites behavior </li><br><br>

<li> Relevant AI Response: </li><br>

```tsx
const jobs = await getFavouriteJobs(userId)
const appliedIds = await getAppliedJobIds(userId, jobs.map((job) => job.id))

{appliedIds.has(job.id) ? (
  <span className={`${styles.statusBadge} ${styles.statusApplied}`}>Applied</span>
) : (
  <Link
    className={styles.secondary}
    href={`/jobs/${job.id}/apply?returnTo=${returnTo}`}
    aria-label={`Apply for ${job.title}`}
  >
    Apply
  </Link>
)}
```

```js
await expect(indicator).toBeVisible()
await expect(apply).toHaveCount(0)

await application
  .getByRole('button', { name: `Withdraw application for ${job.title}` })
  .click()

await page.goBack()
await expect(apply).toBeVisible()
await expect(indicator).toHaveCount(0)
```

<li> AI-Suggested Content: AI helped add a lightweight query for applied job IDs, reuse it on Jobs and Favourites, update application revalidation, and add browser and unit coverage for the new behavior. </li><br>

<li> Validation: Tests cover applied and unapplied jobs, another signed-in job seeker, Favourites, withdrawal, filtered pagination, View Details and recruiter behavior. </li><br>

<li> Decision: Modified during use. I chose to keep the listing indicator as Applied even if the application's detailed status later changes to Interview or another status. Detailed statuses remain in My Applications and job details. </li><br>

<li> Reflection: AI helped reuse the existing application data without loading unnecessary history. Keeping the listing state simple made the job cards easier to scan while still preventing duplicate applications. </li><br><br>

---
