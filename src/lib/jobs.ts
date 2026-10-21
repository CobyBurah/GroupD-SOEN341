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
//what the user will be able to SEARCH OR FILTER by
//if a part is empty it will just ignore it 
export async function getJobs(keyword = '', location = '', category='', employmentType = ''){
  //connecting to the supabase
  const supabase = await createClient()

  //only jobs that haven't been deleted
  let query = supabase.from('jobs').select('*').is('deleted_at', null)

  //if there's a keyword, only keep jobs whose title contains it 
  if(keyword !== ''){
    const search = '"%' + keyword + '%"' // the quotes let the keyword contain comas, like "Montreal,QC"
    //.or() means that it matchs any of the title or category or location
    query = query.or('title.ilike.' + search + ',company.ilike.' + search + ',category.ilike.' + search + ',location.ilike.' + search) //ilike means "contains" while ignoring the captial letters
  }
  
  //if there's a location, only keep jobs who's location is in that exact location
  if(location !== ''){
    query = query.eq('location', location)
  }
if (employmentType !== '') {
  query = query.eq('employment_type', employmentType)
}
  //if there's a category, only keep the jobs who's in that exact category
  if(category !== ''){
    query = query.eq('category', category)
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
    if(result.error.code === '22P02'){ //'22P02' is the error code: that the text can't be returned, this comes from the error list of codes of PostgreSQL (inside supabase)
       return null 
    }
    throw new Error('Could not load job: '+ result.error.message)
  }
  // Return back the job and if it no job has that id then null 
  const job: Job | null = result.data
  return job
}
