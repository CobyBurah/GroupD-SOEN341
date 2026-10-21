import styles from '@/app/ui.module.css'

// The values the search bar receives from the jobs page
type JobSearchProps = {
  keyword: string
  locations: string[]
  categories: string[]
  employmentTypes: string[]
}

export function JobSearch({
  keyword,
  locations,
  categories,
  employmentTypes,
}: JobSearchProps) {
  return (
    // Sends the search word and active filters back to the jobs page through the URL
    <form action="/jobs" className={styles.searchBar}>
      <input type="text" name="keyword" placeholder="Search jobs..." defaultValue={keyword} aria-label="Search Jobs" />

      {/* Keep every selected filter when the user searches for another keyword */}
      {locations.map((value) => <input key={value} type="hidden" name="location" value={value} />)}
      {categories.map((value) => <input key={value} type="hidden" name="category" value={value} />)}
      {employmentTypes.map((value) => <input key={value} type="hidden" name="employmentType" value={value} />)}

      <button type="submit">Search</button>
    </form>
  )
}