import Link from 'next/link'
import { APPLICATION_STATUSES } from '@/lib/applications'
import type { ApplicationFilters } from '@/lib/application-filters'
import styles from '@/app/ui.module.css'

type Props = {
    jobId: string
    filters: ApplicationFilters
    active: boolean
}

//filter form for the recruiter's applications page
//submitting it puts the filters in the URL, and the page shows the matching applications
export function ApplicationFilterForm({ jobId, filters, active}: Props){
    const pageLink = `/recruiter/jobs/${jobId}/applications`

    //Empty text means "no filter"
    const statusValue = filters.status || ''
    const fromValue = filters.from || ''
    const toValue = filters.to || ''

    //React reuses the old form unless the key changes. 
    //Without this, clicking "show all applications" would still show the old status in the dropdown
    const formKey = statusValue + fromValue + toValue

     return (
    <form key={formKey} method="get" action={pageLink} noValidate className={styles.applicationFilters} aria-label="Filter applications">
      <div className={styles.applicationFilterField}>
        <label htmlFor="filter-status">Status</label>
        <select id="filter-status" name="status" defaultValue={statusValue}>
          <option value="">Search status</option>
          {APPLICATION_STATUSES.map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      </div>

      <div className={styles.applicationFilterField}>
        <span id="filter-date-label" className={styles.applicationFilterLabel}>Date applied</span>
        <div className={styles.applicationFilterDateRange} role="group" aria-labelledby="filter-date-label">
          <input id="filter-from" type="date" name="from" defaultValue={fromValue} required aria-label="From date" />
          <span aria-hidden="true">to</span>
          <input id="filter-to" type="date" name="to" defaultValue={toValue} required aria-label="To date" />
        </div>
      </div>

      <div className={styles.applicationFilterActions}>
        <button type="submit">Apply filters</button>
        {active && <Link href={pageLink}>Show all applications</Link>}
      </div>
    </form>
  )
}