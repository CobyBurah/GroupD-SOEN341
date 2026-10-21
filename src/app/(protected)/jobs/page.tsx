// Job listings page: shows every active job posting as a row.
import Link from 'next/link'

import { createClient } from '@/lib/supabase/server'
import { getJobs, getJobFilterOptions } from '@/lib/jobs'
import { getFavouriteJobIds } from '@/lib/favourites'
import { JobCard } from './jobs-card'
import { JobSearch } from './job-search'
import { JobFilters } from './job-filters'
import { FavouriteButton } from '../favourites/favourite-button'
import styles from '@/app/ui.module.css'

// The page receives the URL's search and filter values
type JobsPageProps = {
  searchParams: Promise<{
    keyword?: string
    location?: string | string[]
    category?: string | string[]
    employmentType?: string | string[]
  }>
}

// Turns one URL filter value or multiple values into an array
function toArray(value: string | string[] | undefined) {
  if (!value) return []
  return Array.isArray(value) ? value : [value]
}

export default async function JobsPage({ searchParams }: JobsPageProps) {
  // Read the search and filter values from the URL
  const params = await searchParams
  const keyword = params.keyword ?? ''
  const locations = toArray(params.location)
  const categories = toArray(params.category)
  const employmentTypes = toArray(params.employmentType)

  const supabase = await createClient()

  // Load the jobs, filter choices and user information at the same time
  const [jobs, filterOptions, claimsResult] = await Promise.all([
    getJobs(keyword, locations, categories, employmentTypes),
    getJobFilterOptions(),
    supabase.auth.getClaims(),
  ])

  const { data: claims } = claimsResult

  const hasActiveSearch =
    keyword !== '' ||
    locations.length > 0 ||
    categories.length > 0 ||
    employmentTypes.length > 0

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
          <p>{jobs.length === 1 ? '1 open role' : `${jobs.length} open roles`}</p>
        </div>
      </header>

      <JobSearch keyword={keyword} locations={locations} categories={categories} employmentTypes={employmentTypes} />

      <div className={styles.jobsLayout}>
        <JobFilters keyword={keyword} locations={locations} categories={categories} employmentTypes={employmentTypes} filterOptions={filterOptions} />

        <div className={styles.jobResults}>
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
            <ul className={styles.list}>
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} href={`/jobs/${job.id}`}>
                  {profile?.role === 'job_seeker' && (
                    <>
                      <FavouriteButton jobId={job.id} jobTitle={job.title} favourited={favouriteIds.has(job.id)} />

                      <Link className={styles.secondary} href={`/jobs/${job.id}/apply`} aria-label={`Apply for ${job.title}`}>
                        Apply
                      </Link>

                      <Link className={styles.primary} href={`/jobs/${job.id}`}>
                        View Details
                        <span className={styles.arrow}>→</span>
                      </Link>
                    </>
                  )}
                </JobCard>
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  )
}