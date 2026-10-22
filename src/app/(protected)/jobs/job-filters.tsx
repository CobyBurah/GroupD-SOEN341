'use client'

import Link from 'next/link'

import type { JobFilterOptions } from '@/lib/jobs'
import { EMPLOYMENT_TYPES, WORKPLACE_TYPES } from '@/lib/job-posting'
import styles from '@/app/ui.module.css'

// The values the filter area receives from the jobs page
type JobFiltersProps = {
  keyword: string
  location: string
  categories: string[]
  employmentTypes: string[]
  workplaceTypes: string[]
  filterOptions: JobFilterOptions
}

export function JobFilters({
  keyword,
  location,
  categories,
  employmentTypes,
  workplaceTypes,
  filterOptions,
}: JobFiltersProps) {
  // Reset sidebar filters but keep anything in the search bar
  const resetParams = new URLSearchParams()

  if(keyword) resetParams.set('keyword', keyword)
  if(location) resetParams.set('location', location)

  const resetQuery = resetParams.toString()
  const resetFiltersUrl = resetQuery ? `/jobs?${resetQuery}` : '/jobs'

  return (
    // Filters shown on the left of the job postings
    <aside className={styles.filterSidebar} aria-label="Job filters">
      <div className={styles.filterHeader}>
        <h2>Filters</h2>
        <Link href={resetFiltersUrl} className={styles.resetFilters}>Reset filters</Link>
      </div>

      {/* Sends the filters back to the jobs page whenever a checkbox is changed */}
      <form action="/jobs" className={styles.filterForm}>
        {/* Keep the search values when the user changes filters */}
        {keyword && <input type="hidden" name="keyword" value={keyword} />}
        {location && <input type="hidden" name="location" value={location} />}

        <details className={styles.filterGroup} open={categories.length > 0}>
          <summary>Category</summary>

          <div className={styles.filterOptions}>
            {filterOptions.categories.map((option) => (
              <label className={styles.filterOption} key={option}>
                <input
                  type="checkbox"
                  name="category"
                  value={option}
                  checked={categories.includes(option)}
                  onChange={(event) => event.currentTarget.form?.requestSubmit()}
                />
                {option}
              </label>
            ))}
          </div>
        </details>

        <details className={styles.filterGroup} open={workplaceTypes.length > 0}>
          <summary>Workplace</summary>

          <div className={styles.filterOptions}>
            {Object.entries(WORKPLACE_TYPES).map(([value, label]) => (
              <label className={styles.filterOption} key={value}>
                <input
                  type="checkbox"
                  name="workplaceType"
                  value={value}
                  checked={workplaceTypes.includes(value)}
                  onChange={(event) => event.currentTarget.form?.requestSubmit()}
                />
                {label}
              </label>
            ))}
          </div>
        </details>

        <details className={styles.filterGroup} open={employmentTypes.length > 0}>
          <summary>Employment Type</summary>

          <div className={styles.filterOptions}>
            {Object.entries(EMPLOYMENT_TYPES).map(([value, label]) => (
              <label className={styles.filterOption} key={value}>
                <input
                  type="checkbox"
                  name="employmentType"
                  value={value}
                  checked={employmentTypes.includes(value)}
                  onChange={(event) => event.currentTarget.form?.requestSubmit()}
                />
                {label}
              </label>
            ))}
          </div>
        </details>
      </form>
    </aside>
  )
}