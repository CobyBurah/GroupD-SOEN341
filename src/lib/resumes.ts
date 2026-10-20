// Must match the bucket config in supabase/migrations/0005_resumes.sql.
export const RESUME_BUCKET = 'resumes'
export const MAX_RESUME_SIZE_BYTES = 5 * 1024 * 1024
export const MAX_RESUMES_PER_UPLOAD = 10
// Must stay below serverActions.bodySizeLimit in next.config.ts.
export const MAX_UPLOAD_TOTAL_BYTES = 25 * 1024 * 1024

const RESUME_TYPES = {
  pdf: {
    mimeType: 'application/pdf',
    // "%PDF-"
    signature: [0x25, 0x50, 0x44, 0x46, 0x2d],
  },
  docx: {
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    // DOCX files are zip archives, so this only rules out non-zip content
    // (e.g. a .txt renamed to .docx), not a zip renamed to .docx.
    signature: [0x50, 0x4b, 0x03, 0x04],
  },
} as const

type ResumeExtension = keyof typeof RESUME_TYPES

export type ResumeValidation =
  | { ok: true; extension: ResumeExtension; mimeType: string }
  | { ok: false; error: string }

function extensionFromName(name: string): ResumeExtension | null {
  const lower = name.toLowerCase()
  if (lower.endsWith('.pdf')) return 'pdf'
  if (lower.endsWith('.docx')) return 'docx'
  return null
}

export async function validateResume(file: File | null | undefined): Promise<ResumeValidation> {
  if (!file || !file.name) {
    return { ok: false, error: 'Choose a file to upload.' }
  }

  if (file.size === 0) {
    return { ok: false, error: 'The file is empty.' }
  }

  if (file.size > MAX_RESUME_SIZE_BYTES) {
    return { ok: false, error: 'The file is too large. Maximum size is 5 MB.' }
  }

  const extension = extensionFromName(file.name)
  if (!extension) {
    return { ok: false, error: 'Unsupported file type. Upload a .pdf or .docx file.' }
  }

  const { mimeType, signature } = RESUME_TYPES[extension]
  const header = new Uint8Array(await file.slice(0, signature.length).arrayBuffer())
  const matchesSignature = signature.every((byte, index) => header[index] === byte)

  if (!matchesSignature) {
    return { ok: false, error: `This does not look like a valid .${extension} file.` }
  }

  return { ok: true, extension, mimeType }
}

export const MAX_RESUME_NAME_LENGTH = 120

export type ResumeNameValidation = { ok: true; name: string } | { ok: false; error: string }

export function validateResumeName(raw: unknown): ResumeNameValidation {
  const name = typeof raw === 'string' ? raw.trim() : ''

  if (!name) {
    return { ok: false, error: 'Enter a name for the resume.' }
  }

  if (name.length > MAX_RESUME_NAME_LENGTH) {
    return { ok: false, error: `Name must be ${MAX_RESUME_NAME_LENGTH} characters or fewer.` }
  }

  if (/[\u0000-\u001f\u007f/\\]/.test(name)) {
    return { ok: false, error: 'Name cannot contain slashes or control characters.' }
  }

  return { ok: true, name }
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
