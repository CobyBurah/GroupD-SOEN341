import { redirect } from 'next/navigation'

import { isRole } from '@/lib/profiles'
import { createClient } from '@/lib/supabase/server'

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
        <h1>Resumes</h1>
        <p>Only job seekers can manage resumes.</p>
      </main>
    )
  }

  const { data: resumes } = await supabase
    .from('resumes')
    .select('id, file_name, size_bytes, created_at')
    .order('created_at', { ascending: false })

  return (
    <main>
      <h1>Resumes</h1>

      <ResumeUploadForm />

      <ul>
        {(resumes ?? []).map((resume) => (
          <ResumeRow key={resume.id} resume={resume} />
        ))}
      </ul>
    </main>
  )
}
