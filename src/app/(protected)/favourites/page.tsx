// Favourites page: the jobs a job seeker has saved from the listings.
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'
import { getFavouriteJobs } from '@/lib/favourites'
import { JobCard } from '../jobs/jobs-card'
import { FavouriteButton } from './favourite-button'
import styles from '@/app/ui.module.css'

export default async function FavouritesPage() {
  const supabase = await createClient()
  const { data: claims } = await supabase.auth.getClaims()
  const userId = claims?.claims.sub
  if (!userId) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', userId).single()
  if (profile?.role !== 'job_seeker') {
    return (
      <main>
        <header className={styles.header}>
          <div><h1>Favourites</h1></div>
        </header>
        <section className={styles.card}>
          <h2>Not available for this account</h2>
          <p>Only job seekers can save favourite jobs.</p>
        </section>
      </main>
    )
  }

  const jobs = await getFavouriteJobs(userId)

  return (
    <main>
      <header className={styles.header}>
        <div>
          <h1>Favourites</h1>
          <p>{jobs.length === 1 ? '1 saved job' : `${jobs.length} saved jobs`}</p>
        </div>
        <Link className={styles.primary} href="/jobs">Browse jobs</Link>
      </header>

      {jobs.length === 0 ? (
        <section className={styles.card}>
          <h2>No favourites yet</h2>
          <p>Save jobs from the <Link href="/jobs">job listings</Link> to keep track of the ones you like.</p>
        </section>
      ) : (
        <ul className={styles.list}>
          {jobs.map((job) => (
            <JobCard key={job.id} job={job}>
              <FavouriteButton jobId={job.id} jobTitle={job.title} favourited />
              <Link
                className={styles.secondary}
                href={`/jobs/${job.id}/apply`}
                aria-label={`Apply for ${job.title}`}
              >
                Apply
              </Link>
              <Link className={styles.primary} href={`/jobs/${job.id}`}>
                View Details
                <span className={styles.arrow}>→</span>
              </Link>
            </JobCard>
          ))}
        </ul>
      )}
    </main>
  )
}
