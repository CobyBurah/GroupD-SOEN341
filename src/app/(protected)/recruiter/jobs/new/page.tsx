import styles from '@/app/ui.module.css'
import { JobForm } from '../../job-form'
export default function NewPostingPage() {
  return <main>
    <header className={styles.header}>
      <div><p className={styles.eyebrow}>Recruiter workspace</p><h1>Create a job posting</h1></div>
    </header>
    <JobForm />
  </main>
}
