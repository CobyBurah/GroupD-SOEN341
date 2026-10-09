'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { PROFILE_LIMITS } from '@/lib/profiles'
import { RESUME_BUCKET } from '@/lib/resumes'
import { createClient } from '@/lib/supabase/server'

export type ProfileState = {
  errors?: { fullName?: string; headline?: string; location?: string; bio?: string }
  message?: string
  values?: { fullName: string; headline: string; location: string; bio: string }
}

export async function updateProfile(
  _prevState: ProfileState,
  formData: FormData
): Promise<ProfileState> {
  const fullName = String(formData.get('fullName') ?? '').trim()
  const headline = String(formData.get('headline') ?? '').trim()
  const location = String(formData.get('location') ?? '').trim()
  const bio = String(formData.get('bio') ?? '').trim()
  const values = { fullName, headline, location, bio }

  const errors: ProfileState['errors'] = {}
  if (!fullName) errors.fullName = 'Enter your full name.'
  if (headline.length > PROFILE_LIMITS.headline) {
    errors.headline = `Headline must be ${PROFILE_LIMITS.headline} characters or fewer.`
  }
  if (location.length > PROFILE_LIMITS.location) {
    errors.location = `Location must be ${PROFILE_LIMITS.location} characters or fewer.`
  }
  if (bio.length > PROFILE_LIMITS.bio) {
    errors.bio = `Bio must be ${PROFILE_LIMITS.bio} characters or fewer.`
  }

  if (Object.keys(errors).length > 0) {
    return { errors, values }
  }

  const supabase = await createClient()
  const { data: claimsData } = await supabase.auth.getClaims()
  const userId = claimsData?.claims.sub

  if (!userId) {
    return { message: 'You must be signed in to update your profile.', values }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()

  // Headline/location/bio are job-seeker fields. Leave them out of the update
  // for recruiters so a submit never clobbers columns their form doesn't show.
  const update: Record<string, string> = { full_name: fullName, updated_at: new Date().toISOString() }
  if (profile?.role === 'job_seeker') {
    update.headline = headline
    update.location = location
    update.bio = bio
  }

  // The on_profile_name_updated trigger copies full_name into auth.users user_metadata.
  const { error } = await supabase.from('profiles').update(update).eq('id', userId)

  if (error) {
    return { message: error.message, values }
  }

  revalidatePath('/profile')
  return { message: 'Profile updated.', values }
}

export type PasswordState = {
  errors?: { password?: string; confirmPassword?: string }
  message?: string
}

export async function updatePassword(
  _prevState: PasswordState,
  formData: FormData
): Promise<PasswordState> {
  const password = String(formData.get('password') ?? '')
  const confirmPassword = String(formData.get('confirmPassword') ?? '')

  const errors: PasswordState['errors'] = {}
  if (password.length < 8) errors.password = 'Password must be at least 8 characters.'
  if (password !== confirmPassword) errors.confirmPassword = 'Passwords do not match.'

  if (Object.keys(errors).length > 0) {
    return { errors }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    return { message: error.message }
  }

  return { message: 'Password updated.' }
}

export type EmailState = {
  errors?: { email?: string }
  message?: string
  values?: { email: string }
}

export async function updateEmail(
  _prevState: EmailState,
  formData: FormData
): Promise<EmailState> {
  const email = String(formData.get('email') ?? '').trim()
  const values = { email }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { errors: { email: 'Enter a valid email address.' }, values }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ email })

  if (error) {
    return { message: error.message, values }
  }

  return {
    message: 'Confirmation links sent. Your email changes once you confirm from your inbox.',
    values,
  }
}

export type DeleteAccountState = {
  message?: string
}

export async function deleteAccount(
  _prevState: DeleteAccountState,
  formData: FormData
): Promise<DeleteAccountState> {
  if (formData.get('confirmDelete') !== 'on') {
    return { message: 'Confirm that you understand this action is permanent.' }
  }

  const supabase = await createClient()
  const { data: claimsData } = await supabase.auth.getClaims()
  const userId = claimsData?.claims.sub

  // The cascade on auth.users deletes the resumes rows but not the files in
  // storage, so remove those first while the session can still access them.
  if (userId) {
    const { data: files } = await supabase.storage.from(RESUME_BUCKET).list(userId)
    if (files && files.length > 0) {
      await supabase.storage.from(RESUME_BUCKET).remove(files.map((file) => `${userId}/${file.name}`))
    }
  }

  const { error } = await supabase.rpc('delete_own_account')

  if (error) {
    // 42883: Postgres undefined_function. PGRST202: PostgREST can't find the
    // function in its schema cache. Either means the migration adding
    // delete_own_account() hasn't been applied to this Supabase project yet.
    if (error.code === '42883' || error.code === 'PGRST202') {
      return {
        message:
          'Account deletion is not set up on the server yet (missing database function). Contact an admin.',
      }
    }
    return { message: error.message }
  }

  await supabase.auth.signOut()
  redirect('/')
}
