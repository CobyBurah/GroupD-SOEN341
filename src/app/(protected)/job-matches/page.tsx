import Link from 'next/link'
import { redirect } from 'next/navigation'

import { isRole } from '@/lib/profiles'
import { createClient } from '@/lib/supabase/server'
import styles from '@/app/ui.module.css'

import { JobMatchesPanel } from './job-matches-panel'

// US-21: AI job matching. The seeker picks a resume and the local model ranks
// open postings against it and their profile.
export default async function JobMatchesPage() {
  const supabase = await createClient()
  const { data: claimsData } = await supabase.auth.getClaims()
  const userId = claimsData?.claims.sub
  if (!userId) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role, headline, bio').eq('id', userId).single()
  const role = isRole(profile?.role) ? profile.role : 'job_seeker'

  if (role !== 'job_seeker') {
    return (
      <main>
        <header className={styles.header}><div><h1>AI job matches</h1></div></header>
        <section className={styles.card}>
          <h2>Not available for this account</h2>
          <p>Only job seekers can get job matches.</p>
        </section>
      </main>
    )
  }

  const { data: resumes } = await supabase.from('resumes').select('id, file_name')
    .eq('user_id', userId).order('created_at', { ascending: false })
  const profileIncomplete = !profile?.headline && !profile?.bio

  return (
    <main>
      <header className={styles.header}>
        <div>
          <h1>AI job matches</h1>
          <p>Pick a resume and the AI suggests open postings that fit it, with the reasons and the skills you may be missing.</p>
        </div>
      </header>

      {profileIncomplete && (
        <p className={styles.notice} role="status">
          Tip: add a headline and bio to <Link href="/profile">your profile</Link> for better matches.
        </p>
      )}

      {resumes && resumes.length > 0
        ? <JobMatchesPanel resumes={resumes} />
        : <section className={styles.card}>
            <h2>Upload a resume first</h2>
            <p>Matching reads one of your resumes. <Link href="/resumes">Manage resumes</Link></p>
          </section>}

      <p className={styles.muted}>
        Your resume text and profile are sent only to the AI model running on the CareerConnect server for this request.
        Matches are not saved and recruiters never see them.
      </p>
    </main>
  )
}
