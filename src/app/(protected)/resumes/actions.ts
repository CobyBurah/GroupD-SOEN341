'use server'

import { randomUUID } from 'node:crypto'

import { revalidatePath } from 'next/cache'

import { RESUME_BUCKET, validateResume } from '@/lib/resumes'
import { createClient } from '@/lib/supabase/server'

export type UploadResumeState = {
  error?: string
  message?: string
  token?: string
}

export async function uploadResume(
  _prevState: UploadResumeState,
  formData: FormData
): Promise<UploadResumeState> {
  const file = formData.get('file')
  const uploaded = file instanceof File ? file : null
  const validation = await validateResume(uploaded)

  if (!validation.ok || !uploaded) {
    return { error: validation.ok ? 'Choose a file to upload.' : validation.error }
  }

  const supabase = await createClient()
  const { data: claimsData } = await supabase.auth.getClaims()
  const userId = claimsData?.claims.sub

  if (!userId) {
    return { error: 'You must be signed in to upload a resume.' }
  }

  const storagePath = `${userId}/${randomUUID()}.${validation.extension}`

  const { error: uploadError } = await supabase.storage
    .from(RESUME_BUCKET)
    .upload(storagePath, uploaded, { contentType: validation.mimeType })

  if (uploadError) {
    return { error: uploadError.message }
  }

  const { error: insertError } = await supabase.from('resumes').insert({
    user_id: userId,
    file_name: uploaded.name,
    storage_path: storagePath,
    mime_type: validation.mimeType,
    size_bytes: uploaded.size,
  })

  if (insertError) {
    await supabase.storage.from(RESUME_BUCKET).remove([storagePath])

    // 42501: Postgres insufficient_privilege, raised when the insert policy's
    // job_seeker check fails.
    if (insertError.code === '42501') {
      return { error: 'Only job seekers can upload resumes.' }
    }
    return { error: insertError.message }
  }

  revalidatePath('/resumes')
  revalidatePath('/profile')
  return { message: 'Resume uploaded.', token: randomUUID() }
}

export type ReplaceResumeState = {
  error?: string
  message?: string
  token?: string
}

export async function replaceResume(
  _prevState: ReplaceResumeState,
  formData: FormData
): Promise<ReplaceResumeState> {
  const resumeId = String(formData.get('resumeId') ?? '')
  const file = formData.get('file')

  if (!resumeId) {
    return { error: 'Missing resume id.' }
  }

  const uploaded = file instanceof File ? file : null
  const validation = await validateResume(uploaded)
  if (!validation.ok || !uploaded) {
    return { error: validation.ok ? 'Choose a file to upload.' : validation.error }
  }

  const supabase = await createClient()
  const { data: claimsData } = await supabase.auth.getClaims()
  const userId = claimsData?.claims.sub

  if (!userId) {
    return { error: 'You must be signed in to replace a resume.' }
  }

  const { data: existing, error: fetchError } = await supabase
    .from('resumes')
    .select('storage_path')
    .eq('id', resumeId)
    .single()

  if (fetchError || !existing) {
    return { error: 'Resume not found.' }
  }

  const newStoragePath = `${userId}/${randomUUID()}.${validation.extension}`

  const { error: uploadError } = await supabase.storage
    .from(RESUME_BUCKET)
    .upload(newStoragePath, uploaded, { contentType: validation.mimeType })

  if (uploadError) {
    return { error: uploadError.message }
  }

  const { error: updateError } = await supabase
    .from('resumes')
    .update({
      file_name: uploaded.name,
      storage_path: newStoragePath,
      mime_type: validation.mimeType,
      size_bytes: uploaded.size,
      updated_at: new Date().toISOString(),
    })
    .eq('id', resumeId)

  if (updateError) {
    await supabase.storage.from(RESUME_BUCKET).remove([newStoragePath])

    if (updateError.code === '42501') {
      return { error: 'Only job seekers can replace resumes.' }
    }
    return { error: updateError.message }
  }

  await supabase.storage.from(RESUME_BUCKET).remove([existing.storage_path])

  revalidatePath('/resumes')
  revalidatePath('/profile')
  return { message: 'Resume replaced.', token: randomUUID() }
}

export type DeleteResumeState = {
  error?: string
}

export async function deleteResume(
  _prevState: DeleteResumeState,
  formData: FormData
): Promise<DeleteResumeState> {
  const resumeId = String(formData.get('resumeId') ?? '')

  if (!resumeId) {
    return { error: 'Missing resume id.' }
  }

  const supabase = await createClient()

  const { data: deleted, error } = await supabase
    .from('resumes')
    .delete()
    .eq('id', resumeId)
    .select('storage_path')
    .single()

  if (error || !deleted) {
    return { error: error?.message ?? 'Resume not found.' }
  }

  await supabase.storage.from(RESUME_BUCKET).remove([deleted.storage_path])

  revalidatePath('/resumes')
  revalidatePath('/profile')
  return {}
}
