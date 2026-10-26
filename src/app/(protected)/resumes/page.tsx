import { redirect } from 'next/navigation'

import { isRole } from '@/lib/profiles'
import { createClient } from '@/lib/supabase/server'
import styles from '@/app/ui.module.css'

import { ResumeRow, ResumeUploadForm } from './resume-forms'

export default async function ResumesPage() {
  const supabase = await createClient()
  const { data: claimsData } = await supabase.auth.getClaims()
  const userId = claimsData?.claims.sub

  if (!userId) {
    redirect('/login')
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', userId).single()
  const role = isRole(profile?.role) ? profile.role : 'job_seeker'

  if (role !== 'job_seeker') {
    return (
      <main>
        <header className={styles.header}>
          <div>
            <h1>Resumes</h1>
          </div>
        </header>
        <section className={styles.card}>
          <h2>Not available for this account</h2>
          <p>Only job seekers can manage resumes.</p>
        </section>
      </main>
    )
  }

  const { data: resumes } = await supabase
    .from('resumes')
    .select('id, file_name, size_bytes, created_at')
    .order('created_at', { ascending: false })

  return (
    <main>
      <header className={styles.header}>
        <div>
          <h1>Resumes</h1>
          <p>Upload the resumes you want to apply with, several at once. PDF or DOCX, up to 5 MB each.</p>
          <p>Replacing, renaming or deleting a resume here does not change resumes already submitted. Withdraw an application to remove access for that recruiter.</p>
        </div>
      </header>

      <section>
        <h2>Upload resumes</h2>
        <ResumeUploadForm />
      </section>

      {resumes && resumes.length > 0 ? (
        <>
          <p>{resumes.length} {resumes.length === 1 ? 'resume' : 'resumes'}</p>
          <ul className={styles.list}>
            {resumes.map((resume) => (
              <ResumeRow key={resume.id} resume={resume} />
            ))}
          </ul>
        </>
      ) : (
        <p className={styles.muted}>No resumes uploaded yet.</p>
      )}
    </main>
  )
}
