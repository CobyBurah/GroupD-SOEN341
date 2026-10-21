// Job listings page: shows every active job posting as a row.
import Link from 'next/link'

import { createClient } from '@/lib/supabase/server'
import { getJobs } from '@/lib/jobs' // take the getJobs function from the job.ts file
import { JobCard } from './jobs-card'
import styles from '@/app/ui.module.css' // shared theme (header band, rows, pills, buttons)

// The page receives the URL's search words
type JobsPageProps = {
  searchParams: Promise<{ 
  keyword?: string 
  employmentType?: string}>
}

export default async function JobsPage({ searchParams }: JobsPageProps) { // this is the page where Next.js shows it
  // Read the search word from the URL. If there isn't one, use '' (empty = show all jobs)
  const params = await searchParams
  const keyword = params.keyword ?? ''
const employmentType = params.employmentType ?? ''
 const jobs = await getJobs(keyword, '', '', employmentType) // ask Supabase for the jobs that match the search
  // Get the current user's role so job seekers can see the Apply button
  const supabase = await createClient()
  const { data: claims } = await supabase.auth.getClaims()

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', claims?.claims.sub ?? '')
    .maybeSingle()

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
      <form action = "/jobs" className = {styles.actions}>
        <input 
          type = "text"
          name = "keyword"
          placeholder = "Search by title, company, category, location..."
          defaultValue = {keyword}
          aria-label= "Search Jobs"
          />
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

<button type="submit">Search</button>
      </form>

      {jobs.length === 0 ? ( // nothing posted yet, so show a friendly empty state
        <section className={styles.card}>
          {keyword !== '' || employmentType !== '' ? (
            //The user searched, but nothing matched the jobs posted from the location, title or category .
          <>
           <h2>No jobs match your search</h2>
           <p> Try adjusting your search or <Link href = "/jobs">see all jobs</Link>.</p>
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
    </main>
  )
}