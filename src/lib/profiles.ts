// Must match the public.user_role enum in supabase/migrations/0001_profiles.sql.
export const ROLES = ['job_seeker', 'recruiter'] as const

export type Role = (typeof ROLES)[number]

export const ROLE_LABELS: Record<Role, string> = {
  job_seeker: 'Job Seeker',
  recruiter: 'Recruiter',
}

export function isRole(value: unknown): value is Role {
  return ROLES.includes(value as Role)
}
