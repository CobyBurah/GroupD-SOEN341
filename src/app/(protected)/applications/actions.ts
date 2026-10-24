'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { isJobId } from '@/lib/job-posting'

export type WithdrawState = { message?: string }

// Deletes one of the signed-in seeker's applications. Its history is removed
// with it, and the seeker can apply to the job again afterwards.
export async function withdrawApplication(applicationId: string, jobId: string | null, _state: WithdrawState): Promise<WithdrawState> {
  if (!isJobId(applicationId)) return { message: 'Application not found.' }
  const supabase = await createClient()
  const { data: claims } = await supabase.auth.getClaims()
  const userId = claims?.claims.sub
  if (!userId) return { message: 'Sign in to manage your applications.' }
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', userId).single()
  if (profile?.role !== 'job_seeker') return { message: 'Only job seekers can withdraw applications.' }

  const { data, error } = await supabase.from('applications').delete()
    .eq('id', applicationId).eq('user_id', userId).select('id').maybeSingle()
  if (error) return { message: 'Could not withdraw your application. Please try again.' }
  if (!data) return { message: 'Application not found.' }

  revalidatePath('/applications')
  if (jobId && isJobId(jobId)) revalidatePath(`/jobs/${jobId}/apply`)
  return {}
}
