import Link from 'next/link'

import type { Job } from '@/lib/jobs' // imports the Job structure/type already defined for Supabase jobs
import styles from './jobs-card.module.css' // styles specifically for each job card

type JobCardProps = {
  job: Job // each JobCard receives one job from the jobs list
}

function MapPinIcon() { // outlined location icon used inside the location pill
  return (
    <svg
      className={styles.icon}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true" // screen readers can ignore the icon because the text already explains it
    >
      <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  )
}

function ClockIcon() { // outlined clock icon used inside the employment type pill
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

function formatEmploymentType(type: string) { // changes values such as full_time into Full Time
  return type
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

export function JobCard({ job }: JobCardProps) {
  const detailsUrl = `/jobs/${job.id}` // both the title and button lead to the same job details page

  return (
    <article className={styles.jobCard}>
      <h2 className={styles.jobTitle}>
        <Link href={detailsUrl} className={styles.jobTitleLink}>
          {job.title}
        </Link>
      </h2>

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
          href={detailsUrl}
          className={styles.detailsButton}
        >
          View Details
          <span className={styles.arrow}>→</span>
        </Link>
      </div>
    </article>
  )
}
