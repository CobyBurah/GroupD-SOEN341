// Job listings page for job seekers. This page fetches job data from the Supabase database and displays it using the JobCard component. It also shows the total number of jobs found. The page is styled using CSS modules for a clean and organized layout.
import { getJobs } from '@/lib/jobs' //take the getJobs function from the job.ts file
import { JobCard } from './jobs-card'
import styles from './jobs.module.css'

export default async function JobsPage() { //this is the page where Next.js shows it 
  const jobs = await getJobs() // ask Supabase for all jobs awaits = wait for answer/loading

  return ( //this is what is shown on the website screen basically like html
         <main className={styles.page}>
      <h1>Find Jobs</h1>
      <p>{jobs.length} jobs found</p>

      <div className={styles.jobList}>
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
    </main>
  )
}
