// Read the signed-in job seeker's favourites from the Supabase "favourites" table.
// RLS only returns the current user's rows, and hides deleted jobs from seekers.

import { createClient } from '@/lib/supabase/server'
import type { Job } from '@/lib/jobs'

// Ids of every job the user has saved, used to fill in the heart buttons.
export async function getFavouriteJobIds(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase.from('favourites').select('job_id').eq('user_id', userId)
  if (error) throw new Error('Could not load favourites: ' + error.message)
  return new Set((data ?? []).map((row) => row.job_id as string))
}

// The saved jobs themselves, most recently saved first.
export async function getFavouriteJobs(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('favourites')
    .select('created_at, job:jobs(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw new Error('Could not load favourites: ' + error.message)
  // A job removed by its recruiter comes back as null, so leave it out.
  return (data ?? [])
    .map((row) => row.job as unknown as (Job & { deleted_at: string | null }) | null)
    .filter((job): job is Job & { deleted_at: string | null } => job !== null && !job.deleted_at)
}
