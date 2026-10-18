// Job listings page no style is added it just a basic page for now to show the jobs on the website
import { getJobs } from '@/lib/jobs' //take the getJobs function from the job.ts file

export default async function JobsPage() { //this is the page where Next.js shows it 
  const jobs = await getJobs() // ask Supabase for all jobs awaits = wait for answer/loading

  return ( //this is what is shown on the website screen basically like html
    <main>
      <h1>Available Jobs ({jobs.length})</h1> 
      <ul>
        {jobs.map((job) => (
          <li key={job.id}>
            {job.title}: {job.company}, {job.location}
          </li>
        ))}
      </ul>
    </main>
  )
}
