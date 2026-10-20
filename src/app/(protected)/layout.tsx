import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'

// Navigation and the log out button live in the root layout's SiteHeader.
export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()

  if (!data?.claims) {
    redirect('/login')
  }

  return <>{children}</>
}
