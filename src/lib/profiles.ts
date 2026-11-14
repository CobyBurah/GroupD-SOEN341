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

// Where each role lands after logging in or switching modes.
export function roleHome(role: Role): string {
  return role === 'recruiter' ? '/recruiter' : '/dashboard'
}

export function otherRole(role: Role): Role {
  return role === 'recruiter' ? 'job_seeker' : 'recruiter'
}

// profiles.roles lists every role the account may use (see 0018_dual_roles.sql).
export function parseRoles(value: unknown): Role[] {
  return Array.isArray(value) ? value.filter(isRole) : []
}

// Must match the check constraints added in supabase/migrations/0004_professional_profile.sql.
export const PROFILE_LIMITS = {
  headline: 120,
  location: 100,
  bio: 2000,
} as const
