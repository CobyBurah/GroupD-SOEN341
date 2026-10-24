import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import styles from '@/app/ui.module.css'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  if (!data?.claims.sub) redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.claims.sub).single()
  if (profile?.role === 'recruiter') redirect('/recruiter')
  return <main>
    <header className={styles.header}>
      <div><h1>Your dashboard</h1><p>Explore job opportunities and keep your professional profile up to date.</p></div>
      <Link className={styles.primary} href="/jobs">Browse jobs</Link>
    </header>
    <ul className={styles.list}>
      <li className={styles.row}>
        <h2 className={styles.rowTitle}>Browse jobs</h2>
        <p className={styles.meta}>See the latest postings from recruiters.</p>
        <div className={styles.bottomRow}>
          <span />
          <Link className={styles.primary} href="/jobs">View open roles <span className={styles.arrow}>→</span></Link>
        </div>
      </li>
      <li className={styles.row}>
        <h2 className={styles.rowTitle}>My applications</h2>
        <p className={styles.meta}>Track the status and history of every job you have applied to.</p>
        <div className={styles.bottomRow}>
          <span />
          <Link className={styles.primary} href="/applications">View applications <span className={styles.arrow}>→</span></Link>
        </div>
      </li>
      <li className={styles.row}>
        <h2 className={styles.rowTitle}>Favourites</h2>
        <p className={styles.meta}>Revisit the jobs you saved while browsing.</p>
        <div className={styles.bottomRow}>
          <span />
          <Link className={styles.primary} href="/favourites">View favourites <span className={styles.arrow}>→</span></Link>
        </div>
      </li>
      <li className={styles.row}>
        <h2 className={styles.rowTitle}>Your profile</h2>
        <p className={styles.meta}>Update your headline, location and bio.</p>
        <div className={styles.bottomRow}>
          <span />
          <Link className={styles.primary} href="/profile">Your profile <span className={styles.arrow}>→</span></Link>
        </div>
      </li>
      <li className={styles.row}>
        <h2 className={styles.rowTitle}>Resumes</h2>
        <p className={styles.meta}>Upload and manage the resumes you apply with.</p>
        <div className={styles.bottomRow}>
          <span />
          <Link className={styles.primary} href="/resumes">Manage resumes <span className={styles.arrow}>→</span></Link>
        </div>
      </li>
    </ul>
  </main>
}
