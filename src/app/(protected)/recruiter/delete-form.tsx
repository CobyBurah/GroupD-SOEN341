'use client'

import { useActionState } from 'react'
import { deleteJob, type DeleteState } from './actions'
import styles from '@/app/ui.module.css'

export function DeleteForm({ id }: { id: string }) {
  const [state, action, pending] = useActionState(deleteJob.bind(null, id), {} as DeleteState)
  return <form action={action} className={styles.form}>
    <label><input name="confirmDelete" type="checkbox" required /> I confirm I want to remove this posting from active job listings.</label>
    {state.message && <p role="alert">{state.message}</p>}
    <button className={styles.danger} type="submit" disabled={pending}>{pending ? 'Deleting…' : 'Delete posting'}</button>
  </form>
}
