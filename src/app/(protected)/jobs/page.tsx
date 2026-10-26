// Job listings page: shows every active job posting as a row.
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'
import { getJobs, getJobFilterOptions, JOBS_PER_PAGE } from '@/lib/jobs'
import { normalizeFilterOrder } from '@/lib/job-filtering'
import { getFavouriteJobIds } from '@/lib/favourites'
import { JobCard } from './jobs-card'
import { JobSearch } from './job-search'
import { JobFilters } from './job-filters'
import { ActiveFilters } from './active-filters'
import { FavouriteButton } from '../favourites/favourite-button'
import styles from '@/app/ui.module.css'

// The page receives the URL's search and filter values
type JobsPageProps = {
  searchParams: Promise<{
    keyword?: string
    location?: string | string[]
    category?: string | string[]
    employmentType?: string | string[]
    workplaceType?: string | string[]
    filterOrder?: string | string[]
    page?: string | string[]
  }>
}

// Turns one URL filter value or multiple values into an array
function toArray(value: string | string[] | undefined) {
  if (!value) return []
  return Array.isArray(value) ? value : [value]
}

// Uses the first value for search fields that only accept one value
function toSingle(value: string | string[] | undefined) {
  if (!value) return ''
  return Array.isArray(value) ? value[0] ?? '' : value
}

export default async function JobsPage({ searchParams }: JobsPageProps) {
  // Read the search and filter values from the URL
  const params = await searchParams
  const listingParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    toArray(value).forEach((entry) => listingParams.append(key, entry))
  })
  const listingQuery = listingParams.toString()
  const returnTo = encodeURIComponent(listingQuery ? `/jobs?${listingQuery}` : '/jobs')
  const keyword = params.keyword ?? ''
  const location = toSingle(params.location)
  const categories = toArray(params.category)
  const employmentTypes = toArray(params.employmentType)
  const workplaceTypes = toArray(params.workplaceType)
  const filterOrder = normalizeFilterOrder(toArray(params.filterOrder), categories, employmentTypes, workplaceTypes)

  const pageValue = Number(toSingle(params.page))
  const requestedPage = Number.isInteger(pageValue) && pageValue > 0 ? pageValue : 1

  const supabase = await createClient()

  // Load the jobs, filter choices and user information at the same time
  const [jobsResult, filterOptions, claimsResult] = await Promise.all([
    getJobs(keyword, location, categories, employmentTypes, workplaceTypes, requestedPage),
    getJobFilterOptions(),
    supabase.auth.getClaims(),
  ])

  const { jobs, total, page } = jobsResult
  if (page !== requestedPage) {
    listingParams.delete('page')
    const query = listingParams.toString()
    redirect(query ? `/jobs?${query}` : '/jobs')
  }
  const { data: claims } = claimsResult
  const totalPages = Math.ceil(total / JOBS_PER_PAGE)

  const hasActiveSearch =
    keyword !== '' ||
    location !== '' ||
    categories.length > 0 ||
    employmentTypes.length > 0 ||
    workplaceTypes.length > 0

  // Builds a page link while keeping the current search and filters
  function buildPageUrl(targetPage: number) {
    const pageParams = new URLSearchParams()

    if(keyword) pageParams.set('keyword', keyword)
    if(location) pageParams.set('location', location)

    categories.forEach((value) => pageParams.append('category', value))
    employmentTypes.forEach((value) => pageParams.append('employmentType', value))
    workplaceTypes.forEach((value) => pageParams.append('workplaceType', value))
    filterOrder.forEach((value) => pageParams.append('filterOrder', value))

    if(targetPage > 1) pageParams.set('page', String(targetPage))

    const query = pageParams.toString()
    return query ? `/jobs?${query}` : '/jobs'
  }

  // Get the current user's role so job seekers can see the Apply button
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', claims?.claims.sub ?? '')
    .maybeSingle()

  // Job seekers see a heart on each job; fill it in for the ones they already saved
  const favouriteIds = profile?.role === 'job_seeker'
    ? await getFavouriteJobIds(claims?.claims.sub ?? '')
    : new Set<string>()

  return (
    <main>
      <header className={styles.header}>
        <div>
          <h1>Available Jobs For You</h1>
          <p>{total === 1 ? '1 open role' : `${total} open roles`}</p>
        </div>
      </header>

      <JobSearch key={`${keyword}-${location}`} keyword={keyword} location={location} locationOptions={filterOptions.locations} categories={categories} employmentTypes={employmentTypes} workplaceTypes={workplaceTypes} filterOrder={filterOrder} />

      <div className={styles.jobsLayout}>
        <JobFilters key={`${categories.join('-')}-${workplaceTypes.join('-')}-${employmentTypes.join('-')}`} keyword={keyword} location={location} categories={categories} employmentTypes={employmentTypes} workplaceTypes={workplaceTypes} filterOrder={filterOrder} filterOptions={filterOptions} />

        <div className={styles.jobResults}>
          <ActiveFilters keyword={keyword} location={location} categories={categories} employmentTypes={employmentTypes} workplaceTypes={workplaceTypes} filterOrder={filterOrder} />

          {jobs.length === 0 ? (
            <section className={styles.card}>
              {hasActiveSearch ? (
                <>
                  <h2>No jobs match your search</h2>
                  <p>Try adjusting your search or filters, or <Link href="/jobs">see all jobs</Link>.</p>
                </>
              ) : (
                <>
                  <h2>No jobs posted yet</h2>
                  <p>Check back in soon for new posting and opportunities</p>
                </>
              )}
            </section>
          ) : (
            <>
              <ul className={styles.list}>
                {jobs.map((job) => (
                  <JobCard key={job.id} job={job} href={`/jobs/${job.id}?returnTo=${returnTo}`}>
                    {profile?.role === 'job_seeker' && (
                      <>
                        <FavouriteButton jobId={job.id} jobTitle={job.title} favourited={favouriteIds.has(job.id)} />

                        <Link className={styles.secondary} href={`/jobs/${job.id}/apply?returnTo=${returnTo}`} aria-label={`Apply for ${job.title}`}>
                          Apply
                        </Link>

                        <Link className={styles.primary} href={`/jobs/${job.id}?returnTo=${returnTo}`}>
                          <span className={styles.detailsDesktop}>View Details</span>
                          <span className={styles.detailsMobile}>Details</span>
                          <span className={styles.arrow}>→</span>
                        </Link>
                      </>
                    )}
                  </JobCard>
                ))}
              </ul>

              {totalPages > 1 && (
                <nav className={styles.pagination} aria-label="Job pages">
                  {page > 1 && <Link href={buildPageUrl(page - 1)}>← Previous</Link>}

                  {Array.from({length: totalPages}, (_, index) => index + 1).map((pageNumber) => (
                    <Link
                      key={pageNumber}
                      href={buildPageUrl(pageNumber)}
                      className={pageNumber === page ? styles.currentPage : undefined}
                      aria-current={pageNumber === page ? 'page' : undefined}
                    >
                      {pageNumber}
                    </Link>
                  ))}

                  {page < totalPages && <Link href={buildPageUrl(page + 1)}>Next →</Link>}
                </nav>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  )
}
