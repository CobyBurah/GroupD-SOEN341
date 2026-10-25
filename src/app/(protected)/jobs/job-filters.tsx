'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

import type { JobFilterOptions } from '@/lib/jobs'
import { jobFilterKey, type JobFilterType } from '@/lib/job-filtering'
import { EMPLOYMENT_TYPES, WORKPLACE_TYPES } from '@/lib/job-posting'
import styles from '@/app/ui.module.css'

// The values the filter area receives from the jobs page
type JobFiltersProps = {
  keyword: string
  location: string
  categories: string[]
  employmentTypes: string[]
  workplaceTypes: string[]
  filterOrder: string[]
  filterOptions: JobFilterOptions
}

type FilterState = {
  categories: string[]
  employmentTypes: string[]
  workplaceTypes: string[]
  order: string[]
}

export function JobFilters({
  keyword,
  location,
  categories,
  employmentTypes,
  workplaceTypes,
  filterOrder,
  filterOptions,
}: JobFiltersProps) {
  const router = useRouter()

  const [filters, setFilters] = useState<FilterState>({
    categories,
    employmentTypes,
    workplaceTypes,
    order: filterOrder,
  })

  // The filters/keyword/location last reflected in the URL, so we can tell a
  // genuine filter change (which should jump back to page 1) apart from an
  // effect re-run that changed nothing - e.g. a plain reload/deep link, or
  // React Strict Mode re-invoking this effect once on mount in development.
  // Without this check, re-running the effect on mount would rebuild the URL
  // from filter state alone and silently drop whatever `page` was in it.
  const lastSynced = useRef({ keyword, location, filters })

  useEffect(() => {
    const unchanged =
      keyword === lastSynced.current.keyword &&
      location === lastSynced.current.location &&
      filters === lastSynced.current.filters

    if(unchanged) return

    const timer = setTimeout(() => {
      const params = new URLSearchParams()

      if(keyword) params.set('keyword', keyword)
      if(location) params.set('location', location)

      filters.categories.forEach((value) => params.append('category', value))
      filters.workplaceTypes.forEach((value) => params.append('workplaceType', value))
      filters.employmentTypes.forEach((value) => params.append('employmentType', value))
      filters.order.forEach((value) => params.append('filterOrder', value))

      // A real filter/keyword/location change always goes back to page 1, so
      // `page` is deliberately left out here.
      lastSynced.current = { keyword, location, filters }

      const query = params.toString()
      router.replace(query ? `/jobs?${query}` : '/jobs', { scroll: false })
    }, 150)

    return () => clearTimeout(timer)
  }, [filters, keyword, location, router])

  function toggleFilter(type: JobFilterType, value: string) {
    setFilters((current) => {
      const selected =
        type === 'category' ? current.categories :
        type === 'employmentType' ? current.employmentTypes :
        current.workplaceTypes

      const adding = !selected.includes(value)
      const key = jobFilterKey(type, value)

      return {
        categories: type === 'category'
          ? adding ? [...current.categories, value] : current.categories.filter((option) => option !== value)
          : current.categories,
        employmentTypes: type === 'employmentType'
          ? adding ? [...current.employmentTypes, value] : current.employmentTypes.filter((option) => option !== value)
          : current.employmentTypes,
        workplaceTypes: type === 'workplaceType'
          ? adding ? [...current.workplaceTypes, value] : current.workplaceTypes.filter((option) => option !== value)
          : current.workplaceTypes,
        order: adding
          ? [...current.order, key]
          : current.order.filter((option) => option !== key),
      }
    })
  }

  return (
    // Filters shown on the left of the job postings
    <aside className={styles.filterSidebar} aria-label="Job filters">
      <div className={styles.filterHeader}>
        <h2>Filters</h2>
        <Link href="/jobs" className={styles.resetFilters}>Reset filters</Link>
      </div>

      <div className={styles.filterForm}>
        <details className={styles.filterGroup} open={filters.categories.length > 0}>
          <summary>Category</summary>

          <div className={styles.filterOptions}>
            {filterOptions.categories.map((option) => (
              <label className={styles.filterOption} key={option}>
                <input type="checkbox" checked={filters.categories.includes(option)} onChange={() => toggleFilter('category', option)} />
                {option}
              </label>
            ))}
          </div>
        </details>

        <details className={styles.filterGroup} open={filters.workplaceTypes.length > 0}>
          <summary>Workplace</summary>

          <div className={styles.filterOptions}>
            {Object.entries(WORKPLACE_TYPES).map(([value, label]) => (
              <label className={styles.filterOption} key={value}>
                <input type="checkbox" checked={filters.workplaceTypes.includes(value)} onChange={() => toggleFilter('workplaceType', value)} />
                {label}
              </label>
            ))}
          </div>
        </details>

        <details className={styles.filterGroup} open={filters.employmentTypes.length > 0}>
          <summary>Employment Type</summary>

          <div className={styles.filterOptions}>
            {Object.entries(EMPLOYMENT_TYPES).map(([value, label]) => (
              <label className={styles.filterOption} key={value}>
                <input type="checkbox" checked={filters.employmentTypes.includes(value)} onChange={() => toggleFilter('employmentType', value)} />
                {label}
              </label>
            ))}
          </div>
        </details>
      </div>
    </aside>
  )
}