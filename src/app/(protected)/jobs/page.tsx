// Job listings page: shows every active job posting as a card.
import { getJobs } from '@/lib/jobs' //take the getJobs function from the job.ts file
import { EMPLOYMENT_TYPES } from '@/lib/job-posting'
import styles from '@/app/ui.module.css'

export default async function JobsPage() { //this is the page where Next.js shows it 
  const jobs = await getJobs() // ask Supabase for all jobs awaits = wait for answer/loading

  return ( //this is what is shown on the website screen basically like html
    <main>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Opportunities</p>
          <h1>Available Jobs ({jobs.length})</h1>
          <p>Browse the latest roles posted by recruiters.</p>
        </div>
      </header>
      {jobs.length === 0 ? (
        <section className={styles.card}><h2>No jobs posted yet</h2><p>Check back soon for new opportunities.</p></section>
      ) : (
        <ul className={styles.list}>
          {jobs.map((job) => (
            <li key={job.id} className={styles.card}>
              <h2>{job.title}</h2>
              <p>{job.company}{job.location ? ` · ${job.location}` : ''}</p>
              <p className={styles.muted}>
                {job.employment_type ? EMPLOYMENT_TYPES[job.employment_type as keyof typeof EMPLOYMENT_TYPES] ?? job.employment_type : 'Employment type not specified'}
                {job.category ? ` · ${job.category}` : ''}
                {job.salary ? ` · ${job.salary}` : ''}
              </p>
              <p className={styles.description}>{job.description.length > 220 ? `${job.description.slice(0, 220)}…` : job.description}</p>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
