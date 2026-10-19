import Link from 'next/link'
import { requireRecruiter } from '@/lib/recruiter'
import { EMPLOYMENT_TYPES } from '@/lib/job-posting'
import type { Job } from '@/lib/jobs'
import styles from './recruiter.module.css'

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
      : <><p>{jobs.length} active {jobs.length === 1 ? 'posting' : 'postings'}</p><ul className={styles.list}>
        {jobs.map(job => <li key={job.id} className={styles.card}>
          <h2>{job.title}</h2><p>{job.company}{job.location ? ` · ${job.location}` : ''}</p>
          <p>{job.employment_type ? EMPLOYMENT_TYPES[job.employment_type as keyof typeof EMPLOYMENT_TYPES] ?? job.employment_type : 'Employment type not specified'}{job.category ? ` · ${job.category}` : ''}</p>
          <p className={styles.description}>{job.description.length > 220 ? `${job.description.slice(0, 220)}…` : job.description}</p>
          <div className={styles.actions}>
            <Link href={`/recruiter/jobs/${job.id}/edit`} aria-label={`Edit ${job.title}`}>Edit posting</Link>
            <Link href={`/recruiter/jobs/${job.id}/applications`} aria-label={`Applications for ${job.title}`}>View applications</Link>
            <Link href={`/recruiter/jobs/${job.id}/delete`} aria-label={`Delete ${job.title}`}>Delete posting</Link>
          </div>
        </li>)}
      </ul></>}
  </main>
}
