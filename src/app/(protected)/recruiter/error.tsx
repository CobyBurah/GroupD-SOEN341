'use client'
import styles from '@/app/ui.module.css'
export default function RecruiterError({ reset }: { reset: () => void }) {
  return <main className={`${styles.card} ${styles.auth}`}><h1>Unable to load this page</h1><p>Please try again in a moment.</p><button onClick={reset}>Try again</button></main>
}
