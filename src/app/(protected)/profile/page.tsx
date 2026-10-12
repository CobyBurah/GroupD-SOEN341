import Link from 'next/link'
import { redirect } from 'next/navigation'

import { ROLE_LABELS, isRole } from '@/lib/profiles'
import { formatFileSize } from '@/lib/resumes'
import { createClient } from '@/lib/supabase/server'

import { DeleteAccountForm } from './delete-account-form'
import { EmailForm } from './email-form'
import { PasswordForm } from './password-form'
import { ProfileForm } from './profile-form'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: claimsData } = await supabase.auth.getClaims()
  const userId = claimsData?.claims.sub

  if (!userId) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role, headline, location, bio')
    .eq('id', userId)
    .single()

  const role = isRole(profile?.role) ? profile.role : 'job_seeker'

  const { data: resumes } =
    role === 'job_seeker'
      ? await supabase
          .from('resumes')
          .select('id, file_name, size_bytes')
          .order('created_at', { ascending: false })
      : { data: null }

  return (
    <main>
      <h1>Your profile</h1>
      <p>Account type: {ROLE_LABELS[role]}</p>

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
            <ul>
              {resumes.map((resume) => (
                <li key={resume.id}>
                  {resume.file_name} — {formatFileSize(resume.size_bytes)}
                </li>
              ))}
            </ul>
          ) : (
            <p>No resumes uploaded yet.</p>
          )}
          <Link href="/resumes">Manage resumes</Link>
        </section>
      )}

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
