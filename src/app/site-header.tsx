import Link from 'next/link'

import { createClient } from '@/lib/supabase/server'

import { signOut } from './auth/actions'
import styles from './ui.module.css'

// Rendered by the root layout so every page gets the same top bar,
// with the log out button pinned to the top-right corner when signed in.
export async function SiteHeader() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const claims = data?.claims

  let recruiter = false
  if (claims?.sub) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', claims.sub).single()
    recruiter = profile?.role === 'recruiter'
  }

  return (
    <header className={styles.topbar}>
      <div className={styles.topbarInner}>
        <nav aria-label="Workspace navigation" className={styles.nav}>
          <Link href="/" className={styles.brand}>CareerConnect</Link>
          {claims && (
            <>
              <Link href={recruiter ? '/recruiter' : '/dashboard'}>{recruiter ? 'My postings' : 'Dashboard'}</Link>
              <Link href="/jobs">Browse jobs</Link>
              {!recruiter && <Link href="/favourites">Favourites</Link>}
              {!recruiter && <Link href="/resumes">Resumes</Link>}
              <Link href="/profile">My profile</Link>
            </>
          )}
        </nav>
        <div className={styles.account}>
          {claims ? (
            <>
              {claims.email && <span className={styles.who}>{claims.email}</span>}
              <form action={signOut}>
                <button type="submit" className={styles.secondary}>Log out</button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login">Log in</Link>
              <Link href="/signup" className={styles.primary}>Sign up</Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
