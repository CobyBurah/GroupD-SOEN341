'use client'

import { useActionState, useState } from 'react'

import {
  MAX_RESUME_NAME_LENGTH,
  MAX_RESUME_SIZE_BYTES,
  MAX_RESUMES_PER_UPLOAD,
  MAX_UPLOAD_TOTAL_BYTES,
  formatFileSize,
} from '@/lib/resumes'
import styles from '@/app/ui.module.css'

import {
  deleteResume,
  renameResume,
  replaceResume,
  uploadResume,
  type DeleteResumeState,
  type RenameResumeState,
  type ReplaceResumeState,
  type UploadResumeState,
} from './actions'

// A request over serverActions.bodySizeLimit (next.config.ts) fails before our
// action's own checks can return a friendly message, so reject oversized
// selections client-side before they're sent.
function rejectOversizedFiles(
  event: React.FormEvent<HTMLFormElement>,
  inputName: string
): string | null {
  const fileInput = event.currentTarget.elements.namedItem(inputName)
  const files = fileInput instanceof HTMLInputElement ? Array.from(fileInput.files ?? []) : []
  const error = oversizedFilesError(files)

  if (error) {
    event.preventDefault()
  }
  return error
}

function oversizedFilesError(files: File[]): string | null {
  if (files.length > MAX_RESUMES_PER_UPLOAD) {
    return `You can upload up to ${MAX_RESUMES_PER_UPLOAD} resumes at a time.`
  }

  const tooLarge = files.find((file) => file.size > MAX_RESUME_SIZE_BYTES)
  if (tooLarge) {
    const message = 'The file is too large. Maximum size is 5 MB.'
    return files.length > 1 ? `${tooLarge.name}: ${message}` : message
  }

  const totalBytes = files.reduce((sum, file) => sum + file.size, 0)
  if (totalBytes > MAX_UPLOAD_TOTAL_BYTES) {
    return 'Selected files exceed 25 MB in total. Upload fewer at a time.'
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
      onSubmit={(event) => setClientError(rejectOversizedFiles(event, 'files'))}
    >
      <label htmlFor="file">Upload resumes (PDF or DOCX, up to 5 MB each)</label>
      <input id="file" name="files" type="file" accept=".pdf,.docx" multiple required />

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

const initialRenameState: RenameResumeState = {}
const initialReplaceState: ReplaceResumeState = {}
const initialDeleteState: DeleteResumeState = {}

export function ResumeRow({ resume }: { resume: Resume }) {
  const [renameState, renameAction, renamePending] = useActionState(
    renameResume,
    initialRenameState
  )
  const [replaceState, replaceAction, replacePending] = useActionState(
    replaceResume,
    initialReplaceState
  )
  const [deleteState, deleteAction, deletePending] = useActionState(deleteResume, initialDeleteState)
  const [replaceClientError, setReplaceClientError] = useState<string | null>(null)

  return (
    <li className={`${styles.row} ${styles.resume}`}>
      <h2 className={styles.rowTitle}>
        <a href={`/resumes/${resume.id}/view`} target="_blank" rel="noopener noreferrer">
          {resume.file_name}
        </a>
      </h2>
      <div className={styles.pills}>
        <span className={styles.pill}>{formatFileSize(resume.size_bytes)}</span>
        <span className={styles.pill}>{new Date(resume.created_at).toLocaleDateString('en-CA', {timeZone: 'UTC'})}</span>
      </div>
      <form action={renameAction} key={`rename-${renameState.token ?? 'initial'}`}>
        <input type="hidden" name="resumeId" value={resume.id} />
        <div>
          <label htmlFor={`rename-${resume.id}`}>Resume name</label>
          <input
            id={`rename-${resume.id}`}
            name="fileName"
            type="text"
            defaultValue={resume.file_name}
            maxLength={MAX_RESUME_NAME_LENGTH}
            required
          />
        </div>
        {renameState.error && <p role="alert">{renameState.error}</p>}
        {renameState.message && <p aria-live="polite">{renameState.message}</p>}
        <button type="submit" className={styles.secondary} disabled={renamePending}>
          {renamePending ? 'Renaming…' : 'Rename'}
        </button>
      </form>

      <form
        action={replaceAction}
        key={replaceState.token ?? 'initial'}
        onSubmit={(event) => setReplaceClientError(rejectOversizedFiles(event, 'file'))}
      >
        <input type="hidden" name="resumeId" value={resume.id} />
        <div>
          <label htmlFor={`replace-${resume.id}`}>Replace file</label>
          <input id={`replace-${resume.id}`} name="file" type="file" accept=".pdf,.docx" required />
        </div>
        {replaceClientError && <p role="alert">{replaceClientError}</p>}
        {!replaceClientError && replaceState.error && <p role="alert">{replaceState.error}</p>}
        {!replaceClientError && replaceState.message && (
          <p aria-live="polite">{replaceState.message}</p>
        )}
        <button type="submit" className={styles.secondary} disabled={replacePending}>
          {replacePending ? 'Replacing…' : 'Replace'}
        </button>
      </form>

      <form
        action={deleteAction}
        onSubmit={(event) => {
          if (!window.confirm('Delete this resume from your list? Submitted applications keep their saved version.')) {
            event.preventDefault()
          }
        }}
      >
        <input type="hidden" name="resumeId" value={resume.id} />
        {deleteState.error && <p role="alert">{deleteState.error}</p>}
        <button type="submit" className={styles.danger} disabled={deletePending}>
          {deletePending ? 'Deleting…' : 'Delete'}
        </button>
      </form>
    </li>
  )
}
