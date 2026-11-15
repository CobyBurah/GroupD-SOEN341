import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isJobId } from '@/lib/job-posting'

export async function POST(request: NextRequest) {
  // Cookie-authenticated writes must originate from this app.
  // nextUrl may contain Next's internal server hostname; Host is the public
  // request authority (also used by Next's Server Action origin checks).
  const expectedOrigin = `${request.nextUrl.protocol}//${request.headers.get('host')}`
  if (request.headers.get('origin') !== expectedOrigin) {
    return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 })
  }
  const supabase = await createClient()
  const { data: claims } = await supabase.auth.getClaims()
  const userId = claims?.claims.sub
  if (!userId) return NextResponse.json({ error: 'Sign in to see notifications.' }, { status: 401 })

  let input
  try { input = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }
  if (!input || !['refresh', 'read', 'read_all'].includes(input.action)) {
    return NextResponse.json({ error: 'Choose a valid action.' }, { status: 400 })
  }
  const filter = input.filter ?? 'all'
  if (filter !== 'all' && filter !== 'unread') {
    return NextResponse.json({ error: 'Choose All or Unread.' }, { status: 400 })
  }
  if (input.action === 'read' && !isJobId(input.id)) {
    return NextResponse.json({ error: 'Invalid notification.' }, { status: 400 })
  }

  const { error: reminderError } = await supabase.rpc('refresh_deadline_reminders')
  if (reminderError) return NextResponse.json({ error: 'Notifications are unavailable. Please try again.' }, { status: 503 })

  if (input.action !== 'refresh') {
    let query = supabase.from('notifications').update({ read_at: new Date().toISOString() })
      .eq('user_id', userId).is('read_at', null)
    if (input.action === 'read') query = query.eq('id', input.id)
    const { error } = await query
    if (error) return NextResponse.json({ error: 'Could not mark notifications read. Please try again.' }, { status: 503 })
  }

  // Page in batches of 20; unread count is over the complete inbox.
  const requested = Number(input.limit ?? 20)
  const limit = Number.isInteger(requested) ? Math.min(200, Math.max(20, requested)) : 20
  let notices = supabase.from('notifications').select('id, kind, message, href, created_at, read_at')
    .eq('user_id', userId)
  if (filter === 'unread') notices = notices.is('read_at', null)
  const [feed, count] = await Promise.all([
    notices.order('created_at', { ascending: false }).order('id', { ascending: false }).limit(limit + 1),
    supabase.from('notifications').select('id', { count: 'exact', head: true }).eq('user_id', userId).is('read_at', null),
  ])
  if (feed.error || count.error) return NextResponse.json({ error: 'Could not load notifications. Please try again.' }, { status: 503 })
  return NextResponse.json({ notifications: (feed.data ?? []).slice(0, limit), unread: count.count ?? 0, hasMore: (feed.data?.length ?? 0) > limit },
    { headers: { 'Cache-Control': 'private, no-store' } })
}
