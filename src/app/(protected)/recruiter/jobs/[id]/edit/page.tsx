import { ownedJob } from '@/lib/recruiter'
import { EMPTY_JOB } from '@/lib/job-posting'
import styles from '@/app/ui.module.css'
import { JobForm } from '../../../job-form'
export default async function EditPostingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const job = await ownedJob(id)
  const values = { ...EMPTY_JOB }
  for (const field of Object.keys(values) as (keyof typeof values)[]) values[field] = job[field] ?? ''
  return <main>
    <header className={styles.header}>
      <div><h1>Edit posting</h1></div>
    </header>
    <JobForm id={id} initialValues={values} />
  </main>
}
