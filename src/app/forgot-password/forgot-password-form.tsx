'use client'

import { useActionState } from 'react'

import styles from '../ui.module.css'

import { requestPasswordReset, type ForgotPasswordState } from './actions'

const initialState: ForgotPasswordState = {}

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(requestPasswordReset, initialState)
  const errors = state.errors ?? {}

  return (
    <form action={formAction} className={styles.form} key={JSON.stringify(state)} noValidate>
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={state.values?.email}
          aria-invalid={!!errors.email}
          required
        />
        {errors.email && <p role="alert">{errors.email}</p>}
      </div>

      {state.message && <p aria-live="polite">{state.message}</p>}

      <button type="submit" disabled={pending}>
        {pending ? 'Sending…' : 'Send reset link'}
      </button>
    </form>
  )
}
