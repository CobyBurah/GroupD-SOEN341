import Link from 'next/link'

import { createClient } from '@/lib/supabase/server'

import styles from '../ui.module.css'

import { ResetPasswordForm } from './reset-password-form'

// Reached from the recovery email via /auth/confirm, which signs the user in first.
// Kept outside (protected) so a stale link gets an explanation instead of a bounce to /login.
export default async function ResetPasswordPage() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()

  if (!data?.claims) {
    return (
      <main className={`${styles.card} ${styles.auth}`}>
        <h1>Reset link expired</h1>
        <p className={styles.muted}>
          This password reset link is invalid or has already been used. Request a new one to continue.
        </p>
        <div className={styles.actions}>
          <Link href="/forgot-password" className={styles.primary}>Request a new link</Link>
          <Link href="/login">Back to log in</Link>
        </div>
      </main>
    )
  }

  return (
    <main className={`${styles.card} ${styles.auth}`}>
      <p className={styles.eyebrow}>Account recovery</p>
      <h1>Choose a new password</h1>
      <ResetPasswordForm />
    </main>
  )
}
