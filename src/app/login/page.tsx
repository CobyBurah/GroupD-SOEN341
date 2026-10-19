import Link from 'next/link'

import styles from '../ui.module.css'

import { login } from './actions'

export default function LoginPage() {
  return (
    <main className={`${styles.card} ${styles.auth}`}>
      <p className={styles.eyebrow}>Welcome back</p>
      <h1>Log in</h1>
      <form className={styles.form}>
        <div>
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" autoComplete="email" required />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" autoComplete="current-password" required />
        </div>
        <button formAction={login}>Log in</button>
      </form>
      <p>
        <Link href="/forgot-password">Forgot your password?</Link>
      </p>
      <p>
        Don&apos;t have an account? <Link href="/signup">Sign up</Link>
      </p>
    </main>
  )
}
