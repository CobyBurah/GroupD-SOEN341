// My applications page: every job a seeker has applied to, with its current status and history.
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'
import { APPLICATION_STATUSES, isApplicationStatus, type ApplicationStatus } from '@/lib/applications'
import { getSeekerApplications, type SeekerApplication } from '@/lib/seeker-applications'
import { JobCard } from '../jobs/jobs-card'
import { WithdrawButton } from './withdraw-button'
import styles from '@/app/ui.module.css'

type ApplicationsPageProps = {
  searchParams: Promise<{ status?: string | string[] }>
}

const STATUS_CLASSES: Record<ApplicationStatus, string> = {
  'Applied': styles.statusApplied,
  'Under Review': styles.statusUnderReview,
  'Interview': styles.statusInterview,
  'Offered': styles.statusOffered,
  'Rejected': styles.statusRejected,
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-CA', { dateStyle: 'medium' })
}

function StatusBadge({ status }: { status: ApplicationStatus }) {
  return <span className={`${styles.statusBadge} ${STATUS_CLASSES[status]}`}>{status}</span>
}

// Status, applied date, resume used and the expandable status timeline.
function ApplicationDetails({ application }: { application: SeekerApplication }) {
  return (
    <div className={styles.applicationDetails}>
      <p className={styles.applicationSummary}>
        <StatusBadge status={application.status} />
        <span>Applied {formatDate(application.created_at)}</span>
        {application.submitted_resume_path && (
          <span>
            {application.resume_snapshot_is_legacy ? 'Resume saved during upgrade' : 'Submitted resume'}:{' '}
            <a href={`/applications/${application.id}/resume`} target="_blank" rel="noopener noreferrer">{application.submitted_resume_name}</a>
          </span>
        )}
        {!application.submitted_resume_path && <span>Submitted resume unavailable</span>}
      </p>
      <details className={styles.history}>
        <summary>View history</summary>
        <ol aria-label="Status history">
          {application.history.map((entry, index) => (
            <li key={index}>
              <StatusBadge status={entry.status} />
              <time dateTime={entry.changed_at}>{formatDate(entry.changed_at)}</time>
            </li>
          ))}
        </ol>
      </details>
    </div>
  )
}

export default async function ApplicationsPage({ searchParams }: ApplicationsPageProps) {
  const supabase = await createClient()
  const { data: claims } = await supabase.auth.getClaims()
  const userId = claims?.claims.sub
  if (!userId) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', userId).single()
  if (profile?.role !== 'job_seeker') {
    return (
      <main>
        <header className={styles.header}>
          <div><h1>My applications</h1></div>
        </header>
        <section className={styles.card}>
          <h2>Not available for this account</h2>
          <p>Only job seekers can apply to jobs.</p>
        </section>
      </main>
    )
  }

  const params = await searchParams
  const statusParam = Array.isArray(params.status) ? params.status[0] : params.status
  const status = isApplicationStatus(statusParam) ? statusParam : null

  const applications = await getSeekerApplications(userId)
  const counts = Object.fromEntries(APPLICATION_STATUSES.map((s) => [s, applications.filter((a) => a.status === s).length]))
  const shown = status ? applications.filter((a) => a.status === status) : applications

  return (
    <main>
      <header className={styles.header}>
        <div>
          <h1>My applications</h1>
          <p>{applications.length === 1 ? '1 application' : `${applications.length} applications`}</p>
        </div>
        <Link className={styles.primary} href="/jobs">Browse jobs</Link>
      </header>

      {applications.length === 0 ? (
        <section className={styles.card}>
          <h2>No applications yet</h2>
          <p>Find a role in the <Link href="/jobs">job listings</Link> and apply to start tracking it here.</p>
        </section>
      ) : (
        <>
          <nav aria-label="Filter by status" className={styles.statusFilters}>
            <Link href="/applications" aria-current={status === null ? 'page' : undefined}>
              All ({applications.length})
            </Link>
            {APPLICATION_STATUSES.map((s) => (
              <Link
                key={s}
                href={`/applications?status=${encodeURIComponent(s)}`}
                aria-current={status === s ? 'page' : undefined}
              >
                {s} ({counts[s]})
              </Link>
            ))}
          </nav>

          {shown.length === 0 ? (
            <section className={styles.card}>
              <h2>No applications with status {status}</h2>
              <p><Link href="/applications">Show all applications</Link></p>
            </section>
          ) : (
            <ul className={styles.list}>
              {shown.map((application) => application.job ? (
                <JobCard key={application.id} job={application.job} details={<ApplicationDetails application={application} />}>
                  <WithdrawButton applicationId={application.id} jobId={application.job.id} jobTitle={application.job.title} />
                  <Link className={styles.primary} href={`/jobs/${application.job.id}`}>
                    View job
                    <span className={styles.arrow}>→</span>
                  </Link>
                </JobCard>
              ) : (
                <li key={application.id} className={styles.row}>
                  <h2 className={styles.rowTitle}>Job no longer available</h2>
                  <p className={styles.meta}>This job posting has been removed by the recruiter.</p>
                  <ApplicationDetails application={application} />
                  <div className={styles.actions}>
                    <WithdrawButton applicationId={application.id} jobId={null} jobTitle="this removed job" />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </main>
  )
}
