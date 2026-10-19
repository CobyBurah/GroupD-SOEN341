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
      <div><p className={styles.eyebrow}>Job Seeker workspace</p><h1>Your dashboard</h1><p>Explore job opportunities and keep your professional profile up to date.</p></div>
      <Link className={styles.primary} href="/jobs">Browse jobs</Link>
    </header>
    <ul className={`${styles.list} ${styles.grid}`}>
      <li className={styles.card}><h2>Browse jobs</h2><p>See the latest postings from recruiters.</p><Link href="/jobs">View open roles</Link></li>
      <li className={styles.card}><h2>Your profile</h2><p>Update your headline, location and bio.</p><Link href="/profile">Your profile</Link></li>
      <li className={styles.card}><h2>Resumes</h2><p>Upload and manage the resumes you apply with.</p><Link href="/resumes">Manage resumes</Link></li>
    </ul>
  </main>
}
