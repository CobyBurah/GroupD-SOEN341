import Link from 'next/link'
import { requireRecruiter } from '@/lib/recruiter'
import type { Job } from '@/lib/jobs'
import styles from '@/app/ui.module.css'
import { JobCard } from '@/app/(protected)/jobs/jobs-card'

const notices: Record<string, string> = { created: 'Posting published.', updated: 'Posting updated.', deleted: 'Posting deleted from active listings.' }

export default async function RecruiterPage({ searchParams }: { searchParams: Promise<{ notice?: string }> }) {
  const { supabase, userId } = await requireRecruiter()
  const { data, error } = await supabase.from('jobs').select('*').eq('recruiter_id', userId)
    .is('deleted_at', null).order('created_at', { ascending: false })
  const { notice } = await searchParams
  const jobs = (data ?? []) as Job[]
  return <main>
    <header className={styles.header}>
      <div><p className={styles.eyebrow}>Recruiter workspace</p><h1>Your job postings</h1><p>Create opportunities and manage your current listings.</p></div>
      <Link className={styles.primary} href="/recruiter/jobs/new">Create posting</Link>
    </header>
    {notice && Object.hasOwn(notices, notice) && <p role="status" className={styles.notice}>{notices[notice]}</p>}
    {error ? <section role="alert" className={styles.card}><h2>Could not load postings</h2><p>Please try again. If this continues, ask your team to check the database setup.</p><Link href="/recruiter">Try again</Link></section>
      : jobs.length === 0 ? <section className={styles.card}><h2>No postings yet</h2><p>Publish your first job to make it available to job seekers.</p></section>
      : <><p className={styles.muted}>{jobs.length} active {jobs.length === 1 ? 'posting' : 'postings'}</p><ul className={styles.list}>
        {jobs.map(job => <JobCard key={job.id} job={job} href={`/recruiter/jobs/${job.id}/edit`}>
          <Link className={styles.primary} href={`/recruiter/jobs/${job.id}/edit`} aria-label={`Edit ${job.title}`}>Edit posting</Link>
          <Link className={styles.secondary} href={`/recruiter/jobs/${job.id}/applications`} aria-label={`Applications for ${job.title}`}>View applications</Link>
          <Link className={styles.secondary} href={`/recruiter/jobs/${job.id}/delete`} aria-label={`Delete ${job.title}`}>Delete posting</Link>
        </JobCard>)}
      </ul></>}
  </main>
}
