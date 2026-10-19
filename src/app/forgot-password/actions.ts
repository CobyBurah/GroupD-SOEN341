'use server'

import { headers } from 'next/headers'

import { createClient } from '@/lib/supabase/server'

export type ForgotPasswordState = {
  errors?: { email?: string }
  message?: string
  values?: { email: string }
}

// Same wording whether or not the account exists, so the form can't be used to probe for emails.
const SENT_MESSAGE = 'If an account exists for that email, a password reset link is on its way.'

export async function requestPasswordReset(
  _prevState: ForgotPasswordState,
  formData: FormData
): Promise<ForgotPasswordState> {
  const email = String(formData.get('email') ?? '').trim()
  const values = { email }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { errors: { email: 'Enter a valid email address.' }, values }
  }

  const headerList = await headers()
  const origin =
    process.env.NEXT_PUBLIC_SITE_URL ||
    headerList.get('origin') ||
    `${headerList.get('x-forwarded-proto') ?? 'http'}://${headerList.get('host')}`

  const supabase = await createClient()
  // The default Reset Password email verifies the link on Supabase's side, then returns to
  // /auth/callback with a code, which signs the user in and forwards them to /reset-password.
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/reset-password`,
  })

  if (error?.status === 429) {
    return { message: 'Too many reset requests. Please wait a few minutes and try again.', values }
  }

  return { message: SENT_MESSAGE }
}
