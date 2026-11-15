// Pure helpers for the recruiter dashboard (US-20). No database access, so they are unit tested directly.

type Posting = { id: string; archived_at: string | null }

// Split a recruiter's non-deleted postings into open and archived ones, keeping the given order.
// Archived postings are listed most recently archived first.
export function splitPostings<T extends Posting>(jobs: T[]): { active: T[]; archived: T[] } {
  const active = jobs.filter(job => !job.archived_at)
  const archived = jobs.filter(job => job.archived_at)
    .sort((a, b) => (b.archived_at ?? '').localeCompare(a.archived_at ?? ''))
  return { active, archived }
}

// Number of applications received per posting id.
export function countApplicationsByJob(rows: { job_id: string | null }[]): Map<string, number> {
  const counts = new Map<string, number>()
  for (const { job_id } of rows) {
    if (job_id) counts.set(job_id, (counts.get(job_id) ?? 0) + 1)
  }
  return counts
}
