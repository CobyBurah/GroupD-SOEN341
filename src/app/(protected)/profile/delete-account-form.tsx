'use client'

import { useActionState } from 'react'

import { deleteAccount, type DeleteAccountState } from './actions'

const initialState: DeleteAccountState = {}

export function DeleteAccountForm() {
  const [state, formAction, pending] = useActionState(deleteAccount, initialState)

  return (
    <form action={formAction}>
      <label>
        <input type="checkbox" name="confirmDelete" required />
        I understand this is permanent and cannot be undone.
      </label>

      {state.message && <p role="alert">{state.message}</p>}

      <button type="submit" disabled={pending}>
        {pending ? 'Deleting…' : 'Delete my account'}
      </button>
    </form>
  )
}
