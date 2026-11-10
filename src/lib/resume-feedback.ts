export type ResumeFeedback = {
  summary: string
  strengths: string[]
  improvements: string[]
}

export type StoredResumeFeedback = {
  feedback: ResumeFeedback
  model: string
  createdAt: string
}

// Kept well under an 8B model's context window once the prompt is added.
export const MAX_RESUME_TEXT_CHARS = 12000
// Below this, extraction almost certainly failed (image-only scan, empty doc).
export const MIN_RESUME_TEXT_CHARS = 50
const MAX_ITEMS = 8
const MAX_ITEM_CHARS = 600
const MAX_SUMMARY_CHARS = 1500

// Passed to Ollama's `format` so the model is constrained to this shape.
export const RESUME_FEEDBACK_SCHEMA = {
  type: 'object',
  properties: {
    summary: { type: 'string' },
    strengths: { type: 'array', items: { type: 'string' } },
    improvements: { type: 'array', items: { type: 'string' } },
  },
  required: ['summary', 'strengths', 'improvements'],
} as const

export const RESUME_FEEDBACK_SYSTEM_PROMPT = [
  'You are an experienced technical recruiter reviewing a job seeker\'s resume.',
  'Give honest, specific, actionable feedback based only on the resume text provided.',
  'Never invent experience, employers, or skills that are not in the resume.',
  'Respond in JSON with: "summary" (2-4 sentences overall assessment),',
  '"strengths" (3-5 concrete things the resume does well),',
  'and "improvements" (3-6 concrete, actionable suggestions, e.g. quantify impact, tighten wording, fix formatting).',
].join(' ')

export function buildResumeFeedbackPrompt(resumeText: string): string {
  return `Review the following resume and respond with JSON only.\n\n--- RESUME START ---\n${resumeText}\n--- RESUME END ---`
}

export function prepareResumeText(raw: string): string {
  const normalized = raw.replace(/\r\n?/g, '\n').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim()
  return normalized.length > MAX_RESUME_TEXT_CHARS ? normalized.slice(0, MAX_RESUME_TEXT_CHARS) : normalized
}

function cleanList(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null
  const items = value
    .filter((item): item is string => typeof item === 'string')
    .map(item => item.trim())
    .filter(item => item.length > 0)
    .slice(0, MAX_ITEMS)
    .map(item => item.slice(0, MAX_ITEM_CHARS))
  return items
}

// Returns null rather than partially-valid feedback so callers surface an
// error instead of showing the user something the model didn't really say.
export function parseResumeFeedback(raw: unknown): ResumeFeedback | null {
  let value = raw
  if (typeof value === 'string') {
    try {
      value = JSON.parse(value)
    } catch {
      return null
    }
  }
  if (!value || typeof value !== 'object') return null
  const record = value as Record<string, unknown>
  if (typeof record.summary !== 'string') return null
  const summary = record.summary.trim().slice(0, MAX_SUMMARY_CHARS)
  const strengths = cleanList(record.strengths)
  const improvements = cleanList(record.improvements)
  if (!summary || !strengths || !improvements) return null
  if (strengths.length === 0 && improvements.length === 0) return null
  return { summary, strengths, improvements }
}
