import Link from 'next/link'
import { ownedJob } from '@/lib/recruiter'
import styles from '@/app/ui.module.css'
import { DeleteForm } from '../../../delete-form'
export default async function DeletePostingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const job = await ownedJob(id)
  return <main>
    <header className={styles.header}>
      <div><p className={styles.eyebrow}>Recruiter workspace</p><h1>Delete posting</h1></div>
    </header>
    <div className={styles.card}><h2>{job.title}</h2><p>{job.company}</p>
      <p>This removes the job from active listings. Its record is retained to preserve application history.</p>
      <DeleteForm id={id} /><p><Link className={styles.secondary} href="/recruiter">Cancel and keep posting</Link></p>
    </div>
  </main>
}
