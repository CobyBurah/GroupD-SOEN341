// Must match the status check constraint in supabase/migrations/0008_applications.sql.
export const APPLICATION_STATUSES = ['Applied', 'Interview', 'Offered', 'Rejected'] as const
export type ApplicationStatus = typeof APPLICATION_STATUSES[number]

export function isApplicationStatus(value: unknown): value is ApplicationStatus {
  return typeof value === 'string' && (APPLICATION_STATUSES as readonly string[]).includes(value)
}
