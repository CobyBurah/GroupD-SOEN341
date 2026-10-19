import Link from 'next/link'

import { getJob } from '@/lib/jobs'

type JobDetailsPageProps = {
  params: Promise<{
    id: string
  }>
}

export default async function JobDetailsPage({
  params,
}: JobDetailsPageProps) {
  // Get the id from the URL. Example: /jobs/123 means id = 123
  const { id } = await params

  // Ask Supabase for the job that has this id
  const job = await getJob(id)

  // If no job exists with this id, show a basic error message
  if (!job) {
    return (
      <main>
        <h1>Job not found</h1>
        <Link href="/jobs">Back to Jobs</Link>
      </main>
    )
  }

  // Display the full information for the selected job
  return (
    <main>
      <Link href="/jobs">← Back to Jobs</Link>

      <h1>{job.title}</h1>

      <p>{job.company}</p>

      {job.location && (
        <p>
          <strong>Location:</strong> {job.location}
        </p>
      )}

      {job.category && (
        <p>
          <strong>Category:</strong> {job.category}
        </p>
      )}

      {job.employment_type && (
        <p>
          <strong>Employment Type:</strong>{' '}
          {job.employment_type.replace(/_/g, ' ')}
        </p>
      )}

      {job.salary && (
        <p>
          <strong>Salary:</strong> {job.salary}
        </p>
      )}

      <h2>Job Description</h2>
      <p>{job.description}</p>

      {/* Application functionality will be implemented separately */}
      <button type="button">
        Apply to Job
      </button>
    </main>
  )
}