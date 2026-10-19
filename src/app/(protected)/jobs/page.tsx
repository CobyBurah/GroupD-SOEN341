// Job listings page for job seekers. This page fetches job data from the Supabase database and displays it using the JobCard component. The page is styled using CSS modules for a clean and organized layout.

import { getJobs } from '@/lib/jobs' //take the getJobs function from the job.ts file
import { JobCard } from './jobs-card'
import styles from './page.module.css'

import { Montserrat, Inter } from 'next/font/google' //importing fonts from google fonts

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export default async function JobsPage() { //this is the page where Next.js shows it
  const jobs = await getJobs() // ask Supabase for all jobs awaits = wait for answer/loading

  return ( //this is what is shown on the website screen basically like html
    <main
      className={`${styles.page} ${montserrat.variable} ${inter.variable}`}
    >
      <section className={styles.header}>
        <div className={styles.headerContent}>
          <h1>Available Jobs For You</h1>
        </div>
      </section>

      <section className={styles.jobsSection}>
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </section>
    </main>
  )
}