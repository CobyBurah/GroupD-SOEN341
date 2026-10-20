export const PASSWORD_MIN_LENGTH = 8

export type PasswordState = {
  errors?: { password?: string; confirmPassword?: string }
  message?: string
}

// Shared by the signed-in password change and the forgot-password reset so the rules match.
export function validateNewPassword(formData: FormData) {
  const password = String(formData.get('password') ?? '')
  const confirmPassword = String(formData.get('confirmPassword') ?? '')

  const errors: NonNullable<PasswordState['errors']> = {}
  if (password.length < PASSWORD_MIN_LENGTH) {
    errors.password = `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`
  }
  if (password !== confirmPassword) errors.confirmPassword = 'Passwords do not match.'

  return { password, errors, valid: Object.keys(errors).length === 0 }
}

// Only same-origin paths, so a crafted email link can't bounce users to another site.
export function safeNextPath(next: string | null, fallback = '/') {
  if (!next || !next.startsWith('/') || next.startsWith('//') || next.startsWith('/\\')) {
    return fallback
  }
  return next
}
