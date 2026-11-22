import { type NextRequest } from 'next/server'
import { redirect } from 'next/navigation'

import { parseEmailOtpType, safeNextPath } from '@/lib/passwords'
import { createClient } from '@/lib/supabase/server'

// Landing point for custom Supabase email templates (needs custom SMTP), which work across
// browsers unlike the default templates handled by /auth/callback. e.g. for Reset Password:
// {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/reset-password
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const tokenHash = searchParams.get('token_hash')
  const type = parseEmailOtpType(searchParams.get('type'))
  const next = safeNextPath(searchParams.get('next'))

  // verifyOtp is the security check: Supabase validates the one-time token hash on its side, so
  // a crafted link without a valid hash never gets a session. These checks only skip the network
  // call when the link is missing its parameters.
  if (tokenHash && type) {
    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash })

    if (!error) {
      redirect(next)
    }
  }

  if (type === 'recovery') {
    redirect('/forgot-password?error=expired')
  }
  redirect('/error')
}
