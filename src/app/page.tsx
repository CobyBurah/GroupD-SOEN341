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
          <h1>Find your next role, or your next hire</h1>
          <p className={styles.muted}>
            {claims ? `Signed in as ${claims.email}` : 'Browse opportunities, manage applications, and connect with recruiters.'}
          </p>
        </div>
      </header>
      {claims ? (
        <ul className={styles.list}>
          <li className={styles.row}>
            <h2 className={styles.rowTitle}>Dashboard</h2>
            <p className={styles.meta}>See your workspace at a glance.</p>
            <div className={styles.bottomRow}>
              <span />
              <Link className={styles.primary} href="/dashboard">Go to dashboard <span className={styles.arrow}>→</span></Link>
            </div>
          </li>
          <li className={styles.row}>
            <h2 className={styles.rowTitle}>Browse jobs</h2>
            <p className={styles.meta}>Explore the latest opportunities.</p>
            <div className={styles.bottomRow}>
              <span />
              <Link className={styles.primary} href="/jobs">View jobs <span className={styles.arrow}>→</span></Link>
            </div>
          </li>
          <li className={styles.row}>
            <h2 className={styles.rowTitle}>Your profile</h2>
            <p className={styles.meta}>Keep your details up to date.</p>
            <div className={styles.bottomRow}>
              <span />
              <Link className={styles.primary} href="/profile">Edit profile <span className={styles.arrow}>→</span></Link>
            </div>
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
