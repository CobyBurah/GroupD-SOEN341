'use server'

import { refresh } from 'next/cache'
import { isJobId } from '@/lib/job-posting'
import { createClient } from '@/lib/supabase/server'

export async function markNotificationRead(id: string): Promise<string | null> {
  if (!isJobId(id)) return 'Invalid notification.'
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const userId = data?.claims.sub
  if (!userId) return 'Sign in to manage your notifications.'

  const { error } = await supabase.from('notifications').update({ is_read: true })
    .eq('user_id', userId).eq('id', id).eq('is_read', false)
  if (error) return 'Could not mark this notification as read. Please try again.'
  refresh()
  return null
}
