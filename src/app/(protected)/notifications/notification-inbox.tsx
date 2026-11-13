'use client'

import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import { notificationHref, type NotificationFeed } from '@/lib/notifications'
import { requestNotifications } from '@/app/notification-bell'
import styles from '@/app/ui.module.css'

export function NotificationInbox() {
  const [feed, setFeed] = useState<NotificationFeed | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const limit = useRef(20)
  const inFlight = useRef(false)
  const load = useCallback(async (action = 'refresh', id?: string) => {
    if (inFlight.current) return
    inFlight.current = true
    setBusy(true)
    try {
      const data = await requestNotifications(action, id, limit.current)
      setFeed(data)
      setError('')
      window.dispatchEvent(new Event('notifications-changed'))
      if (action !== 'refresh') {
        setMessage(action === 'read_all' ? 'All notifications marked as read.' : 'Notification marked as read.')
      }
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not load notifications.') }
    finally { inFlight.current = false; setBusy(false) }
  }, [])
  useEffect(() => {
    const initial = setTimeout(() => void load(), 0)
    const refresh = () => { if (!document.hidden) void load() }
    const timer = setInterval(refresh, 30000)
    document.addEventListener('visibilitychange', refresh)
    return () => { clearTimeout(initial); clearInterval(timer); document.removeEventListener('visibilitychange', refresh) }
  }, [load])
  return <main>
    <header className={styles.header}><div><h1>Notifications</h1>
      <p>Application updates, interview invitations and deadline reminders.</p></div></header>
    <div className={styles.actions}>
      <button className={styles.secondary} disabled={busy} onClick={() => void load()}>Refresh</button>
      <button disabled={busy || !feed?.unread} onClick={() => void load('read_all')}>Mark all as read</button>
    </div>
    {error && <p role="alert">{error}</p>}
    {message && <p role="status">{message}</p>}
    {!feed && !error && <p role="status">Loading notifications…</p>}
    {feed && <>
      <p className={styles.muted}>{feed.unread} unread · Updates every 30 seconds while this tab is visible.</p>
      {feed.notifications.length === 0 ? <section className={styles.card}><h2>No notifications yet</h2>
        <p>Your updates will appear here. Saved and applied-to jobs with a deadline within three days generate reminders.</p></section>
        : <ul className={styles.list}>{feed.notifications.map(item => <li key={item.id} className={styles.row}>
          <div className={styles.notificationHeading}><strong>{item.read_at ? 'Read' : 'Unread'}</strong>
            <time dateTime={item.created_at}>{new Date(item.created_at).toLocaleString()}</time></div>
          <p>{item.message}</p>
          <div className={styles.actions}>
            <Link href={notificationHref(item.href)} className={styles.secondary}>View details</Link>
            {!item.read_at && <button disabled={busy} onClick={() => void load('read', item.id)} aria-label={`Mark as read: ${item.message}`}>Mark as read</button>}
          </div>
        </li>)}</ul>}
      {feed.hasMore && <button disabled={busy || feed.notifications.length >= 200} onClick={() => { limit.current += 20; void load() }}>Load more</button>}
      {feed.hasMore && feed.notifications.length >= 200 && <p>Showing the latest 200 notifications. Mark all as read includes older notifications.</p>}
    </>}
  </main>
}
