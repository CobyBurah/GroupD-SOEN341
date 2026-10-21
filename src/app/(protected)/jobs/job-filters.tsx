import Link from 'next/link'

import type { JobFilterOptions } from '@/lib/jobs'
import { EMPLOYMENT_TYPES } from '@/lib/job-posting'
import styles from '@/app/ui.module.css'

// The values the filter sidebar receives from the jobs page
type JobFiltersProps = {
  keyword: string
  location: string
  category: string
  employmentType: string
  filterOptions: JobFilterOptions
}

export function JobFilters({
  keyword,
  location,
  category,
  employmentType,
  filterOptions,
}: JobFiltersProps) {
  // Reset the filters but keep anything the user typed in the search bar
  const resetFiltersUrl = keyword
    ? `/jobs?keyword=${encodeURIComponent(keyword)}`
    : '/jobs'

  return (
    // Sidebar shown on the left of the job postings
    <aside className={styles.filterSidebar} aria-label="Job filters">
      <div className={styles.filterHeader}>
        <h2>Filters</h2>

        <Link
          href={resetFiltersUrl}
          className={styles.resetFilters}
        >
          Reset filters
        </Link>
      </div>

      {/* Sends the filters selected by the user back to the jobs page */}
      <form action="/jobs" className={styles.filterForm}>
        {/* Keep the search word when the user applies a filter */}
        {keyword && (
          <input
            type="hidden"
            name="keyword"
            value={keyword}
          />
        )}

        {/* Category choices come from the categories currently used by job postings */}
        <details className={styles.filterGroup} open>
          <summary>Category</summary>

          <div className={styles.filterOptions}>
            <label className={styles.filterOption}>
              <input
                type="radio"
                name="category"
                value=""
                defaultChecked={category === ''}
              />
              All categories
            </label>

            {filterOptions.categories.map((option) => (
              <label
                className={styles.filterOption}
                key={option}
              >
                <input
                  type="radio"
                  name="category"
                  value={option}
                  defaultChecked={category === option}
                />
                {option}
              </label>
            ))}
          </div>
        </details>

        {/* Location choices also come from the current job postings */}
        <details className={styles.filterGroup}>
          <summary>Location</summary>

          <div className={styles.filterOptions}>
            <label className={styles.filterOption}>
              <input
                type="radio"
                name="location"
                value=""
                defaultChecked={location === ''}
              />
              All locations
            </label>

            {filterOptions.locations.map((option) => (
              <label
                className={styles.filterOption}
                key={option}
              >
                <input
                  type="radio"
                  name="location"
                  value={option}
                  defaultChecked={location === option}
                />
                {option}
              </label>
            ))}
          </div>
        </details>

        {/* Employment types reuse the list already used when recruiters create jobs */}
        <details className={styles.filterGroup}>
          <summary>Employment Type</summary>

          <div className={styles.filterOptions}>
            <label className={styles.filterOption}>
              <input
                type="radio"
                name="employmentType"
                value=""
                defaultChecked={employmentType === ''}
              />
              All employment types
            </label>

            {Object.entries(EMPLOYMENT_TYPES).map(([value, label]) => (
              <label
                className={styles.filterOption}
                key={value}
              >
                <input
                  type="radio"
                  name="employmentType"
                  value={value}
                  defaultChecked={employmentType === value}
                />
                {label}
              </label>
            ))}
          </div>
        </details>

        <button
          type="submit"
          className={styles.filterApply}
        >
          Apply Filters
        </button>
      </form>
    </aside>
  )
}