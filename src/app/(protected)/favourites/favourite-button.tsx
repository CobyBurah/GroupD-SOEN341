'use client'

import { useActionState } from 'react'
import { toggleFavourite, type FavouriteState } from './actions'
import styles from '@/app/ui.module.css'

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      className={styles.icon}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 20s-7-4.4-9-9a4.8 4.8 0 0 1 9-3 4.8 4.8 0 0 1 9 3c-2 4.6-9 9-9 9Z" />
    </svg>
  )
}

// Heart toggle shown on job rows for job seekers.
export function FavouriteButton({ jobId, jobTitle, favourited }: { jobId: string; jobTitle: string; favourited: boolean }) {
  const [state, action, pending] = useActionState(toggleFavourite.bind(null, jobId), { favourited } as FavouriteState)
  const label = state.favourited ? `Remove ${jobTitle} from favourites` : `Add ${jobTitle} to favourites`
  return <form action={action} className={styles.favouriteForm}>
    <button
      type="submit"
      className={styles.secondary}
      disabled={pending}
      aria-label={label}
      aria-pressed={state.favourited}
      title={label}
    >
      <HeartIcon filled={state.favourited} />
      {state.favourited ? 'Saved' : 'Save'}
    </button>
    {state.message && <p role="alert">{state.message}</p>}
  </form>
}
