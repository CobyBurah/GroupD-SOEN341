import Link from 'next/link'

import styles from '../ui.module.css'

import { ForgotPasswordForm } from './forgot-password-form'

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { error } = await searchParams

  return (
    <main className={`${styles.card} ${styles.auth}`}>
      <h1>Forgot your password?</h1>
      {error === 'expired' && (
        <p role="alert">
          That reset link is invalid or has expired. Request a new one below, and open it in this
          same browser.
        </p>
      )}
      <p className={styles.muted}>
        Enter the email you signed up with and we&apos;ll send you a link to choose a new password.
      </p>
      <ForgotPasswordForm />
      <p>
        Remembered it? <Link href="/login">Back to log in</Link>
      </p>
    </main>
  )
}
