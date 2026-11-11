import type { createClient } from '@/lib/supabase/server'

type Client = Awaited<ReturnType<typeof createClient>>

export type InboxNotice = {
  id: string
  title: string
  message: string
  created_at: string
  is_read: boolean
}

// Count all unread rows, including those outside the current inbox page.
export async function getUnreadCount(client: Client, userId: string): Promise<number | null> {
  const { count, error } = await client.from('notifications')
    .select('id', { head: true, count: 'exact' }).eq('user_id', userId).eq('is_read', false)
  return error ? null : count
}

export const INBOX_PAGE_SIZE = 20

export async function getInboxPage(client: Client, userId: string, page: number) {
  const start = (page - 1) * INBOX_PAGE_SIZE
  const { data, error } = await client.from('notifications')
    .select('id, title, message, created_at, is_read').eq('user_id', userId)
    .order('created_at', { ascending: false }).order('id', { ascending: false })
    .range(start, start + INBOX_PAGE_SIZE)
  if (error && error.code !== 'PGRST103') return null
  const rows: InboxNotice[] = data ?? []
  return { notices: rows.slice(0, INBOX_PAGE_SIZE), hasOlder: rows.length > INBOX_PAGE_SIZE }
}
