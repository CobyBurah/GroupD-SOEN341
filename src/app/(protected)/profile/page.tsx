import { redirect } from 'next/navigation'

import { ROLE_LABELS, isRole } from '@/lib/profiles'
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
    .select('full_name, role')
    .eq('id', userId)
    .single()

  const role = isRole(profile?.role) ? profile.role : 'job_seeker'

  return (
    <main>
      <h1>Your profile</h1>
      <p>Account type: {ROLE_LABELS[role]}</p>

      <section>
        <h2>Name</h2>
        <ProfileForm fullName={profile?.full_name ?? ''} />
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
