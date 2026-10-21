'use client'

import Link from 'next/link'

import type { JobFilterOptions } from '@/lib/jobs'
import { EMPLOYMENT_TYPES } from '@/lib/job-posting'
import styles from '@/app/ui.module.css'

// The values the filter area receives from the jobs page
type JobFiltersProps = {
  keyword: string
  locations: string[]
  categories: string[]
  employmentTypes: string[]
  filterOptions: JobFilterOptions
}

export function JobFilters({
  keyword,
  locations,
  categories,
  employmentTypes,
  filterOptions,
}: JobFiltersProps) {
  // Reset the filters but keep anything the user typed in the search bar
  const resetFiltersUrl = keyword
    ? `/jobs?keyword=${encodeURIComponent(keyword)}`
    : '/jobs'

  return (
    // Filters shown on the left of the job postings
    <aside className={styles.filterSidebar} aria-label="Job filters">
      <div className={styles.filterHeader}>
        <h2>Filters</h2>
        <Link href={resetFiltersUrl} className={styles.resetFilters}>Reset filters</Link>
      </div>

      {/* Sends the filters back to the jobs page whenever a checkbox is changed */}
      <form action="/jobs" className={styles.filterForm}>
        {/* Keep the search word when the user changes filters */}
        {keyword && <input type="hidden" name="keyword" value={keyword} />}

        <details className={styles.filterGroup} open={categories.length > 0}>
          <summary>Category</summary>

          <div className={styles.filterOptions}>
            {filterOptions.categories.map((option) => (
              <label className={styles.filterOption} key={option}>
                <input
                  type="checkbox"
                  name="category"
                  value={option}
                  defaultChecked={categories.includes(option)}
                  onChange={(event) => event.currentTarget.form?.requestSubmit()}
                />
                {option}
              </label>
            ))}
          </div>
        </details>

        <details className={styles.filterGroup} open={locations.length > 0}>
          <summary>Location</summary>

          <div className={styles.filterOptions}>
            {filterOptions.locations.map((option) => (
              <label className={styles.filterOption} key={option}>
                <input
                  type="checkbox"
                  name="location"
                  value={option}
                  defaultChecked={locations.includes(option)}
                  onChange={(event) => event.currentTarget.form?.requestSubmit()}
                />
                {option}
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
                  defaultChecked={employmentTypes.includes(value)}
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