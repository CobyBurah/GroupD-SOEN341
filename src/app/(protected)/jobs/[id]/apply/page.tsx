import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { getJob } from '@/lib/jobs'
import { createClient } from '@/lib/supabase/server'
import { ApplicationForm } from './application-form'
import styles from '@/app/ui.module.css'

export default async function ApplyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const job = await getJob(id)
  if (!job) notFound()
  const supabase = await createClient()
  const { data: claims } = await supabase.auth.getClaims()
  const userId = claims?.claims.sub
  if (!userId) redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', userId).single()
  if (profile?.role !== 'job_seeker') return <main><h1>Only job seekers can apply</h1><Link href="/jobs">Back to jobs</Link></main>
  const { data: existing, error: applicationError } = await supabase.from('applications').select('status').eq('job_id', id).eq('user_id', userId).maybeSingle()
  const { data: resumes, error: resumeError } = await supabase.from('resumes').select('id, file_name').eq('user_id', userId).order('created_at', { ascending: false })
  return <main>
    <Link href="/jobs">Back to jobs</Link>
    <header className={styles.header}><div><h1>Apply for {job.title}</h1><p>{job.company}{job.location ? ` · ${job.location}` : ''}</p></div></header>
    <p className={styles.description}>{job.description}</p>
    <section><h2>Your application</h2>
      {existing ? <p className={styles.notice} role="status">You have applied for this job. Status: {existing.status}. <Link href="/applications">View my applications</Link></p>
        : applicationError || resumeError ? <p role="alert">Applications are temporarily unavailable. Please try again later.</p>
        : resumes?.length ? <ApplicationForm jobId={id} resumes={resumes} />
        : <p>Upload a resume before applying. <Link href="/resumes">Manage resumes</Link></p>}
    </section>
  </main>
}
