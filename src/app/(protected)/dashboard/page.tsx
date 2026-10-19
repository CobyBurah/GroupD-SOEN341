import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  if (!data?.claims.sub) redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.claims.sub).single()
  if (profile?.role === 'recruiter') redirect('/recruiter')
  return <main><p>Job Seeker workspace</p><h1>Your dashboard</h1><p>Explore job opportunities and keep your professional profile up to date.</p>
    <p><Link href="/jobs">Browse jobs</Link></p><p><Link href="/profile">Your profile</Link></p>
  </main>
}
