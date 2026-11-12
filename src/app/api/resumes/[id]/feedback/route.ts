import { NextResponse } from 'next/server'
import { isJobId } from '@/lib/job-posting'
import { OllamaInvalidResponseError, OllamaUnavailableError, getOllamaConfig, requestResumeFeedback } from '@/lib/ollama'
import { MIN_RESUME_TEXT_CHARS, parseResumeFeedback, prepareResumeText, type StoredResumeFeedback } from '@/lib/resume-feedback'
import { ResumeTextExtractionError, UnsupportedResumeTypeError, extractResumeText } from '@/lib/resume-text'
import { RESUME_BUCKET } from '@/lib/resumes'
import { createClient } from '@/lib/supabase/server'

// PDF/DOCX parsing needs Node APIs (Buffer, pdf.js).
export const runtime = 'nodejs'

type ErrorCode = 'unauthorized' | 'not_found' | 'unreadable' | 'ai_unavailable' | 'ai_invalid' | 'save_failed'

const MESSAGES: Record<ErrorCode, string> = {
  unauthorized: 'You must be signed in to do that.',
  not_found: 'Resume not found.',
  unreadable: "We couldn't read any text from this resume. Make sure it's a text-based PDF or DOCX (not a scanned image).",
  ai_unavailable: 'The AI feedback service is unavailable right now. Please try again later.',
  ai_invalid: "The AI returned feedback we couldn't understand. Please try again.",
  save_failed: "Feedback was generated but couldn't be saved. Please try again.",
}

const STATUS: Record<ErrorCode, number> = {
  unauthorized: 401,
  not_found: 404,
  unreadable: 422,
  ai_unavailable: 503,
  ai_invalid: 502,
  save_failed: 500,
}

function errorResponse(code: ErrorCode) {
  return NextResponse.json({ error: MESSAGES[code], code }, { status: STATUS[code] })
}

// Latest saved feedback for one of the signed-in user's resumes. Route
// handlers are not covered by the protected layout, so ownership comes from
// the session-scoped client and RLS.
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!isJobId(id)) return errorResponse('not_found')
  const supabase = await createClient()
  const { data: claims } = await supabase.auth.getClaims()
  if (!claims?.claims.sub) return errorResponse('unauthorized')

  const { data: resume, error: resumeError } = await supabase.from('resumes').select('id').eq('id', id).maybeSingle()
  if (resumeError || !resume) return errorResponse('not_found')

  const { data: rows, error } = await supabase.from('resume_feedback')
    .select('feedback, model_name, created_at').eq('resume_id', id)
    .order('created_at', { ascending: false }).limit(1)
  if (error) {
    // e.g. migration 0016 not applied yet: behave as "no feedback yet".
    console.error('Failed to load resume feedback', error)
    return NextResponse.json({ feedback: null })
  }

  const row = rows?.[0]
  const parsed = row ? parseResumeFeedback(row.feedback) : null
  const feedback: StoredResumeFeedback | null = row && parsed
    ? { feedback: parsed, model: row.model_name, createdAt: row.created_at }
    : null
  return NextResponse.json({ feedback })
}

// Generates new feedback with the local Ollama model and saves it.
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!isJobId(id)) return errorResponse('not_found')
  const supabase = await createClient()
  const { data: claims } = await supabase.auth.getClaims()
  const userId = claims?.claims.sub
  if (!userId) return errorResponse('unauthorized')

  const { data: resume, error: resumeError } = await supabase.from('resumes')
    .select('storage_path, mime_type').eq('id', id).maybeSingle()
  if (resumeError || !resume) return errorResponse('not_found')

  const { data: file, error: downloadError } = await supabase.storage.from(RESUME_BUCKET).download(resume.storage_path)
  if (downloadError || !file) {
    console.error('Failed to download resume for feedback', downloadError)
    return errorResponse('not_found')
  }

  let prepared: string
  try {
    const text = await extractResumeText(new Uint8Array(await file.arrayBuffer()), resume.mime_type)
    prepared = prepareResumeText(text)
  } catch (error) {
    if (error instanceof UnsupportedResumeTypeError || error instanceof ResumeTextExtractionError) {
      console.error('Failed to extract resume text', error)
      return errorResponse('unreadable')
    }
    throw error
  }
  if (prepared.length < MIN_RESUME_TEXT_CHARS) return errorResponse('unreadable')

  const config = getOllamaConfig()
  let result
  try {
    result = await requestResumeFeedback(prepared, config)
  } catch (error) {
    console.error('Resume feedback request failed', error)
    if (error instanceof OllamaUnavailableError) return errorResponse('ai_unavailable')
    if (error instanceof OllamaInvalidResponseError) return errorResponse('ai_invalid')
    throw error
  }

  const { data: saved, error: saveError } = await supabase.from('resume_feedback')
    .insert({ resume_id: id, user_id: userId, model_name: config.model, feedback: result })
    .select('created_at').single()
  if (saveError || !saved) {
    console.error('Failed to save resume feedback', saveError)
    return errorResponse('save_failed')
  }

  const body: StoredResumeFeedback = { feedback: result, model: config.model, createdAt: saved.created_at }
  return NextResponse.json(body)
}
