import Link from 'next/link'

import { EMPLOYMENT_TYPES, WORKPLACE_TYPES } from '@/lib/job-posting'
import styles from '@/app/ui.module.css'

type ActiveFiltersProps = {
  keyword: string
  location: string
  categories: string[]
  employmentTypes: string[]
  workplaceTypes: string[]
}

// Builds the jobs URL again after one filter is removed
function buildFilterUrl(
  keyword: string,
  location: string,
  categories: string[],
  employmentTypes: string[],
  workplaceTypes: string[]
) {
  const params = new URLSearchParams()

  if(keyword) params.set('keyword', keyword)
  if(location) params.set('location', location)

  categories.forEach((value) => params.append('category', value))
  employmentTypes.forEach((value) => params.append('employmentType', value))
  workplaceTypes.forEach((value) => params.append('workplaceType', value))

  const query = params.toString()
  return query ? `/jobs?${query}` : '/jobs'
}

export function ActiveFilters({
  keyword,
  location,
  categories,
  employmentTypes,
  workplaceTypes,
}: ActiveFiltersProps) {
  // Don't display anything when no sidebar filters are selected
  if (
    categories.length === 0 &&
    employmentTypes.length === 0 &&
    workplaceTypes.length === 0
  ) {
    return null
  }

  return (
    <div className={styles.activeFilters} aria-label="Active job filters">
      {/* Each link removes only that selected category */}
      {categories.map((category) => (
        <Link
          key={category}
          className={styles.activeFilter}
          href={buildFilterUrl(
            keyword,
            location,
            categories.filter((value) => value !== category),
            employmentTypes,
            workplaceTypes
          )}
        >
          {category} ×
        </Link>
      ))}

      {/* Each link removes only that selected workplace type */}
      {workplaceTypes.map((type) => (
        <Link
          key={type}
          className={styles.activeFilter}
          href={buildFilterUrl(
            keyword,
            location,
            categories,
            employmentTypes,
            workplaceTypes.filter((value) => value !== type)
          )}
        >
          {WORKPLACE_TYPES[type as keyof typeof WORKPLACE_TYPES]} ×
        </Link>
      ))}

      {/* Each link removes only that selected employment type */}
      {employmentTypes.map((type) => (
        <Link
          key={type}
          className={styles.activeFilter}
          href={buildFilterUrl(
            keyword,
            location,
            categories,
            employmentTypes.filter((value) => value !== type),
            workplaceTypes
          )}
        >
          {EMPLOYMENT_TYPES[type as keyof typeof EMPLOYMENT_TYPES]} ×
        </Link>
      ))}
    </div>
  )
}