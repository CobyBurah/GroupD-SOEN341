// Must match the status check constraint in supabase/migrations/0010_under_review_status.sql.
export const APPLICATION_STATUSES = ['Applied', 'Under Review', 'Interview', 'Offered', 'Rejected'] as const
export type ApplicationStatus = typeof APPLICATION_STATUSES[number]

export function isApplicationStatus(value: unknown): value is ApplicationStatus {
  return typeof value === 'string' && (APPLICATION_STATUSES as readonly string[]).includes(value)
}
