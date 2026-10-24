'use client'

import { useActionState } from 'react'
import { withdrawApplication, type WithdrawState } from './actions'
import styles from '@/app/ui.module.css'

// Asks for confirmation, then deletes the application.
export function WithdrawButton({ applicationId, jobId, jobTitle }: { applicationId: string; jobId: string | null; jobTitle: string }) {
  const [state, action, pending] = useActionState(withdrawApplication.bind(null, applicationId, jobId), {} as WithdrawState)
  return <form
    action={action}
    className={styles.favouriteForm}
    onSubmit={(event) => {
      if (!window.confirm(`Withdraw your application for ${jobTitle}? This cannot be undone.`)) event.preventDefault()
    }}
  >
    <button type="submit" className={styles.danger} disabled={pending} aria-label={`Withdraw application for ${jobTitle}`}>
      {pending ? 'Withdrawing…' : 'Withdraw'}
    </button>
    {state.message && <p role="alert">{state.message}</p>}
  </form>
}
