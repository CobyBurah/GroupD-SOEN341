'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'

export type ProfileState = {
  errors?: { fullName?: string }
  message?: string
  values?: { fullName: string }
}

export async function updateProfile(
  _prevState: ProfileState,
  formData: FormData
): Promise<ProfileState> {
  const fullName = String(formData.get('fullName') ?? '').trim()
  const values = { fullName }

  if (!fullName) {
    return { errors: { fullName: 'Enter your full name.' }, values }
  }

  const supabase = await createClient()
  const { data: claimsData } = await supabase.auth.getClaims()
  const userId = claimsData?.claims.sub

  if (!userId) {
    return { message: 'You must be signed in to update your profile.', values }
  }

  const { error } = await supabase
    .from('profiles')
    .update({ full_name: fullName, updated_at: new Date().toISOString() })
    .eq('id', userId)

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
