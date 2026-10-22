'use client'

import { useMemo, useRef, useState } from 'react'

import styles from '@/app/ui.module.css'

// The values the search bar receives from the jobs page
type JobSearchProps = {
  keyword: string
  location: string
  locationOptions: string[]
  categories: string[]
  employmentTypes: string[]
  workplaceTypes: string[]
  filterOrder: string[]
}

function MapPinIcon() {
  return (
    <svg
      className={styles.locationSearchIcon}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  )
}

export function JobSearch({
  keyword,
  location,
  locationOptions,
  categories,
  employmentTypes,
  workplaceTypes,
  filterOrder,
}: JobSearchProps) {
  const formRef = useRef<HTMLFormElement>(null)
  const [locationValue, setLocationValue] = useState(location)
  const [showLocations, setShowLocations] = useState(false)

  const suggestions = useMemo(() => {
    const search = locationValue.trim().toLowerCase()

    return locationOptions
      .filter((option) => !search || option.toLowerCase().includes(search))
      .slice(0, 8)
  }, [locationValue, locationOptions])

  function selectLocation(option: string) {
    setLocationValue(option)
    setShowLocations(false)

    // Apply the selected location right away
    setTimeout(() => formRef.current?.requestSubmit(), 0)
  }

  return (
    // Sends the search values and active filters back to the jobs page through the URL
    <form ref={formRef} action="/jobs" className={styles.searchBar}>
      <input className={styles.keywordSearch} type="text" name="keyword" placeholder="Search jobs..." defaultValue={keyword} aria-label="Search Jobs" />

      <div className={styles.locationSearchWrap}>
        <MapPinIcon />

        <input
          className={styles.locationSearch}
          type="text"
          name="location"
          placeholder="City, province, or country"
          value={locationValue}
          autoComplete="off"
          aria-label="Location"
          onFocus={() => setShowLocations(true)}
          onChange={(event) => {
            setLocationValue(event.target.value)
            setShowLocations(true)
          }}
          onBlur={() => setTimeout(() => setShowLocations(false), 100)}
        />

        {showLocations && suggestions.length > 0 && (
          <div className={styles.locationSearchSuggestions}>
            {suggestions.map((option) => (
              <button
                key={option}
                type="button"
                className={styles.locationSearchSuggestion}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => selectLocation(option)}
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Keep every selected sidebar filter when the user makes another search */}
      {categories.map((value) => <input key={value} type="hidden" name="category" value={value} />)}
      {employmentTypes.map((value) => <input key={value} type="hidden" name="employmentType" value={value} />)}
      {workplaceTypes.map((value) => <input key={value} type="hidden" name="workplaceType" value={value} />)}
      {filterOrder.map((value) => <input key={value} type="hidden" name="filterOrder" value={value} />)}

      <button type="submit">Search</button>
    </form>
  )
}