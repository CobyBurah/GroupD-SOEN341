import styles from '@/app/ui.module.css'

// The values the search bar receives from the jobs page
type JobSearchProps = {
  keyword: string
  location: string
  category: string
  employmentType: string
}

export function JobSearch({
  keyword,
  location,
  category,
  employmentType,
}: JobSearchProps) {
  return (
    // Sends the search word and active filters back to the jobs page through the URL
    <form action="/jobs" className={styles.searchBar}>
      <input
        type="text"
        name="keyword"
        placeholder="Search jobs..."
        defaultValue={keyword}
        aria-label="Search Jobs"
      />

      {/* Keep the filters selected when the user searches for another keyword */}
      {location && <input type="hidden" name="location" value={location} />}
      {category && <input type="hidden" name="category" value={category} />}
      {employmentType && (
        <input
          type="hidden"
          name="employmentType"
          value={employmentType}
        />
      )}

      <button type="submit">Search</button>
    </form>
  )
}