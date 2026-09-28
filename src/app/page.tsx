import Link from 'next/link'

import { signout } from '@/app/login/actions'
import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const claims = data?.claims

  return (
    <main>
      <h1>CareerConnect</h1>
      {claims ? (
        <>
          <p>Signed in as {claims.email}</p>
          <form action={signout}>
            <button type="submit">Sign out</button>
          </form>
        </>
      ) : (
        <>
          <p>Not signed in</p>
          <p>
            <Link href="/login">Log in</Link> or <Link href="/signup">Sign up</Link>
          </p>
        </>
      )}
    </main>
  )
}
