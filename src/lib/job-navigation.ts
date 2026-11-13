const RETURN_DESTINATIONS = [
  { path: '/jobs', label: '← Back to Jobs' },
  { path: '/applications', label: '← Back to My applications' },
  { path: '/favourites', label: '← Back to Favourites' },
]

// Return links stay within the lists that can open a job.
export function getJobsReturnUrl(value: string | string[] | undefined): string {
  return typeof value === 'string' && RETURN_DESTINATIONS.some(({ path }) => value === path || value.startsWith(`${path}?`))
    ? value
    : '/jobs'
}

export function getJobReturnLink(value: string | string[] | undefined) {
  const href = getJobsReturnUrl(value)
  return {
    href,
    label: RETURN_DESTINATIONS.find(({ path }) => href === path || href.startsWith(`${path}?`))!.label,
  }
}
