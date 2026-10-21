'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { isJobId } from '@/lib/job-posting'

export type FavouriteState = { favourited: boolean; message?: string }

// Adds or removes one job from the signed-in seeker's favourites.
// `favourited` is the state the button showed when it was clicked.
export async function toggleFavourite(jobId: string, state: FavouriteState): Promise<FavouriteState> {
  if (!isJobId(jobId)) return { ...state, message: 'Job not found.' }
  const supabase = await createClient()
  const { data: claims } = await supabase.auth.getClaims()
  const userId = claims?.claims.sub
  if (!userId) return { ...state, message: 'Sign in to save favourites.' }
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', userId).single()
  if (profile?.role !== 'job_seeker') return { ...state, message: 'Only job seekers can save favourites.' }

  const { error } = state.favourited
    ? await supabase.from('favourites').delete().eq('user_id', userId).eq('job_id', jobId)
    : await supabase.from('favourites').insert({ user_id: userId, job_id: jobId })
  // 23505: already saved (e.g. from another tab), which is the state we wanted.
  if (error && error.code !== '23505') return { ...state, message: 'Could not update favourites. Please try again.' }

  revalidatePath('/jobs')
  revalidatePath('/favourites')
  return { favourited: !state.favourited }
}
