import Link from 'next/link'
import { ownedJob, requireRecruiter } from '@/lib/recruiter'
import { isApplicationStatus } from '@/lib/applications'
import styles from '@/app/ui.module.css'
import { StatusForm } from './status-form'

type Application = { id: string; user_id: string; resume_id: string | null; status: string; created_at: string }
type Applicant = { id: string; full_name: string; headline: string; location: string }
type Resume = { id: string; file_name: string }

export default async function ApplicationsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const job = await ownedJob(id)
  const { supabase } = await requireRecruiter()
  const { data, error } = await supabase.from('applications').select('id, user_id, resume_id, status, created_at')
    .eq('job_id', job.id).order('created_at', { ascending: false })
  const applications = (data ?? []) as Application[]
  // applications.user_id references auth.users, so profiles and resumes can't be embedded.
  const userIds = applications.map(a => a.user_id)
  const resumeIds = applications.flatMap(a => a.resume_id ? [a.resume_id] : [])
  const [profiles, resumes] = await Promise.all([
    userIds.length ? supabase.from('profiles').select('id, full_name, headline, location').in('id', userIds) : { data: [] },
    resumeIds.length ? supabase.from('resumes').select('id, file_name').in('id', resumeIds) : { data: [] },
  ])
  const applicants = new Map(((profiles.data ?? []) as Applicant[]).map(p => [p.id, p]))
  const resumeNames = new Map(((resumes.data ?? []) as Resume[]).map(r => [r.id, r.file_name]))
  return <main>
    <header className={styles.header}>
      <div><h1>Applications for {job.title}</h1><p>{job.company}</p></div>
    </header>
    {error ? <section role="alert" className={styles.card}><h2>Could not load applications</h2><p>Please try again.</p></section>
      : applications.length === 0 ? <section className={styles.card}><h2>No applications yet</h2><p>Applications from job seekers will appear here.</p></section>
      : <><p className={styles.muted}>{applications.length} {applications.length === 1 ? 'application' : 'applications'}</p><ul className={styles.list}>
        {applications.map(application => {
          const applicant = applicants.get(application.user_id)
          const name = applicant?.full_name || 'Unnamed applicant'
          const resumeName = application.resume_id && resumeNames.get(application.resume_id)
          return <li key={application.id} className={styles.row}>
            <h2 className={styles.rowTitle}>{name}</h2>
            {applicant?.headline && <p>{applicant.headline}</p>}
            <p className={styles.meta}>
              {applicant?.location && <span>{applicant.location} ·</span>}
              <span>Applied {new Date(application.created_at).toLocaleDateString('en-CA', { dateStyle: 'medium' })}</span>
            </p>
            <p>{resumeName
              ? <a href={`/resumes/${application.resume_id}/view`} target="_blank" rel="noopener noreferrer">View resume: {resumeName}</a>
              : <span className={styles.muted}>Resume no longer available</span>}</p>
            <StatusForm jobId={job.id} applicationId={application.id} applicant={name}
              status={isApplicationStatus(application.status) ? application.status : 'Applied'} />
          </li>
        })}
      </ul></>}
    <p><Link href="/recruiter">Back to your postings</Link></p>
  </main>
}
