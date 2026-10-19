import Link from 'next/link'

import { createClient } from '@/lib/supabase/server'

import styles from './ui.module.css'

export default async function Home() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const claims = data?.claims

  return (
    <main>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>CareerConnect</p>
          <h1>Find your next role, or your next hire</h1>
          <p className={styles.muted}>
            {claims ? `Signed in as ${claims.email}` : 'Browse opportunities, manage applications, and connect with recruiters.'}
          </p>
        </div>
      </header>
      {claims ? (
        <ul className={`${styles.list} ${styles.grid}`}>
          <li className={styles.card}>
            <h2>Dashboard</h2>
            <p>See your workspace at a glance.</p>
            <Link href="/dashboard">Go to dashboard</Link>
          </li>
          <li className={styles.card}>
            <h2>Browse jobs</h2>
            <p>Explore the latest opportunities.</p>
            <Link href="/jobs">View jobs</Link>
          </li>
          <li className={styles.card}>
            <h2>Your profile</h2>
            <p>Keep your details up to date.</p>
            <Link href="/profile">Edit profile</Link>
          </li>
        </ul>
      ) : (
        <div className={styles.actions}>
          <Link href="/signup" className={styles.primary}>Create an account</Link>
          <Link href="/login" className={styles.secondary}>Log in</Link>
        </div>
      )}
    </main>
  )
}
