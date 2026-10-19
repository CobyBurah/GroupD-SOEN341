'use client'

import { useActionState } from 'react'

import { ROLE_LABELS, ROLES } from '@/lib/profiles'

import styles from '../ui.module.css'

import { signup, type SignupState } from './actions'

const initialState: SignupState = {}

export function SignupForm() {
  const [state, formAction, pending] = useActionState(signup, initialState)
  const values = state.values
  const errors = state.errors ?? {}

  return (
    // key remounts the form after each submit so defaultValue picks up the echoed values.
    <form action={formAction} className={styles.form} key={JSON.stringify(values)} noValidate>
      <div>
        <label htmlFor="fullName">Full name</label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          autoComplete="name"
          defaultValue={values?.fullName}
          aria-invalid={!!errors.fullName}
          required
        />
        {errors.fullName && <p role="alert">{errors.fullName}</p>}
      </div>

      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={values?.email}
          aria-invalid={!!errors.email}
          required
        />
        {errors.email && <p role="alert">{errors.email}</p>}
      </div>

      <div>
        <label htmlFor="password">Password</label>
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
        <label htmlFor="confirmPassword">Confirm password</label>
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

      <fieldset>
        <legend>I am a</legend>
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
