'use client'

import { useActionState } from 'react'

import type { PasswordState } from '@/lib/passwords'

import styles from '../ui.module.css'

import { resetPassword } from './actions'

const initialState: PasswordState = {}

export function ResetPasswordForm() {
  const [state, formAction, pending] = useActionState(resetPassword, initialState)
  const errors = state.errors ?? {}

  return (
    <form action={formAction} className={styles.form} noValidate>
      <div>
        <label htmlFor="password">New password</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          aria-invalid={!!errors.password}
          required
        />
        {errors.password && <p role="alert">{errors.password}</p>}
      </div>

      <div>
        <label htmlFor="confirmPassword">Confirm new password</label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          aria-invalid={!!errors.confirmPassword}
          required
        />
        {errors.confirmPassword && <p role="alert">{errors.confirmPassword}</p>}
      </div>

      {state.message && <p aria-live="polite">{state.message}</p>}

      <button type="submit" disabled={pending}>
        {pending ? 'Saving…' : 'Set new password'}
      </button>
    </form>
  )
}
