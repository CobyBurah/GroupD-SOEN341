import Link from 'next/link'
import { redirect } from 'next/navigation'

import { isRole, otherRole, parseRoles, ROLE_LABELS } from '@/lib/profiles'
import { formatFileSize } from '@/lib/resumes'
import { createClient } from '@/lib/supabase/server'
import styles from '@/app/ui.module.css'
import { enableRole, switchRole } from '@/app/auth/role-actions'

import { DeleteAccountForm } from './delete-account-form'
import { EmailForm } from './email-form'
import { PasswordForm } from './password-form'
import { ProfileForm } from './profile-form'

export default async function ProfilePage({ searchParams }: { searchParams: Promise<{ roleAdded?: string; roleError?: string }> }) {
  const { roleAdded, roleError } = await searchParams
  const supabase = await createClient()
  const { data: claimsData } = await supabase.auth.getClaims()
  const userId = claimsData?.claims.sub

  if (!userId) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role, roles, headline, location, bio')
    .eq('id', userId)
    .single()

  const role = isRole(profile?.role) ? profile.role : 'job_seeker'
  const other = otherRole(role)
  const dualRole = parseRoles(profile?.roles).includes(other)

  const { data: resumes } =
    role === 'job_seeker'
      ? await supabase
          .from('resumes')
          .select('id, file_name, size_bytes')
          .order('created_at', { ascending: false })
      : { data: null }

  return (
    <main>
      <header className={styles.header}>
        <div>
          <h1>Your profile</h1>
          <p>Manage your personal details, sign-in settings and account.</p>
        </div>
      </header>

      <section>
        <h2>Name</h2>
        <ProfileForm
          role={role}
          fullName={profile?.full_name ?? ''}
          headline={profile?.headline ?? ''}
          location={profile?.location ?? ''}
          bio={profile?.bio ?? ''}
        />
      </section>

      {role === 'job_seeker' && (
        <section>
          <h2>Resumes</h2>
          {resumes && resumes.length > 0 ? (
            <ul className={styles.pills}>
              {resumes.map((resume) => (
                <li key={resume.id} className={styles.pill}>
                  {resume.file_name} — {formatFileSize(resume.size_bytes)}
                </li>
              ))}
            </ul>
          ) : (
            <p>No resumes uploaded yet.</p>
          )}
          <Link href="/resumes" className={styles.secondary}>
            Manage resumes <span className={styles.arrow}>→</span>
          </Link>
        </section>
      )}

      <section>
        <h2>Account roles</h2>
        {roleAdded && <p className={styles.notice} role="status">You can now use this account as a {ROLE_LABELS[other]}. Switch modes from the top bar or below.</p>}
        {roleError && <p role="alert">We couldn&apos;t update your account roles. Please try again.</p>}
        {dualRole ? (
          <>
            <p>
              You can use this account as both a {ROLE_LABELS.job_seeker} and a {ROLE_LABELS.recruiter}. Currently active:{' '}
              <strong>{ROLE_LABELS[role]}</strong>.
            </p>
            <form action={switchRole}>
              <input type="hidden" name="role" value={other} />
              <button type="submit" className={styles.secondary}>Switch to {ROLE_LABELS[other]}</button>
            </form>
          </>
        ) : (
          <>
            <p>
              Your account is set up as a {ROLE_LABELS[role]}. If you also {other === 'recruiter' ? 'hire for open positions' : 'look for jobs'}, you can
              use this same account as a {ROLE_LABELS[other]} and choose which role to use when you log in.
            </p>
            <form action={enableRole}>
              <input type="hidden" name="role" value={other} />
              <button type="submit" className={styles.secondary}>Also use this account as a {ROLE_LABELS[other]}</button>
            </form>
          </>
        )}
      </section>

      <section>
        <h2>Email</h2>
        <EmailForm email={claimsData?.claims.email ?? ''} />
      </section>

      <section>
        <h2>Password</h2>
        <PasswordForm />
      </section>

      <section>
        <h2>Delete account</h2>
        <DeleteAccountForm />
      </section>
    </main>
  )
}
