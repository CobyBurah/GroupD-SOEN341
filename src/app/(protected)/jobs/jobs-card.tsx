import Link from 'next/link'

import type { Job } from '@/lib/jobs'
import styles from './jobs-card.module.css'

type JobCardProps = {
  job: Job
}

function MapPinIcon() {
  return (
    <svg
      className={styles.icon}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 2C7.9 2 4.5 5.3 4.5 9.5c0 5.6 7.5 12.5 7.5 12.5s7.5-6.9 7.5-12.5C19.5 5.3 16.1 2 12 2Zm0 10.2a2.7 2.7 0 1 1 0-5.4 2.7 2.7 0 0 1 0 5.4Z" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg
      className={styles.icon}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  )
}

function formatEmploymentType(type: string) {
  return type
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

export function JobCard({ job }: JobCardProps) {
  return (
    <article className={styles.jobCard}>
      <h2 className={styles.jobTitle}>{job.title}</h2>

      <p className={styles.companyLine}>
        <span>{job.company}</span>

        {job.category && (
          <>
            <span className={styles.companySeparator}>|</span>
            <span>{job.category}</span>
          </>
        )}
      </p>

      <div className={styles.bottomRow}>
        <div className={styles.detailsRow}>
          {job.location && (
            <div className={styles.infoPill}>
              <MapPinIcon />
              <span>{job.location}</span>
            </div>
          )}

          {job.employment_type && (
            <div className={styles.infoPill}>
              <ClockIcon />
              <span>{formatEmploymentType(job.employment_type)}</span>
            </div>
          )}

          {job.salary && (
            <div className={styles.infoPill}>
              <span>{job.salary}</span>
            </div>
          )}
        </div>

        {/* To be changed to actual job details page when implemented */}
        <Link
          href={`/jobs/${job.id}`}
          className={styles.detailsButton}
        >
          View Details
          <span className={styles.arrow}>→</span>
        </Link>
      </div>
    </article>
  )
}