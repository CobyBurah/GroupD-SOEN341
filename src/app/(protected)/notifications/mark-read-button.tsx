'use client'

import { useActionState } from 'react'
import styles from '@/app/ui.module.css'
import { markNotificationRead } from './actions'

export function MarkReadButton({ id, title }: { id: string; title: string }) {
  const [error, action, pending] = useActionState(() => markNotificationRead(id), null)
  return <form action={action}>
    <button className={styles.secondary} type="submit" disabled={pending} aria-label={`Mark as read: ${title}`}>
      {pending ? 'Marking…' : 'Mark as read'}
    </button>
    {error && <p role="alert">{error}</p>}
  </form>
}
