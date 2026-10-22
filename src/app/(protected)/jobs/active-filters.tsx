import Link from 'next/link'

import { EMPLOYMENT_TYPES } from '@/lib/job-posting'
import styles from '@/app/ui.module.css'

type ActiveFiltersProps = {
  keyword: string
  locations: string[]
  categories: string[]
  employmentTypes: string[]
}

// Builds the jobs URL again after one filter is removed
function buildFilterUrl(
  keyword: string,
  locations: string[],
  categories: string[],
  employmentTypes: string[]
) {
  const params = new URLSearchParams()

  if (keyword) params.set('keyword', keyword)

  locations.forEach((value) => params.append('location', value))
  categories.forEach((value) => params.append('category', value))
  employmentTypes.forEach((value) => params.append('employmentType', value))

  const query = params.toString()
  return query ? `/jobs?${query}` : '/jobs'
}

export function ActiveFilters({
  keyword,
  locations,
  categories,
  employmentTypes,
}: ActiveFiltersProps) {
  // Don't display anything when no filters are selected
  if (
    locations.length === 0 &&
    categories.length === 0 &&
    employmentTypes.length === 0
  ) {
    return null
  }

  return (
    <div className={styles.activeFilters} aria-label="Active job filters">
      {/* Each link removes only that selected location */}
      {locations.map((location) => (
        <Link
          key={location}
          className={styles.activeFilter}
          href={buildFilterUrl(
            keyword,
            locations.filter((value) => value !== location),
            categories,
            employmentTypes
          )}
        >
          <span className={styles.activeFilterText}>{location}</span> ×
        </Link>
      ))}

      {/* Each link removes only that selected category */}
      {categories.map((category) => (
        <Link
          key={category}
          className={styles.activeFilter}
          href={buildFilterUrl(
            keyword,
            locations,
            categories.filter((value) => value !== category),
            employmentTypes
          )}
        >
          {category} ×
        </Link>
      ))}

      {/* Each link removes only that selected employment type */}
      {employmentTypes.map((type) => (
        <Link
          key={type}
          className={styles.activeFilter}
          href={buildFilterUrl(
            keyword,
            locations,
            categories,
            employmentTypes.filter((value) => value !== type)
          )}
        >
          {EMPLOYMENT_TYPES[type as keyof typeof EMPLOYMENT_TYPES]} ×
        </Link>
      ))}
    </div>
  )
}