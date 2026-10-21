// Job listings page: shows every active job posting as a row.
import Link from 'next/link'

import { createClient } from '@/lib/supabase/server'
import { getJobs, getJobFilterOptions } from '@/lib/jobs' // take the getJobs function from the job.ts file
import { getFavouriteJobIds } from '@/lib/favourites'
import { JobCard } from './jobs-card'
import { JobSearch } from './job-search'
import { JobFilters } from './job-filters'
import { FavouriteButton } from '../favourites/favourite-button'
import styles from '@/app/ui.module.css' // shared theme (header band, rows, pills, buttons)

// The page receives the URL's search and filter values
type JobsPageProps = {
  searchParams: Promise<{
    keyword?: string
    location?: string
    category?: string
    employmentType?: string
  }>
}

export default async function JobsPage({ searchParams }: JobsPageProps) { // this is the page where Next.js shows it
  // Read the search and filter values from the URL. If there isn't one, use '' (empty = show all jobs)
  const params = await searchParams
  const keyword = params.keyword ?? ''
  const location = params.location ?? ''
  const category = params.category ?? ''
  const employmentType = params.employmentType ?? ''
  const jobs = await getJobs(keyword, location, category, employmentType) // ask Supabase for the jobs that match the search
  const filterOptions = await getJobFilterOptions()

  const hasActiveSearch =
    keyword !== '' ||
    location !== '' ||
    category !== '' ||
    employmentType !== ''

  // Get the current user's role so job seekers can see the Apply button
  const supabase = await createClient()
  const { data: claims } = await supabase.auth.getClaims()

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', claims?.claims.sub ?? '')
    .maybeSingle()

  // Job seekers see a heart on each job; fill it in for the ones they already saved
  const favouriteIds = profile?.role === 'job_seeker'
    ? await getFavouriteJobIds(claims?.claims.sub ?? '')
    : new Set<string>()

  return ( // this is what is shown on the website screen basically like html
    <main>
      <header className={styles.header}>
        <div>
          <h1>Available Jobs For You</h1>

          {/* Show "1 open role" for a single job, otherwise "N open roles" */}
          <p>{jobs.length === 1 ? '1 open role' : `${jobs.length} open roles`}</p>
        </div>
      </header>
      {/* Search bar: clicking search puts the word in the url */}
      <JobSearch keyword={keyword} location={location} category={category} employmentType={employmentType} />

      <div className={styles.jobsLayout}>
        <JobFilters keyword={keyword} location={location} category={category} employmentType={employmentType} filterOptions={filterOptions} />
        <div className={styles.jobResults}>

          {jobs.length === 0 ? ( // nothing posted yet, so show a friendly empty state
            <section className={styles.card}>
              {hasActiveSearch ? (
                //The user searched, but nothing matched the jobs posted from the location, title or category .
                <>
                  <h2>No jobs match your search</h2>
                  <p> Try adjusting your search or <Link href="/jobs">see all jobs</Link>.</p>
                </>
              ) : (
                //No search, and there's no jobs posted at all
                <>
                  <h2> No jobs posted yet </h2>
                  <p>Check back in soon for new posting and opportunities</p>
                </>
              )}
            </section>
          ) : ( // otherwise list every job as a row, newest first
            <ul className={styles.list}>
              {jobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  href={`/jobs/${job.id}`} // job title leads to the full details page
                >
                  {profile?.role === 'job_seeker' && (
                    <>
                      {/* Save the job to the seeker's favourites list */}
                      <FavouriteButton
                        jobId={job.id}
                        jobTitle={job.title}
                        favourited={favouriteIds.has(job.id)}
                      />

                      {/* Secondary action: go directly to the existing application flow */}
                      <Link
                        className={styles.secondary}
                        href={`/jobs/${job.id}/apply`}
                        aria-label={`Apply for ${job.title}`}
                      >
                        Apply
                      </Link>

                      {/* Main action: open the full job details page */}
                      <Link
                        className={styles.primary}
                        href={`/jobs/${job.id}`}
                      >
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