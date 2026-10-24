'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { recruiterSession } from '@/lib/recruiter'
import { isJobId, validateJob, type JobValues, type JobErrors } from '@/lib/job-posting'
import { isApplicationStatus, type ApplicationStatus } from '@/lib/applications'

export type JobState = { values?: JobValues; errors?: JobErrors; message?: string }
export type DeleteState = { message?: string }

function invalidateJobs(id?: string) {
  revalidatePath('/recruiter')
  revalidatePath('/jobs')
  if (id) {
    revalidatePath(`/recruiter/jobs/${id}/edit`)
    revalidatePath(`/jobs/${id}`)
  }
}

export async function saveJob(id: string | null, _state: JobState, formData: FormData): Promise<JobState> {
  const session = await recruiterSession()
  if (!session.ok) return { message: session.message }
  const { values, errors, valid } = validateJob(formData)
  if (!valid) return { values, errors, message: 'Check the highlighted fields.' }
  if (id !== null && !isJobId(id)) return { values, message: 'Posting not found or unavailable.' }
  // Whitelist editable fields. Ownership always comes from the verified session.
  const fields = {
  ...values,
  location: values.location || null,
  location_city: values.location_city || null,
  location_region: values.location_region || null,
  location_country: values.location_country || null,
  category: values.category || null,
  employment_type: values.employment_type || null,
  workplace_type: values.workplace_type || null,
  salary: values.salary || null,
  }
  let saved
  try {
    saved = id === null
      ? await session.supabase.from('jobs').insert({ ...fields, recruiter_id: session.userId }).select('id').single()
      : await session.supabase.from('jobs').update(fields).eq('id', id)
          .eq('recruiter_id', session.userId).is('deleted_at', null).select('id').maybeSingle()
  } catch {
    return { values, message: 'Could not save the posting. Check your connection and try again.' }
  }
  if (saved.error) return { values, message: 'Could not save the posting. Please try again.' }
  if (!saved.data) return { values, message: 'Posting not found or unavailable.' }
  invalidateJobs(saved.data.id)
  redirect(`/recruiter?notice=${id === null ? 'created' : 'updated'}`)
}

export async function deleteJob(id: string, _state: DeleteState, formData: FormData): Promise<DeleteState> {
  const session = await recruiterSession()
  if (!session.ok) return { message: session.message }
  if (!isJobId(id)) return { message: 'Posting not found or unavailable.' }
  if (formData.get('confirmDelete') !== 'on') return { message: 'Confirm deletion before continuing.' }
  let result
  try {
    result = await session.supabase.from('jobs').update({ deleted_at: new Date().toISOString() })
      .eq('id', id).eq('recruiter_id', session.userId).is('deleted_at', null).select('id').maybeSingle()
  } catch {
    return { message: 'Could not delete the posting. Check your connection and try again.' }
  }
  if (result.error) return { message: 'Could not delete the posting. Please try again.' }
  if (!result.data) return { message: 'Posting not found or unavailable.' }
  invalidateJobs(id)
  redirect('/recruiter?notice=deleted')
}

export type StatusState = { status?: ApplicationStatus; message?: string; saved?: boolean }

export async function updateApplicationStatus(jobId: string, applicationId: string, _state: StatusState, formData: FormData): Promise<StatusState> {
  const session = await recruiterSession()
  if (!session.ok) return { message: session.message }
  const status = formData.get('status')
  if (!isJobId(jobId) || !isJobId(applicationId)) return { message: 'Application not found or unavailable.' }
  if (!isApplicationStatus(status)) return { message: 'Choose a valid status.' }
  let result
  try {
    // RLS limits this to applications on the recruiter's own postings; the job filter
    // keeps a forged application id from another posting from matching.
    result = await session.supabase.from('applications').update({ status })
      .eq('id', applicationId).eq('job_id', jobId).select('status').maybeSingle()
  } catch {
    return { message: 'Could not update the status. Check your connection and try again.' }
  }
  if (result.error) return { message: 'Could not update the status. Please try again.' }
  if (!result.data) return { message: 'Application not found or unavailable.' }
  revalidatePath(`/recruiter/jobs/${jobId}/applications`)
  revalidatePath('/applications')
  return { status: result.data.status, saved: true }
}
