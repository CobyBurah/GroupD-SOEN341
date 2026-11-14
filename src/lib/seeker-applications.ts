// Read the signed-in job seeker's applications from the Supabase "applications" table.
// RLS only returns the current user's rows and history, and hides deleted jobs from seekers.

import { createClient } from '@/lib/supabase/server'
import type { Job } from '@/lib/jobs'
import type { ApplicationStatus } from '@/lib/applications'

export type ApplicationHistoryEntry = { status: ApplicationStatus; changed_at: string }

export type SeekerApplication = {
  id: string
  status: ApplicationStatus
  created_at: string
  // Null when the recruiter has removed the posting.
  job: Job | null
  submitted_resume_name: string | null
  submitted_resume_path: string | null
  resume_snapshot_is_legacy: boolean
  // Oldest first.
  history: ApplicationHistoryEntry[]
}

type ApplicationRow = Omit<SeekerApplication, 'job'> & { job: (Job & { deleted_at?: string | null }) | null }

// Only the current user's applied jobs on the visible listing page; no history is needed.
export async function getAppliedJobIds(userId: string, jobIds: string[]): Promise<Set<string>> {
  if (!userId || jobIds.length === 0) return new Set<string>()
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('applications')
    .select('job_id')
    .eq('user_id', userId)
    .in('job_id', jobIds)
  if (error) throw new Error('Could not load applied jobs: ' + error.message)
  return new Set((data ?? []).map((row) => row.job_id as string))
}

// Every application the user has submitted, most recent first.
export async function getSeekerApplications(userId: string): Promise<SeekerApplication[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('applications')
    .select('id, status, created_at, submitted_resume_name, submitted_resume_path, resume_snapshot_is_legacy, job:jobs(*), history:application_status_history(status, changed_at)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw new Error('Could not load applications: ' + error.message)
  // Unlike favourites, keep applications to removed jobs: the application still exists.
  return ((data ?? []) as unknown as ApplicationRow[]).map((row) => ({
    ...row,
    job: row.job && !row.job.deleted_at ? row.job : null,
    history: [...(row.history ?? [])].sort((a, b) => a.changed_at.localeCompare(b.changed_at)),
  }))
}
