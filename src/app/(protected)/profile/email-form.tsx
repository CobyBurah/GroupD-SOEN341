'use client'

import { useActionState } from 'react'

import { updateEmail, type EmailState } from './actions'

export function EmailForm({ email }: { email: string }) {
  const initialState: EmailState = { values: { email } }
  const [state, formAction, pending] = useActionState(updateEmail, initialState)
  const values = state.values ?? { email }
  const errors = state.errors ?? {}

  return (
    // key remounts the form after each submit so defaultValue picks up the echoed values.
    <form action={formAction} key={JSON.stringify(values)} noValidate>
      <label htmlFor="email">Email:</label>
      <input
        id="email"
        name="email"
        type="email"
        autoComplete="email"
        defaultValue={values.email}
        required
      />
      {errors.email && <p role="alert">{errors.email}</p>}

      {state.message && <p aria-live="polite">{state.message}</p>}

      <button type="submit" disabled={pending}>
        {pending ? 'Saving…' : 'Update email'}
      </button>
    </form>
  )
}
