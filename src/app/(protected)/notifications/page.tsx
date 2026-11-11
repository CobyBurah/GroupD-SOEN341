import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getInboxPage, INBOX_PAGE_SIZE } from '@/lib/notifications'
import { createClient } from '@/lib/supabase/server'
import styles from '@/app/ui.module.css'
import { MarkReadButton } from './mark-read-button'

export const metadata = { title: 'Notifications | CareerConnect' }
const dateFormat = new Intl.DateTimeFormat('en-CA', {
  dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC',
})

export default async function NotificationsPage({ searchParams }: {
  searchParams: Promise<{ page?: string | string[] }>
}) {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const userId = data?.claims.sub
  if (!userId) redirect('/login')

  const value = (await searchParams).page
  const page = value === undefined ? 1 : Number(value)
  if (Array.isArray(value) || !Number.isSafeInteger(page) || page < 1 || page * INBOX_PAGE_SIZE > 2147483647) {
    redirect('/notifications')
  }
  const inbox = await getInboxPage(supabase, userId, page)
  if (page > 1 && inbox && !inbox.notices.length) redirect('/notifications')

  return <main>
    <header className={styles.header}><h1>Notifications</h1></header>
    {!inbox && <p role="alert">Could not load your notifications. Please refresh to try again.</p>}
    {inbox?.notices.length === 0 && <p className={styles.card}>No notifications yet.</p>}
    {inbox && inbox.notices.length > 0 && <>
        <ul className={styles.list} aria-label="Notifications">
          {inbox.notices.map(notice => <li key={notice.id} className={styles.row}>
            <h2 className={styles.rowTitle}>{notice.title}</h2>
            <p className={styles.meta}>
              <strong>{notice.is_read ? 'Read' : 'Unread'}</strong>
              <time dateTime={notice.created_at}>{dateFormat.format(new Date(notice.created_at))} UTC</time>
            </p>
            <p className={styles.description}>{notice.message}</p>
            {!notice.is_read && <MarkReadButton id={notice.id} title={notice.title} />}
          </li>)}
        </ul>
        {(page > 1 || inbox.hasOlder) && <nav aria-label="Notification pages" className={styles.pagination}>
          {page > 1 && <Link href={page === 2 ? '/notifications' : `/notifications?page=${page - 1}`}>Newer notifications</Link>}
          {inbox.hasOlder && <Link href={`/notifications?page=${page + 1}`}>Older notifications</Link>}
        </nav>}
      </>}
  </main>
}
