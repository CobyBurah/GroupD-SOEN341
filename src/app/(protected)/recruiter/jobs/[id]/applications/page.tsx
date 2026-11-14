import Link from 'next/link'
import { ownedJob, requireRecruiter } from '@/lib/recruiter'
import { isApplicationStatus } from '@/lib/applications'
import { filterApplications, hasActiveFilters, parseApplicationFilters, type ApplicationFilterParams } from '@/lib/application-filters'
import styles from '@/app/ui.module.css'
import { StatusForm } from './status-form'
import { ApplicationFilterForm } from './application-filters'

type Application = { id: string; user_id: string; submitted_resume_name: string | null; submitted_resume_path: string | null; resume_snapshot_is_legacy: boolean; status: string; created_at: string }
type Applicant = { id: string; full_name: string; headline: string; location: string }

export default async function ApplicationsPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<ApplicationFilterParams> }) {
  const { id } = await params
  // Read the filters from the URL (?status=...&from=...&to=...)
  const filters = parseApplicationFilters(await searchParams)
  const filtering = hasActiveFilters(filters)
  const job = await ownedJob(id)
  const { supabase } = await requireRecruiter()
  const { data, error } = await supabase.from('applications').select('id, user_id, submitted_resume_name, submitted_resume_path, resume_snapshot_is_legacy, status, created_at')
    .eq('job_id', job.id).order('created_at', { ascending: false })
  // All applications for THIS job only, then the ones that match the filters
  const allApplications = (data ?? []) as Application[]
  const applications = filterApplications(allApplications, filters)

  // Text above the list, like "3 applications" or "Showing 1 of 3 applications"
  const word = allApplications.length === 1 ? 'application' : 'applications'
  let countText = `${allApplications.length} ${word}`
  if (filtering) {
    countText = `Showing ${applications.length} of ${allApplications.length} ${word}`
  }
  // applications.user_id references auth.users, so profiles can't be embedded.
  const userIds = applications.map(a => a.user_id)
  const profiles = userIds.length
    ? await supabase.from('profiles').select('id, full_name, headline, location').in('id', userIds)
    : { data: [] }
  const applicants = new Map(((profiles.data ?? []) as Applicant[]).map(p => [p.id, p]))
  return <main>
    <header className={styles.header}>
      <div><h1>Applications for {job.title}</h1><p>{job.company}</p></div>
    </header>
    {error ? <section role="alert" className={styles.card}><h2>Could not load applications</h2><p>Please try again.</p></section>
      : allApplications.length === 0 ? <section className={styles.card}><h2>No applications yet</h2><p>Applications from job seekers will appear here.</p></section>
      : <>
      <ApplicationFilterForm jobId={job.id} filters={filters} active={filtering} />
      {applications.length === 0 ? <section role="status" className={styles.card}>
        <h2>No applications match these filters</h2>
        <p>Try a different status or date range, or <Link href={`/recruiter/jobs/${job.id}/applications`}>show all applications</Link>.</p>
      </section>
      : <><p className={styles.muted}>{countText}</p><ul className={styles.list}>
        {applications.map(application => {
          const applicant = applicants.get(application.user_id)
          const name = applicant?.full_name || 'Unnamed applicant'
          return <li key={application.id} className={styles.row}>
            <h2 className={styles.rowTitle}>{name}</h2>
            {applicant?.headline && <p>{applicant.headline}</p>}
            <p className={styles.meta}>
              {applicant?.location && <span>{applicant.location} ·</span>}
                <span>Applied {new Date(application.created_at).toLocaleDateString('en-CA', { dateStyle: 'medium', timeZone: 'UTC' })}</span>
            </p>
            <p>{application.submitted_resume_path
              ? <a href={`/applications/${application.id}/resume`} target="_blank" rel="noopener noreferrer">View submitted resume: {application.submitted_resume_name}</a>
              : <span className={styles.muted}>Submitted resume unavailable</span>}</p>
            {application.submitted_resume_path && application.resume_snapshot_is_legacy && (
              <p className={styles.muted}>Resume saved during upgrade; the original submitted version could not be verified.</p>
            )}
            <StatusForm jobId={job.id} applicationId={application.id} applicant={name}
              status={isApplicationStatus(application.status) ? application.status : 'Applied'} />
          </li>
        })}
      </ul></>}</>}
    <p><Link href="/recruiter">Back to your postings</Link></p>
  </main>
}
