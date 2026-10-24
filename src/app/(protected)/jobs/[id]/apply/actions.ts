'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { isJobId } from '@/lib/job-posting'

export async function submitApplication(jobId: string, _state: { error?: string; success?: boolean }, formData: FormData): Promise<{ error?: string; success?: boolean }> {
  const resumeId = formData.get('resumeId')
  if (!isJobId(jobId) || typeof resumeId !== 'string' || !isJobId(resumeId)) {
    return { error: 'Choose a resume to submit.' }
  }
  const supabase = await createClient()
  const { data: claims } = await supabase.auth.getClaims()
  const userId = claims?.claims.sub
  if (!userId) return { error: 'Sign in to apply.' }
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', userId).single()
  if (profile?.role !== 'job_seeker') return { error: 'Only job seekers can apply.' }
  const { error } = await supabase.from('applications').insert({ job_id: jobId, user_id: userId, resume_id: resumeId })
  if (error?.code === '23505') return { success: true }
  if (error) return { error: 'Could not submit your application. Please try again later.' }
  revalidatePath(`/jobs/${jobId}/apply`)
  revalidatePath('/applications')
  return { success: true }
}
