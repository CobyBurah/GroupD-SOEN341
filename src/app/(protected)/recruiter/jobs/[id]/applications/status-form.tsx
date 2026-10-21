'use client'

import { useActionState } from 'react'
import { updateApplicationStatus, type StatusState } from '@/app/(protected)/recruiter/actions'
import { APPLICATION_STATUSES, type ApplicationStatus } from '@/lib/applications'
import styles from '@/app/ui.module.css'

export function StatusForm({ jobId, applicationId, applicant, status }: { jobId: string; applicationId: string; applicant: string; status: ApplicationStatus }) {
  const [state, action, pending] = useActionState(updateApplicationStatus.bind(null, jobId, applicationId), { status } as StatusState)
  const selectId = `status-${applicationId}`
  return <form action={action} className={styles.statusForm}>
    <label htmlFor={selectId}>Status for {applicant}</label>
    <div className={styles.statusControls}>
      <select id={selectId} name="status" key={state.status} defaultValue={state.status ?? status}>
        {APPLICATION_STATUSES.map(option => <option key={option} value={option}>{option}</option>)}
      </select>
      <button type="submit" disabled={pending}>{pending ? 'Saving…' : 'Update status'}</button>
    </div>
    {state.message && <p role="alert">{state.message}</p>}
    {state.saved && !pending && <p role="status" className={styles.muted}>Status updated to {state.status}.</p>}
  </form>
}
