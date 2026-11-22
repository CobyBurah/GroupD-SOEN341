import Link from 'next/link'

import { isRole, otherRole, parseRoles, ROLE_LABELS, type Role } from '@/lib/profiles'
import { createClient } from '@/lib/supabase/server'

import { signOut } from './auth/actions'
import { switchRole } from './auth/role-actions'
import styles from './ui.module.css'
import { NotificationBell } from './notification-bell'

// Rendered by the root layout so every page gets the same top bar,
// with the log out button pinned to the top-right corner when signed in.
export async function SiteHeader() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const claims = data?.claims

  let role: Role = 'job_seeker'
  let dualRole = false
  if (claims?.sub) {
    const { data: profile } = await supabase.from('profiles').select('role, roles').eq('id', claims.sub).single()
    if (isRole(profile?.role)) role = profile.role
    dualRole = parseRoles(profile?.roles).length > 1
  }
  const recruiter = role === 'recruiter'

  return (
    <header className={styles.topbar}>
      <div className={styles.topbarInner}>
        <nav aria-label="Workspace navigation" className={styles.nav}>
          <Link href="/" className={styles.brand}>CareerConnect</Link>
          {claims && (
            <>
              <Link href={recruiter ? '/recruiter' : '/dashboard'}>{recruiter ? 'My postings' : 'Dashboard'}</Link>
              <Link href="/jobs">Browse jobs</Link>
              {!recruiter && <Link href="/applications">My applications</Link>}
              {!recruiter && <Link href="/favourites">Favourites</Link>}
              {!recruiter && <Link href="/resumes">Resumes</Link>}
              {!recruiter && <Link href="/job-matches">AI matches</Link>}
              <Link href="/profile">My profile</Link>
            </>
          )}
        </nav>
        <div className={styles.account}>
          {claims ? (
            <>
              <NotificationBell />
              {dualRole && (
                <>
                  <span className={styles.mode}>{ROLE_LABELS[role]} mode</span>
                  <form action={switchRole}>
                    <input type="hidden" name="role" value={otherRole(role)} />
                    <button type="submit" className={styles.secondary}>Switch to {ROLE_LABELS[otherRole(role)]}</button>
                  </form>
                </>
              )}
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
