'use client'

import { useActionState } from 'react'

import { updateProfile, type ProfileState } from './actions'

export function ProfileForm({ fullName }: { fullName: string }) {
  const initialState: ProfileState = { values: { fullName } }
  const [state, formAction, pending] = useActionState(updateProfile, initialState)
  const values = state.values ?? { fullName }
  const errors = state.errors ?? {}

  return (
    // key remounts the form after each submit so defaultValue picks up the echoed values.
    <form action={formAction} key={JSON.stringify(values)} noValidate>
      <label htmlFor="fullName">Full name:</label>
      <input
        id="fullName"
        name="fullName"
        type="text"
        autoComplete="name"
        defaultValue={values.fullName}
        required
      />
      {errors.fullName && <p role="alert">{errors.fullName}</p>}

      {state.message && <p aria-live="polite">{state.message}</p>}

      <button type="submit" disabled={pending}>
        {pending ? 'Saving…' : 'Save'}
      </button>
    </form>
  )
}
