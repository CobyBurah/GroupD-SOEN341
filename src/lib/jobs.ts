// Get jobs from the Supabase "jobs" table

import { createClient } from '@/lib/supabase/server'
import { EMPLOYMENT_TYPES, WORKPLACE_TYPES, todayUtc } from '@/lib/job-posting'
import { normalizeSearchText, escapeLikePattern, escapeRegexPattern, locationWordPatterns } from '@/lib/job-search'

export { normalizeSearchText, escapeLikePattern } from '@/lib/job-search'

export const JOBS_PER_PAGE = 10

// PostgREST turns * into % for ILIKE, so use a literal regex for that character.
// SQL pattern escaping and PostgREST quoted-value escaping are separate layers.
function quotedSearchPattern(value: string, regex: boolean): string {
  const pattern = regex ? escapeRegexPattern(value) : '%' + escapeLikePattern(value) + '%'
  return quoteFilterValue(pattern)
}

function quoteFilterValue(pattern: string): string {
  return '"' + pattern.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"'
}

// What one job looks like (same columns as the jobs table).
// "| null" means the value can be empty.
export type Job = {
  application_deadline: string | null
  // Set when the recruiter archives (closes) the posting; null while it is open.
  archived_at: string | null
  id: string
  recruiter_id: string
  title: string
  company: string
  location: string | null
  location_city: string | null
  location_region: string | null
  location_country: string | null
  category: string | null
  employment_type: string | null
  workplace_type: string | null
  salary: string | null
  description: string
  created_at: string
  updated_at: string
}

// PostgREST or() filter for postings that are still open: no deadline, or a
// deadline of today or later (UTC). A posting leaves the listings the day after
// its deadline, matching isPastDeadline() in job-posting.ts.
export function openDeadlineFilter(today: string = todayUtc()): string {
  return `application_deadline.is.null,application_deadline.gte.${today}`
}

export type JobFilterOptions = {
  locations: string[]
  categories: string[]
}

// Get the location and category choices used by the jobs page.
export async function getJobFilterOptions(): Promise<JobFilterOptions> {
  const supabase = await createClient()

  const result = await supabase
    .from('jobs')
    .select('location, location_region, location_country, category')
    .is('deleted_at', null)
    .is('archived_at', null)
    .or(openDeadlineFilter())

  if (result.error) {
    throw new Error('Could not load job filters: ' + result.error.message)
  }

  const jobs = result.data ?? []
  const locationOptions = new Set<string>()

  jobs.forEach((job) => {
    if(job.location) locationOptions.add(job.location)
    if(job.location_region && job.location_country) locationOptions.add(`${job.location_region}, ${job.location_country}`)
    if(job.location_country) locationOptions.add(job.location_country)
  })

  const locations = Array.from(locationOptions).sort()

  const categories = Array.from(
    new Set(
      jobs
        .map((job) => job.category)
        .filter((value): value is string => Boolean(value))
    )
  ).sort()

  return { locations, categories }
}

//what the user will be able to SEARCH OR FILTER by
//if a part is empty it will just ignore it
export async function getJobs(keyword = '', location = '', categories: string[] = [], employmentTypes: string[] = [], workplaceTypes: string[] = [], page = 1){
  //connecting to the supabase
  const supabase = await createClient()

  //only jobs that haven't been deleted, archived (closed) or passed their deadline
  let query = supabase.from('jobs').select('*', {count: 'exact'}).is('deleted_at', null).is('archived_at', null)

  // Every keyword term is required, but each can match a different field.
  // Punctuation within terms stays literal, including SQL/PostgREST symbols.
  const searchTerms = normalizeSearchText(keyword).split(' ').filter(Boolean)
  const searchFilters = searchTerms.map(term => {
    const regex = term.includes('*')
    const operator = regex ? 'imatch' : 'ilike'
    const search = quotedSearchPattern(term, regex)
    const conditions = [
      ['title', search], ['company', search], ['category', search], ['location', search],
    ].map(([column, pattern]) => column + '.' + operator + '.' + pattern)
    const labelSearch = term.toLowerCase()
    const matchingEmploymentTypes = Object.entries(EMPLOYMENT_TYPES)
      .filter(([, label]) => label.toLowerCase().includes(labelSearch))
      .map(([value]) => value)
    // Keep "on site" and "onsite" as aliases for the visible "On-site" label.
    const workplaceAlias = labelSearch.replaceAll(' ', '').replaceAll('-', '')
    const matchingWorkplaceTypes = Object.entries(WORKPLACE_TYPES)
      .filter(([, label]) => label.toLowerCase().includes(labelSearch) ||
        (workplaceAlias !== '' && label.toLowerCase().replaceAll('-', '').includes(workplaceAlias)))
      .map(([value]) => value)
    // These values come from the fixed label maps, never from raw user input.
    if (matchingEmploymentTypes.length) conditions.push('employment_type.in.(' + matchingEmploymentTypes.join(',') + ')')
    if (matchingWorkplaceTypes.length) conditions.push('workplace_type.in.(' + matchingWorkplaceTypes.join(',') + ')')
    return 'or(' + conditions.join(',') + ')'
  })

  // Keep phrase matches and also allow location word prefixes in any order,
  // across structured components or the full location of older postings.
  const locationText = normalizeSearchText(location)
  const locationPatterns = locationWordPatterns(locationText)
  if (locationPatterns.length) {
    const operator = locationText.includes('*') ? 'imatch' : 'ilike'
    const phrase = 'location.' + operator + '.' + quotedSearchPattern(locationText, operator === 'imatch')
    const words = locationPatterns.map(pattern => 'or(' +
      ['location', 'location_city', 'location_region', 'location_country']
        .map(column => column + '.imatch.' + quoteFilterValue(pattern)).join(',') + ')')
    searchFilters.push('or(' + phrase + ',and(' + words.join(',') + '))')
  } else if(locationText !== ''){
    query = locationText.includes('*')
      ? query.regexIMatch('location', escapeRegexPattern(locationText))
      : query.ilike('location', '%' + escapeLikePattern(locationText) + '%')
  }

  // Build one logical filter so keyword and location groups stay ANDed.
  if (searchFilters.length === 1) query = query.or(searchFilters[0].slice(3, -1))
  else if (searchFilters.length > 1) query = query.or('and(' + searchFilters.join(',') + ')')

  // PostgREST ANDs separate or= parameters, so this cannot widen the search.
  query = query.or(openDeadlineFilter())

  //if employment types are selected, keep jobs matching any of those types
  if(employmentTypes.length > 0){
    query = query.in('employment_type', employmentTypes)
  }

  //if workplace types are selected, keep jobs matching any of those types
  if(workplaceTypes.length > 0){
    query = query.in('workplace_type', workplaceTypes)
  }

  //if categories are selected, keep jobs matching any of those categories
  if(categories.length > 0){
    query = query.in('category', categories)
  }

  // Get the matching count with a safe first-page range before using any
  // requested offset. This also supplies the fallback for invalid pages.
  query = query.order('created_at', {ascending: false}).order('id', {ascending: true})
  let result = await query.range(0, JOBS_PER_PAGE - 1)
  let resolvedPage = 1

  if (!result.error && Number.isSafeInteger(page) && page > 1 &&
      page <= Math.ceil((result.count ?? 0) / JOBS_PER_PAGE)) {
    const firstJob = (page - 1) * JOBS_PER_PAGE
    const lastJob = firstJob + JOBS_PER_PAGE - 1
    // Keep offsets within PostgreSQL's signed integer range as well.
    if (Number.isSafeInteger(lastJob) && lastJob <= 2_147_483_647) {
      const requested = await query.range(firstJob, lastJob)
      // Results can shrink between queries. Treat an unsatisfiable range as
      // page 1 too, but keep surfacing unrelated database errors.
      if (requested.error?.code !== 'PGRST103' &&
          (requested.error || (requested.data?.length ?? 0) > 0)) {
        result = requested
        resolvedPage = page
      }
    }
  }

  //If something goes wrong, then output an error message and stop
  if(result.error){
    throw new Error('Could not load job:' + result.error.message)
  }

  //giving back the jobs on this page and the total number of matching jobs
  const jobs: Job[] = result.data ?? []
  const total = result.count ?? 0

  return { jobs, total, page: resolvedPage }
}

// Get one job using its id.
// Used by the job details page. Archived jobs are still returned so seekers who
// applied can open them; the page shows them as closed.
export async function getJob(id: string) {
  // Connect to Supabase
  const supabase = await createClient()

  // Ask for the job with this id (or nothing if it doesn't exist)
  const result = await supabase
    .from('jobs')
    .select('*')
    .is('deleted_at', null)
    .eq('id', id)
    .maybeSingle()

  if (result.error) {
    if(result.error.code === '22P02'){
      return null
    }
    throw new Error('Could not load job: '+ result.error.message)
  }

  const job: Job | null = result.data
  return job
}
