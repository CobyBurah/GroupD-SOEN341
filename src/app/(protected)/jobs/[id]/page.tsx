import Link from 'next/link'

import { getJob } from '@/lib/jobs'
import { getJobsReturnUrl } from '@/lib/job-navigation'
import { WORKPLACE_TYPES } from '@/lib/job-posting'
import styles from '@/app/ui.module.css'

type JobDetailsPageProps = {
  searchParams: Promise<{ returnTo?: string | string[] }>
  params: Promise<{
    id: string
  }>
}

export default async function JobDetailsPage({
  params,
  searchParams,
}: JobDetailsPageProps) {
  // Get the id from the URL
  const { id } = await params
  const returnTo = getJobsReturnUrl((await searchParams).returnTo)

  // Ask Supabase for the job that has this id
  const job = await getJob(id)

  // If no job exists with this id, show a basic error message
  if (!job) {
    return (
      <main>
        <h1>Job not found</h1>

        <p>
          <strong>
            <Link href={returnTo}>← Back to Jobs</Link>
          </strong>
        </p>
      </main>
    )
  }

  const postedDate = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(job.created_at))

  // Only display Job Information when at least one field exists
  const hasJobInformation = Boolean(
    job.category ||
    job.employment_type ||
    job.workplace_type ||
    job.salary
  )

  return (
    <main>
      {/* Main job header */}
      <header className={styles.header}>
        <div>
          <h1>{job.title}</h1>

          <p>
            {job.company}
            {job.location ? ` · ${job.location}` : ''}
          </p>
        </div>

        <Link
          href={`/jobs/${job.id}/apply?returnTo=${encodeURIComponent(returnTo)}`}
          className={styles.primary}
        >
          Apply Now
        </Link>
      </header>

      {/* Navigation back to the job listings */}
      <p className={styles.backLink}>
        <Link href={returnTo}>
          ← Back to Jobs
        </Link>
      </p>

      {/* Only show the section if there is job information to display */}
      {hasJobInformation && (
        <section>
          <h2>Job Information</h2>

          {job.category && (
            <p>
              <strong>Category:</strong> {job.category}
            </p>
          )}

          {job.workplace_type && (
            <p>
              <strong>Workplace:</strong>{' '}
              {WORKPLACE_TYPES[job.workplace_type as keyof typeof WORKPLACE_TYPES]}
            </p>
          )}

          {job.employment_type && (
            <p>
              <strong>Employment Type:</strong>{' '}
              {job.employment_type
                .replace(/_/g, ' ')
                .replace(/\b\w/g, (letter) => letter.toUpperCase())}
            </p>
          )}

          {job.salary && (
            <p>
              <strong>Salary:</strong> {job.salary}
            </p>
          )}

          <p>
            <strong>Posted:</strong> {postedDate}
          </p>
        </section>
      )}

      <section>
        <h2>Job Description</h2>

        <p className={styles.description}>
          {job.description}
        </p>
      </section>

      {/* Second application option below the final divider */}
      <div className={styles.actions}>
        <Link
          href={`/jobs/${job.id}/apply?returnTo=${encodeURIComponent(returnTo)}`}
          className={styles.primary}
        >
          Apply Now
        </Link>
      </div>
    </main>
  )
}
