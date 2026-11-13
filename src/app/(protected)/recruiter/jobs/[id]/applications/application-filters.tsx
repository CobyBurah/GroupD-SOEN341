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
    const fromKey = statusValue + fromValue + toValue

    return (
        <form key={fromKey} method="get" action={pageLink} className={styles.applicationFilters} aria-label = "Filter appliccations">
            <div className={styles.applicationFilterField}>
                <label htmlFor="filter-status">Status</label>
                <select id="filter-status" name="status" defaultValue={statusValue}>
                    <option value="">All statuses</option>
                    {APPLICATION_STATUSES.map(status => (
                        <option key={status} value={status}>{status}</option>
                    ))}
                </select>
            </div>
            <div className={styles.applicationFilterField}>
                <label htmlFor="filter-form">Applied from</label>
                <input id="filter-form" type="date" name="from" defaultValue={fromValue}/>
            </div>
            <div className={styles.applicationFilterField}>
                <label htmlFor="filter-to">Applied to</label>
                <input id="filter-to" type="date" name="to" defaultValue={toValue}/>
            </div>
            <div className={styles.applicationFilterActions}>
        <button type="submit">Apply filters</button>
        {active && <Link href={pageLink}>Show all applications</Link>}
      </div>

        </form>
    )
}