import Link from 'next/link'
import { requireRecruiter } from '@/lib/recruiter'
import type { Job } from '@/lib/jobs'
import { countApplicationsByJob, splitPostings } from '@/lib/recruiter-postings'
import styles from '@/app/ui.module.css'
import { JobCard } from '@/app/(protected)/jobs/jobs-card'
import { setJobArchived } from './actions'

const notices: Record<string, string> = {
  created: 'Posting published.',
  updated: 'Posting updated.',
  deleted: 'Posting deleted from active listings.',
  archived: 'Posting archived. It no longer appears in job search or accepts applications.',
  restored: 'Posting restored to active listings.',
}
const failures: Record<string, string> = {
  'archive-failed': 'Could not archive the posting. Please try again.',
  'restore-failed': 'Could not restore the posting. Please try again.',
}

function applicationsLabel(count: number) {
  return `${count} ${count === 1 ? 'application' : 'applications'}`
}

export default async function RecruiterPage({ searchParams }: { searchParams: Promise<{ notice?: string }> }) {
  const { supabase, userId } = await requireRecruiter()
  const { data, error } = await supabase.from('jobs').select('*').eq('recruiter_id', userId)
    .is('deleted_at', null).order('created_at', { ascending: false })
  const { notice } = await searchParams
  const { active, archived } = splitPostings((data ?? []) as Job[])
  const ids = [...active, ...archived].map(job => job.id)
  // Counts are a convenience: if they fail to load, the postings still show.
  const { data: applicationRows } = ids.length
    ? await supabase.from('applications').select('job_id').in('job_id', ids)
    : { data: [] }
  const counts = countApplicationsByJob(applicationRows ?? [])

  const actions = (job: Job, isArchived: boolean) => <>
    <Link className={styles.primary} href={`/recruiter/jobs/${job.id}/applications`} aria-label={`Applications for ${job.title}`}>
      View applications ({counts.get(job.id) ?? 0})
    </Link>
    {!isArchived && <Link className={styles.secondary} href={`/recruiter/jobs/${job.id}/edit`} aria-label={`Edit ${job.title}`}>Edit posting</Link>}
    <form action={setJobArchived.bind(null, job.id, !isArchived)}>
      <button className={styles.secondary} type="submit" aria-label={`${isArchived ? 'Restore' : 'Archive'} ${job.title}`}>
        {isArchived ? 'Restore posting' : 'Archive posting'}
      </button>
    </form>
    <Link className={styles.secondary} href={`/recruiter/jobs/${job.id}/delete`} aria-label={`Delete ${job.title}`}>Delete posting</Link>
  </>

  return <main>
    <header className={styles.header}>
      <div><h1>Your job postings</h1><p>Create opportunities and manage your current listings.</p></div>
      <Link className={styles.primary} href="/recruiter/jobs/new">Create posting</Link>
    </header>
    {notice && Object.hasOwn(notices, notice) && <p role="status" className={styles.notice}>{notices[notice]}</p>}
    {notice && Object.hasOwn(failures, notice) && <p role="alert" className={styles.notice}>{failures[notice]}</p>}
    {error ? <section role="alert" className={styles.card}><h2>Could not load postings</h2><p>Please try again. If this continues, ask your team to check the database setup.</p><Link href="/recruiter">Try again</Link></section>
      : <>
        <section className={styles.postingSection} aria-labelledby="active-postings">
          <h2 id="active-postings">Active postings</h2>
          {active.length === 0 ? archived.length === 0
            ? <div className={styles.card}><h2>No postings yet</h2><p>Publish your first job to make it available to job seekers.</p></div>
            : <div className={styles.card}><h2>No active postings</h2><p>Restore an archived posting or publish a new job.</p></div>
            : <><p className={styles.muted}>{active.length} active {active.length === 1 ? 'posting' : 'postings'}</p><ul className={styles.list}>
              {active.map(job => <JobCard key={job.id} job={job} href={`/recruiter/jobs/${job.id}/edit`}
                details={<p className={styles.meta}>{applicationsLabel(counts.get(job.id) ?? 0)} received</p>}>
                {actions(job, false)}
              </JobCard>)}
            </ul></>}
        </section>
        {archived.length > 0 && <section className={styles.postingSection} aria-labelledby="archived-postings">
          <h2 id="archived-postings">Archived postings</h2>
          <p className={styles.muted}>Archived postings are hidden from job seekers and closed to new applications. Their applications stay available.</p>
          <ul className={styles.list}>
            {archived.map(job => <JobCard key={job.id} job={job} href={`/recruiter/jobs/${job.id}/applications`}
              details={<p className={styles.meta}>Archived · {applicationsLabel(counts.get(job.id) ?? 0)} received</p>}>
              {actions(job, true)}
            </JobCard>)}
          </ul>
        </section>}
      </>}
  </main>
}
