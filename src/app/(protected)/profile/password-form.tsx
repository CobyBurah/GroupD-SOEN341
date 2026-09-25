'use client'

import { useActionState } from 'react'

import { updatePassword, type PasswordState } from './actions'

const initialState: PasswordState = {}

export function PasswordForm() {
  const [state, formAction, pending] = useActionState(updatePassword, initialState)
  const errors = state.errors ?? {}

  return (
    <form action={formAction} key={state.message} noValidate>
      <label htmlFor="password">New password:</label>
      <input
        id="password"
        name="password"
        type="password"
        autoComplete="new-password"
        minLength={8}
        required
      />
      {errors.password && <p role="alert">{errors.password}</p>}

      <label htmlFor="confirmPassword">Confirm new password:</label>
      <input
        id="confirmPassword"
        name="confirmPassword"
        type="password"
        autoComplete="new-password"
        required
      />
      {errors.confirmPassword && <p role="alert">{errors.confirmPassword}</p>}

      {state.message && <p aria-live="polite">{state.message}</p>}

      <button type="submit" disabled={pending}>
        {pending ? 'Saving…' : 'Update password'}
      </button>
    </form>
  )
}
