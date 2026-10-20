'use client'

import { useActionState } from 'react'
import { submitApplication } from './actions'
import styles from '@/app/ui.module.css'

export function ApplicationForm({ jobId, resumes }: { jobId: string; resumes: { id: string; file_name: string }[] }) {
  const [state, action, pending] = useActionState(submitApplication.bind(null, jobId), {})
  if (state.success) return <p className={styles.notice} role="status">Application submitted. Status: Applied.</p>
  return <form action={action} className={styles.form}>
    <div><label htmlFor="resumeId">Resume</label>
      <select id="resumeId" name="resumeId" required defaultValue="">
        <option value="" disabled>Choose a resume</option>
        {resumes.map(resume => <option key={resume.id} value={resume.id}>{resume.file_name}</option>)}
      </select>
    </div>
    {state.error && <p role="alert">{state.error}</p>}
    <button disabled={pending}>{pending ? 'Submitting…' : 'Submit application'}</button>
  </form>
}
