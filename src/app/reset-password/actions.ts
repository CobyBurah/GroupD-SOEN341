'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { validateNewPassword, type PasswordState } from '@/lib/passwords'
import { createClient } from '@/lib/supabase/server'

export async function resetPassword(
  _prevState: PasswordState,
  formData: FormData
): Promise<PasswordState> {
  const { password, errors, valid } = validateNewPassword(formData)

  if (!valid) {
    return { errors }
  }

  const supabase = await createClient()

  // The recovery link signed the user in via /auth/confirm; without that session there's nothing to update.
  const { data } = await supabase.auth.getClaims()
  if (!data?.claims) {
    return { message: 'Your reset link has expired. Request a new one to continue.' }
  }

  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    return { message: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}
