import Link from 'next/link'
import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase/server'

async function signOut() {
  'use server'

  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
}

export default async function Home() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const claims = data?.claims

  return (
    <main>
      <h1>CareerConnect</h1>
      <p>{claims ? `Signed in as ${claims.email}` : 'Not signed in'}</p>
      {claims ? (
        <>
          <p>
            <Link href="/profile">Your profile</Link>
          </p>
          <form action={signOut}>
            <button type="submit">Log out</button>
          </form>
        </>
      ) : (
        <p>
          <Link href="/login">Log in</Link> or <Link href="/signup">sign up</Link>
        </p>
      )}
    </main>
  )
}
