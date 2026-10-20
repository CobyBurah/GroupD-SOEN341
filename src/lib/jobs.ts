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

// Get all the jobs, going by the newest first.
// Used by the job listings page.
export async function getJobs() {
  // Connect to Supabase
  const supabase = await createClient()

  // Ask for all jobs, sorted by the newest date posted
  const result = await supabase
    .from('jobs')
    .select('*')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  // If something goes wrong, put a message
  if (result.error) {
    throw new Error('Could not load jobs: ' + result.error.message)
  }

  // Give back the list of jobs
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
