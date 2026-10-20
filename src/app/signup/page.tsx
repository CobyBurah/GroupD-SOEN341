import Link from 'next/link'
import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'

import styles from '../ui.module.css'

import { SignupForm } from './signup-form'

export default async function SignupPage() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()

  if (data?.claims) {
    redirect('/')
  }

  return (
    <main className={`${styles.card} ${styles.auth}`}>
      <h1>Create an account</h1>
      <SignupForm />
      <p>
        Already have an account? <Link href="/login">Log in</Link>
      </p>
    </main>
  )
}
