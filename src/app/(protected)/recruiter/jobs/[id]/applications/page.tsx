import Link from 'next/link'
import { ownedJob } from '@/lib/recruiter'
import styles from '@/app/ui.module.css'
export default async function ApplicationsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const job = await ownedJob(id)
  return <main>
    <header className={styles.header}>
      <div><h1>Applications for {job.title}</h1><p>{job.company}</p></div>
    </header>
    <section aria-labelledby="applications-status"><h2 id="applications-status">Applications are not available yet</h2>
      <p>Receiving and reviewing applications will be available when application submission is connected.</p>
    </section><p><Link href="/recruiter">Back to your postings</Link></p>
  </main>
}
