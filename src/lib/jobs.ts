// Get jobs from the Supabase "jobs" table

import { createClient } from '@/lib/supabase/server'

// What one job looks like (same columns as the jobs table).
// "| null" means the value can be empty.
export type Job = {
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
export async function getJobs(keyword = '', location = '', categories: string[] = [], employmentTypes: string[] = [], workplaceTypes: string[] = []){
  //connecting to the supabase
  const supabase = await createClient()

  //only jobs that haven't been deleted
  let query = supabase.from('jobs').select('*').is('deleted_at', null)

  //if there's a keyword, only keep jobs whose title, company, category, location or employment type contains it
  if(keyword !== ''){
    const search = '"%' + keyword + '%"'
    const typeSearch = '"%' + keyword.replaceAll(' ', '_') + '%"'
    query = query.or('title.ilike.' + search + ',company.ilike.' + search + ',category.ilike.' + search + ',location.ilike.' + search + ',employment_type.ilike.' + typeSearch)
  }

  //if a location is entered, keep jobs whose location contains it
  if(location !== ''){
    query = query.ilike('location', `%${location}%`)
  }

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

  //sorting the newest first and send the question to Supabase
  const result = await query.order('created_at', {ascending: false})

  //If something goes wrong, then output an error message and stop
  if(result.error){
    throw new Error('Could not load job:' + result.error.message)
  }

  //giving back the list of jobs or an empty list if nothing matches what the user is searching
  const jobs: Job[] = result.data ?? []
  return jobs
}

// Get one job using its id.
// Used by the job details page.
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