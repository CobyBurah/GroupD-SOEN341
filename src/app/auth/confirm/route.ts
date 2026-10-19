import type { EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest } from 'next/server'
import { redirect } from 'next/navigation'

import { safeNextPath } from '@/lib/passwords'
import { createClient } from '@/lib/supabase/server'

// Landing point for custom Supabase email templates (needs custom SMTP), which work across
// browsers unlike the default templates handled by /auth/callback. e.g. for Reset Password:
// {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/reset-password
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = safeNextPath(searchParams.get('next'))

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
