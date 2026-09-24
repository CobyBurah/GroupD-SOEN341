import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const claims = data?.claims

  return (
    <main>
      <h1>CareerConnect</h1>
      <p>{claims ? `Signed in as ${claims.email}` : 'Not signed in'}</p>
    </main>
  )
}
