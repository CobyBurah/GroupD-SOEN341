'use client'

import { useActionState } from 'react'

import { ROLE_LABELS, ROLES } from '@/lib/profiles'

import { signup, type SignupState } from './actions'

const initialState: SignupState = {}

export function SignupForm() {
  const [state, formAction, pending] = useActionState(signup, initialState)
  const values = state.values
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
        defaultValue={values?.fullName}
        required
      />
      {errors.fullName && <p role="alert">{errors.fullName}</p>}

      <label htmlFor="email">Email:</label>
      <input
        id="email"
        name="email"
        type="email"
        autoComplete="email"
        defaultValue={values?.email}
        required
      />
      {errors.email && <p role="alert">{errors.email}</p>}

      <label htmlFor="password">Password:</label>
      <input
        id="password"
        name="password"
        type="password"
        autoComplete="new-password"
        minLength={8}
        required
      />
      {errors.password && <p role="alert">{errors.password}</p>}

      <label htmlFor="confirmPassword">Confirm password:</label>
      <input
        id="confirmPassword"
        name="confirmPassword"
        type="password"
        autoComplete="new-password"
        required
      />
      {errors.confirmPassword && <p role="alert">{errors.confirmPassword}</p>}

      <fieldset>
        <legend>I am a:</legend>
        {ROLES.map((role) => (
          <label key={role}>
            <input
              type="radio"
              name="role"
              value={role}
              defaultChecked={(values?.role ?? 'job_seeker') === role}
            />
            {ROLE_LABELS[role]}
          </label>
        ))}
      </fieldset>
      {errors.role && <p role="alert">{errors.role}</p>}

      {state.message && <p aria-live="polite">{state.message}</p>}

      <button type="submit" disabled={pending}>
        {pending ? 'Creating account…' : 'Sign up'}
      </button>
    </form>
  )
}
