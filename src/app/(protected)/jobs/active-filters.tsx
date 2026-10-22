import Link from 'next/link'

import { parseJobFilterKey } from '@/lib/job-filtering'
import { EMPLOYMENT_TYPES, WORKPLACE_TYPES } from '@/lib/job-posting'
import styles from '@/app/ui.module.css'

type ActiveFiltersProps = {
  keyword: string
  location: string
  categories: string[]
  employmentTypes: string[]
  workplaceTypes: string[]
  filterOrder: string[]
}

// Builds the jobs URL again after one filter is removed
function buildFilterUrl(
  keyword: string,
  location: string,
  categories: string[],
  employmentTypes: string[],
  workplaceTypes: string[],
  filterOrder: string[]
) {
  const params = new URLSearchParams()

  if(keyword) params.set('keyword', keyword)
  if(location) params.set('location', location)

  categories.forEach((value) => params.append('category', value))
  employmentTypes.forEach((value) => params.append('employmentType', value))
  workplaceTypes.forEach((value) => params.append('workplaceType', value))
  filterOrder.forEach((value) => params.append('filterOrder', value))

  const query = params.toString()
  return query ? `/jobs?${query}` : '/jobs'
}

export function ActiveFilters({
  keyword,
  location,
  categories,
  employmentTypes,
  workplaceTypes,
  filterOrder,
}: ActiveFiltersProps) {
  if(filterOrder.length === 0) return null

  return (
    <div className={styles.activeFilters} aria-label="Active job filters">
      {filterOrder.map((orderedFilter) => {
        const filter = parseJobFilterKey(orderedFilter)
        if(!filter) return null

        const nextCategories = filter.type === 'category' ? categories.filter((value) => value !== filter.value) : categories
        const nextEmploymentTypes = filter.type === 'employmentType' ? employmentTypes.filter((value) => value !== filter.value) : employmentTypes
        const nextWorkplaceTypes = filter.type === 'workplaceType' ? workplaceTypes.filter((value) => value !== filter.value) : workplaceTypes
        const nextOrder = filterOrder.filter((value) => value !== orderedFilter)

        const label =
          filter.type === 'employmentType'
            ? EMPLOYMENT_TYPES[filter.value as keyof typeof EMPLOYMENT_TYPES] ?? filter.value
            : filter.type === 'workplaceType'
              ? WORKPLACE_TYPES[filter.value as keyof typeof WORKPLACE_TYPES] ?? filter.value
              : filter.value

        return (
          <Link
            key={orderedFilter}
            className={styles.activeFilter}
            href={buildFilterUrl(keyword, location, nextCategories, nextEmploymentTypes, nextWorkplaceTypes, nextOrder)}
          >
            {label} ×
          </Link>
        )
      })}
    </div>
  )
}