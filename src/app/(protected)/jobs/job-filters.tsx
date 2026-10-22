'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

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

type FilterState = {
  categories: string[]
  employmentTypes: string[]
  workplaceTypes: string[]
}

export function JobFilters({
  keyword,
  location,
  categories,
  employmentTypes,
  workplaceTypes,
  filterOptions,
}: JobFiltersProps) {
  const router = useRouter()
  const firstRender = useRef(true)

  const [filters, setFilters] = useState<FilterState>({
    categories,
    employmentTypes,
    workplaceTypes,
  })

  // Update the URL after filter changes without losing fast checkbox clicks
  useEffect(() => {
    if(firstRender.current){
      firstRender.current = false
      return
    }

    const timer = setTimeout(() => {
      const params = new URLSearchParams()

      if(keyword) params.set('keyword', keyword)
      if(location) params.set('location', location)

      filters.categories.forEach((value) => params.append('category', value))
      filters.workplaceTypes.forEach((value) => params.append('workplaceType', value))
      filters.employmentTypes.forEach((value) => params.append('employmentType', value))

      const query = params.toString()
      router.replace(query ? `/jobs?${query}` : '/jobs', { scroll: false })
    }, 150)

    return () => clearTimeout(timer)
  }, [filters, keyword, location, router])

  function toggleFilter(type: keyof FilterState, value: string) {
    setFilters((current) => {
      const selected = current[type]

      return {
        ...current,
        [type]: selected.includes(value)
          ? selected.filter((option) => option !== value)
          : [...selected, value],
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
                <input
                  type="checkbox"
                  checked={filters.categories.includes(option)}
                  onChange={() => toggleFilter('categories', option)}
                />
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
                <input
                  type="checkbox"
                  checked={filters.workplaceTypes.includes(value)}
                  onChange={() => toggleFilter('workplaceTypes', value)}
                />
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
                <input
                  type="checkbox"
                  checked={filters.employmentTypes.includes(value)}
                  onChange={() => toggleFilter('employmentTypes', value)}
                />
                {label}
              </label>
            ))}
          </div>
        </details>
      </div>
    </aside>
  )
}