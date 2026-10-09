'use client'

import { useActionState, useState } from 'react'

import { MAX_RESUME_SIZE_BYTES, formatFileSize } from '@/lib/resumes'

import {
  deleteResume,
  replaceResume,
  uploadResume,
  type DeleteResumeState,
  type ReplaceResumeState,
  type UploadResumeState,
} from './actions'

// A file at or near the serverActions.bodySizeLimit (next.config.ts) makes
// the whole request fail before our action's own size check can return a
// friendly message, so reject oversized files client-side before they're sent.
function rejectOversizedFile(event: React.FormEvent<HTMLFormElement>): string | null {
  const fileInput = event.currentTarget.elements.namedItem('file')
  const file = fileInput instanceof HTMLInputElement ? fileInput.files?.[0] : null

  if (file && file.size > MAX_RESUME_SIZE_BYTES) {
    event.preventDefault()
    return 'The file is too large. Maximum size is 5 MB.'
  }
  return null
}

const initialUploadState: UploadResumeState = {}

export function ResumeUploadForm() {
  const [state, formAction, pending] = useActionState(uploadResume, initialUploadState)
  const [clientError, setClientError] = useState<string | null>(null)

  return (
    // key remounts the form after each submit, which clears the file input.
    <form
      action={formAction}
      key={state.token ?? 'initial'}
      onSubmit={(event) => setClientError(rejectOversizedFile(event))}
    >
      <label htmlFor="file">Upload a resume (PDF or DOCX, up to 5 MB):</label>
      <input id="file" name="file" type="file" accept=".pdf,.docx" required />

      {clientError && <p role="alert">{clientError}</p>}
      {!clientError && state.error && <p role="alert">{state.error}</p>}
      {!clientError && state.message && <p aria-live="polite">{state.message}</p>}

      <button type="submit" disabled={pending}>
        {pending ? 'Uploading…' : 'Upload'}
      </button>
    </form>
  )
}

type Resume = {
  id: string
  file_name: string
  size_bytes: number
  created_at: string
}

const initialReplaceState: ReplaceResumeState = {}
const initialDeleteState: DeleteResumeState = {}

export function ResumeRow({ resume }: { resume: Resume }) {
  const [replaceState, replaceAction, replacePending] = useActionState(
    replaceResume,
    initialReplaceState
  )
  const [deleteState, deleteAction, deletePending] = useActionState(deleteResume, initialDeleteState)
  const [replaceClientError, setReplaceClientError] = useState<string | null>(null)

  return (
    <li>
      <a href={`/resumes/${resume.id}/view`} target="_blank" rel="noopener noreferrer">
        {resume.file_name}
      </a>{' '}
      — {formatFileSize(resume.size_bytes)} — {new Date(resume.created_at).toLocaleDateString()}
      <form
        action={replaceAction}
        key={replaceState.token ?? 'initial'}
        onSubmit={(event) => setReplaceClientError(rejectOversizedFile(event))}
      >
        <input type="hidden" name="resumeId" value={resume.id} />
        <label htmlFor={`replace-${resume.id}`}>Replace file:</label>
        <input id={`replace-${resume.id}`} name="file" type="file" accept=".pdf,.docx" required />
        {replaceClientError && <p role="alert">{replaceClientError}</p>}
        {!replaceClientError && replaceState.error && <p role="alert">{replaceState.error}</p>}
        {!replaceClientError && replaceState.message && (
          <p aria-live="polite">{replaceState.message}</p>
        )}
        <button type="submit" disabled={replacePending}>
          {replacePending ? 'Replacing…' : 'Replace'}
        </button>
      </form>

      <form
        action={deleteAction}
        onSubmit={(event) => {
          if (!window.confirm('Delete this resume? This cannot be undone.')) {
            event.preventDefault()
          }
        }}
      >
        <input type="hidden" name="resumeId" value={resume.id} />
        {deleteState.error && <p role="alert">{deleteState.error}</p>}
        <button type="submit" disabled={deletePending}>
          {deletePending ? 'Deleting…' : 'Delete'}
        </button>
      </form>
    </li>
  )
}
