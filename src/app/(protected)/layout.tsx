import Link from 'next/link'
import styles from './recruiter/recruiter.module.css'
import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()

  if (!data?.claims) {
    redirect('/login')
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.claims.sub).single()
  const recruiter = profile?.role === 'recruiter'
  return <div className={styles.shell}>
    <nav aria-label="Workspace navigation" className={styles.nav}>
      <Link href="/">CareerConnect</Link>
      <Link href={recruiter ? '/recruiter' : '/dashboard'}>{recruiter ? 'My postings' : 'Dashboard'}</Link>
      <Link href="/jobs">Browse jobs</Link>
      <Link href="/profile">My profile</Link>
    </nav>
    {children}
  </div>
}
