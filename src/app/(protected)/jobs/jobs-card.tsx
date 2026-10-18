import type { Job } from '@/lib/jobs'
import styles from './jobs.module.css'

type JobCardProps = {
  job: Job
}

export function JobCard({ job }: JobCardProps) {
  return (
    <article className={styles.jobCard}>
      <h2>{job.title}</h2>
      <p>{job.company}</p>

      {job.location && <p>{job.location}</p>}
      {job.category && <p>{job.category}</p>}
      {job.employment_type && <p>{job.employment_type}</p>}
      {job.salary && <p>{job.salary}</p>}

      <p>
        {job.description.length > 150
          ? `${job.description.slice(0, 150)}...`
          : job.description}
      </p>

      <button className={styles.detailsButton}>
        View Details
      </button>
    </article>
  )
}