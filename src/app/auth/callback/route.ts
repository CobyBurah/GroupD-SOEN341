import { type NextRequest } from 'next/server'
import { redirect } from 'next/navigation'

import { safeNextPath } from '@/lib/passwords'
import { createClient } from '@/lib/supabase/server'

// Landing point for Supabase's default email templates ({{ .ConfirmationURL }}), which verify the
// link on Supabase's side and come back here with a PKCE ?code=. Exchanging it needs the code
// verifier cookie set when the email was requested, so it only works in that same browser.
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const code = searchParams.get('code')
  const next = safeNextPath(searchParams.get('next'))

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      redirect(next)
    }
  }

  if (next === '/reset-password') {
    redirect('/forgot-password?error=expired')
  }
  redirect('/error')
}
