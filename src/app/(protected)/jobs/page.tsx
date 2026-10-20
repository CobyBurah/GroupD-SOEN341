// Job listings page: shows every active job posting as a row.
import Link from 'next/link'

import { createClient } from '@/lib/supabase/server'
import { getJobs } from '@/lib/jobs' // take the getJobs function from the job.ts file
import { JobCard } from './jobs-card'
import styles from '@/app/ui.module.css' // shared theme (header band, rows, pills, buttons)

export default async function JobsPage() { // this is the page where Next.js shows it
  const jobs = await getJobs() // ask Supabase for all jobs, await = wait for answer/loading

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

      {jobs.length === 0 ? ( // nothing posted yet, so show a friendly empty state
        <section className={styles.card}>
          <h2>No jobs posted yet</h2>
          <p>Check back soon for new opportunities.</p>
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