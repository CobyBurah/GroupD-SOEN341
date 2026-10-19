import styles from '@/app/ui.module.css'
import { JobForm } from '../../job-form'
export default function NewPostingPage() {
  return <main><p className={styles.eyebrow}>Recruiter workspace</p><h1>Create a job posting</h1><JobForm /></main>
}
