// Job listings page: shows every active job posting as a row.
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getJobs } from '@/lib/jobs' // take the getJobs function from the job.ts file
import { JobCard } from './jobs-card'
import styles from '@/app/ui.module.css' // shared theme (header band, rows, pills, buttons)

export default async function JobsPage() { // this is the page where Next.js shows it
  const jobs = await getJobs() // ask Supabase for all jobs, await = wait for answer/loading

  const supabase = await createClient()
  const { data: claims } = await supabase.auth.getClaims()
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', claims?.claims.sub ?? '').maybeSingle()

  return ( // this is what is shown on the website screen basically like html
    <main>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Opportunities</p>
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
      ) : ( // otherwise list every job as a row, newest first (getJobs already sorts them)
        <ul className={styles.list}>
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} href={profile?.role === 'job_seeker' ? `/jobs/${job.id}/apply` : undefined}>
              {profile?.role === 'job_seeker' && (
                <Link className={styles.primary} href={`/jobs/${job.id}/apply`} aria-label={`Apply for ${job.title}`}>Apply</Link>
              )}
            </JobCard>
          ))}
        </ul>
      )}
    </main>
  )
}
