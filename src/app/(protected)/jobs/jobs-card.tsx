import Link from 'next/link'

import type { Job } from '@/lib/jobs' // imports the Job structure/type already defined for Supabase jobs
import styles from '@/app/ui.module.css' // shared theme styles (row, pills, buttons, etc.)

type JobCardProps = {
  job: Job // each JobCard receives one job from the jobs list
  href?: string // where the title/button link to; defaults to the job's details page
  children?: React.ReactNode // optional custom actions such as View Details / Apply
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

function DollarIcon() { // outlined dollar icon used inside the salary pill
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
      <path d="M12 6v12" />
      <path d="M15 8.5c-.8-1-1.8-1.5-3-1.5-1.7 0-3 1-3 2.5S10.3 12 12 12s3 1 3 2.5-1.3 2.5-3 2.5c-1.2 0-2.3-.5-3-1.5" />
    </svg>
  )
}

function formatEmploymentType(type: string) { // changes values such as full_time into Full Time
  return type
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

export function JobCard({
  job,
  href = `/jobs/${job.id}`,
  children,
}: JobCardProps) {
  return (
    <li className={styles.row}>
      <h2 className={styles.rowTitle}>
        {/* Job title leads to the same page as View Details */}
        <Link href={href}>
          {job.title}
        </Link>
      </h2>

      <p className={styles.meta}>
        <span>{job.company}</span>

        {job.category && (
          <>
            <span>|</span>
            <span>{job.category}</span>
          </>
        )}
      </p>

      <div className={styles.bottomRow}>
        <div className={styles.pills}>
          {job.location && (
            <div className={`${styles.pill} ${styles.jobPill}`}>
              <MapPinIcon />
              <span>{job.location}</span>
            </div>
          )}

          {job.employment_type && (
            <div className={`${styles.pill} ${styles.jobPill}`}>
              <ClockIcon />
              <span>{formatEmploymentType(job.employment_type)}</span>
            </div>
          )}

          {job.salary && (
            <div className={`${styles.pill} ${styles.jobPill}`}>
              <DollarIcon />
              {/* Remove the original $ because the icon already displays it */}
              <span>{job.salary.replace(/\$/g, '')}</span>
            </div>
          )}
        </div>

        {children ? (
          // Job seeker page can pass View Details + Apply here.
          // Recruiter pages can also pass their own actions.
          <div
            className={styles.actions}
            style={{ marginTop: 0 }}
          >
            {children}
          </div>
        ) : (
          // Default action if no custom buttons were provided
          <Link
            href={href}
            className={styles.primary}
          >
            View Details
            <span className={styles.arrow}>→</span>
          </Link>
        )}
      </div>
    </li>
  )
}