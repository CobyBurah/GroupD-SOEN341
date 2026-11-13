'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import type { NotificationFeed } from '@/lib/notifications'
import styles from './ui.module.css'

export async function requestNotifications(action = 'refresh', id?: string, limit = 20): Promise<NotificationFeed> {
  const response = await fetch('/api/notifications', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, id, limit }), cache: 'no-store',
  })
  const data = await response.json().catch(() => ({ error: 'Notifications are unavailable. Please try again.' }))
  if (!response.ok) throw new Error(data.error || 'Could not load notifications.')
  return data
}

export function NotificationBell() {
  const [unread, setUnread] = useState<number | null>(null)
  const [unavailable, setUnavailable] = useState(false)
  const refresh = useCallback(async () => {
    try {
      const data = await requestNotifications()
      setUnread(data.unread)
      setUnavailable(false)
    } catch { setUnavailable(true) }
  }, [])
  useEffect(() => {
    const initial = setTimeout(() => void refresh(), 0)
    const visibleRefresh = () => { if (!document.hidden) void refresh() }
    const timer = setInterval(visibleRefresh, 30000)
    document.addEventListener('visibilitychange', visibleRefresh)
    window.addEventListener('notifications-changed', visibleRefresh)
    return () => {
      clearTimeout(initial)
      clearInterval(timer)
      document.removeEventListener('visibilitychange', visibleRefresh)
      window.removeEventListener('notifications-changed', visibleRefresh)
    }
  }, [refresh])
  return <Link href="/notifications" className={styles.notificationBell}
    aria-label={unavailable ? 'Notifications unavailable' : unread === null ? 'Notifications' : `Notifications (${unread} unread)`}>
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
    </svg>
    <span>Notifications</span>
    {unavailable ? <span title="Open notifications to retry">!</span> : unread !== null && unread > 0 &&
      <span className={styles.notificationCount} aria-hidden="true">{unread > 99 ? '99+' : unread}</span>}
  </Link>
}
