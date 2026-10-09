'use client'

import { useActionState } from 'react'

import { PROFILE_LIMITS, type Role } from '@/lib/profiles'

import { updateProfile, type ProfileState } from './actions'

type ProfileFormProps = {
  role: Role
  fullName: string
  headline: string
  location: string
  bio: string
}

export function ProfileForm({ role, fullName, headline, location, bio }: ProfileFormProps) {
  const initialState: ProfileState = { values: { fullName, headline, location, bio } }
  const [state, formAction, pending] = useActionState(updateProfile, initialState)
  const values = state.values ?? { fullName, headline, location, bio }
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

      {role === 'job_seeker' && (
        <>
          <label htmlFor="headline">Headline:</label>
          <input
            id="headline"
            name="headline"
            type="text"
            maxLength={PROFILE_LIMITS.headline}
            defaultValue={values.headline}
          />
          {errors.headline && <p role="alert">{errors.headline}</p>}

          <label htmlFor="location">Location:</label>
          <input
            id="location"
            name="location"
            type="text"
            maxLength={PROFILE_LIMITS.location}
            defaultValue={values.location}
          />
          {errors.location && <p role="alert">{errors.location}</p>}

          <label htmlFor="bio">Bio:</label>
          <textarea id="bio" name="bio" maxLength={PROFILE_LIMITS.bio} defaultValue={values.bio} />
          {errors.bio && <p role="alert">{errors.bio}</p>}
        </>
      )}

      {state.message && <p aria-live="polite">{state.message}</p>}

      <button type="submit" disabled={pending}>
        {pending ? 'Saving…' : 'Save'}
      </button>
    </form>
  )
}
