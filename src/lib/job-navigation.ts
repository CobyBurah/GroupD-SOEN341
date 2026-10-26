// Only job listing URLs may be used by Back to Jobs links.
export function getJobsReturnUrl(value: string | string[] | undefined): string {
  return typeof value === 'string' && (value === '/jobs' || value.startsWith('/jobs?'))
    ? value
    : '/jobs'
}
