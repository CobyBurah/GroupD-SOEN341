'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { isRole } from '@/lib/profiles'
import { createClient } from '@/lib/supabase/server'

type SignupField = 'fullName' | 'email' | 'password' | 'confirmPassword' | 'role'

export type SignupState = {
  errors?: Partial<Record<SignupField, string>>
  message?: string
  // Echoed back so the form keeps what the user typed (React resets forms after an action).
  values?: { fullName: string; email: string; role: string }
}

export async function signup(_prevState: SignupState, formData: FormData): Promise<SignupState> {
  const fullName = String(formData.get('fullName') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  const confirmPassword = String(formData.get('confirmPassword') ?? '')
  const role = String(formData.get('role') ?? '')
  const values = { fullName, email, role }

  const errors: SignupState['errors'] = {}
  if (!fullName) errors.fullName = 'Enter your full name.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Enter a valid email address.'
  if (password.length < 8) errors.password = 'Password must be at least 8 characters.'
  if (password !== confirmPassword) errors.confirmPassword = 'Passwords do not match.'
  if (!isRole(role)) errors.role = 'Choose an account type.'

  if (Object.keys(errors).length > 0) {
    return { errors, values }
  }

  const supabase = await createClient()

  // full_name and role are copied into public.profiles by the on_auth_user_created trigger.
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName, role } },
  })

  if (error) {
    return { message: error.message, values }
  }

  // With "Confirm email" off in Supabase, signUp signs the user in right away.
  // No session means confirmation is still switched on in the dashboard.
  if (!data.session) {
    return { message: 'Account created. Check your email to confirm it before logging in.' }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}
