'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import styles from './ui.module.css'

export function NotificationBell({ count }: { count: number | null }) {
  const router = useRouter()
  const pathname = usePathname()
  // The root layout persists during navigation. Check the small count endpoint
  // while the tab is visible, and refresh server-rendered content on change.
  useEffect(() => {
    const controller = new AbortController()
    let checking = false
    async function check() {
      if (checking || document.visibilityState !== 'visible') return
      checking = true
      try {
        const response = await fetch('/api/notifications/unread', { cache: 'no-store', signal: controller.signal })
        if (response.ok && (await response.json()).count !== count && !controller.signal.aborted) router.refresh()
      } catch {
        // Keep the last known count during a transient network interruption.
      } finally { checking = false }
    }
    void check()
    const timer = window.setInterval(check, 60_000)
    document.addEventListener('visibilitychange', check)
    return () => {
      controller.abort()
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', check)
    }
  }, [count, pathname, router])

  const label = count === null ? 'Notifications' : `Notifications, ${count} unread`
  return <Link href="/notifications" className={styles.bell} aria-label={label} title={label}>
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Z M10 20a2.2 2.2 0 0 0 4 0" />
    </svg>
    {count !== null && count > 0 && <span className={styles.bellCount} aria-hidden="true">{count}</span>}
  </Link>
}
