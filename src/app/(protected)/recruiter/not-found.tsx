import Link from 'next/link'
import styles from '@/app/ui.module.css'
export default function PostingNotFound() {
  return <main className={`${styles.card} ${styles.auth}`}><h1>Posting unavailable</h1><p>This posting was removed or does not belong to your account.</p><Link className={styles.primary} href="/recruiter">Back to your postings</Link></main>
}
