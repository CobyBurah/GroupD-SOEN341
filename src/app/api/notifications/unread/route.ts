import { getUnreadCount } from '@/lib/notifications'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const headers = { 'Cache-Control': 'private, no-store' }
  if (!data?.claims.sub) return new Response(null, { status: 401, headers })
  const count = await getUnreadCount(supabase, data.claims.sub)
  if (count === null) return new Response(null, { status: 503, headers })
  return Response.json({ count }, { headers })
}
