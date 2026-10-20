import Link from 'next/link'

import styles from '../ui.module.css'

export default function ErrorPage() {
  return (
    <main className={`${styles.card} ${styles.auth}`}>
      <h1>Sorry, something went wrong</h1>
      <p className={styles.muted}>Please check your details and try again.</p>
      <div className={styles.actions}>
        <Link href="/login" className={styles.primary}>Back to log in</Link>
      </div>
    </main>
  )
}
