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
  category: string | null
  employment_type: string | null
  salary: string | null
  description: string
  created_at: string
  updated_at: string
}

export type JobFilterOptions = {
  locations: string[]
  categories: string[]
}

// Get the location and category choices used by the filtering sidebar.
export async function getJobFilterOptions(): Promise<JobFilterOptions> {
  const supabase = await createClient()

  const result = await supabase
    .from('jobs')
    .select('location, category')
    .is('deleted_at', null)

  if (result.error) {
    throw new Error('Could not load job filters: ' + result.error.message)
  }

  const jobs = result.data ?? []

  const locations = Array.from(
    new Set(
      jobs
        .map((job) => job.location)
        .filter((value): value is string => Boolean(value))
    )
  ).sort()

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
export async function getJobs(keyword = '', locations: string[] = [], categories: string[] = [], employmentTypes: string[] = []){
  //connecting to the supabase
  const supabase = await createClient()

  //only jobs that haven't been deleted
  let query = supabase.from('jobs').select('*').is('deleted_at', null)

  //if there's a keyword, only keep jobs whose title, category, location, employement type, contains it 
  if(keyword !== ''){
    const search = '"%' + keyword + '%"' // the quotes let the keyword contain comas, like "Montreal,QC"
    const typeSearch = '"%' + keyword.replaceAll(' ', '_') + '%"' //for employment types bc they are saved with full_time if user tries full time it wont work so now it would work 
    //.or() means it can match any of the searchable job fields
    query = query.or('title.ilike.' + search + ',company.ilike.' + search + ',category.ilike.' + search + ',location.ilike.' + search + ',employment_type.ilike.' + typeSearch) //ilike means "contains" while ignoring the captial letters
  }

  //if locations are selected, keep jobs matching any of those locations
  if(locations.length > 0){
    query = query.in('location', locations)
  }

  //if employment types are selected, keep jobs matching any of those types
  if(employmentTypes.length > 0){
    query = query.in('employment_type', employmentTypes)
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
  // methods from Supabase lib
  const result = await supabase
    .from('jobs')
    .select('*')
    .is('deleted_at', null)
    .eq('id', id)
    .maybeSingle()

  // If the id isn't valid id then it will give back null
  // so the page will show the error
  if (result.error) {
    if(result.error.code === '22P02'){
      return null
    }
    throw new Error('Could not load job: '+ result.error.message)
  }

  // Return back the job and if it no job has that id then null 
  const job: Job | null = result.data
  return job
}