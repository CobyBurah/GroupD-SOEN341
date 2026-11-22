import { NextResponse } from 'next/server'
import { isJobId } from '@/lib/job-posting'
import { MIN_MATCH_SCORE, buildSeekerText, openDeadlineFilter, selectCandidates, type JobMatchesResponse, type JobMatchResult, type MatchableJob } from '@/lib/job-matching'
import { OllamaInvalidResponseError, OllamaUnavailableError, getOllamaConfig, requestJobMatches } from '@/lib/ollama'
import { MIN_RESUME_TEXT_CHARS, prepareResumeText } from '@/lib/resume-feedback'
import { ResumeTextExtractionError, UnsupportedResumeTypeError, extractResumeText } from '@/lib/resume-text'
import { RESUME_BUCKET } from '@/lib/resumes'
import { createClient } from '@/lib/supabase/server'

// PDF/DOCX parsing needs Node APIs (Buffer, pdf.js).
export const runtime = 'nodejs'

// Most recent open postings considered before keyword pre-ranking.
const MAX_OPEN_JOBS = 200

type ErrorCode = 'unauthorized' | 'forbidden' | 'not_found' | 'unreadable' | 'jobs_failed' | 'ai_unavailable' | 'ai_invalid'

const MESSAGES: Record<ErrorCode, string> = {
  unauthorized: 'You must be signed in to do that.',
  forbidden: 'Only job seekers can get job matches.',
  not_found: 'Choose one of your resumes.',
  unreadable: "We couldn't read any text from this resume. Make sure it's a text-based PDF or DOCX (not a scanned image).",
  jobs_failed: "We couldn't load the open postings. Please try again.",
  ai_unavailable: 'The AI matching service is unavailable right now. Please try again later.',
  ai_invalid: "The AI returned matches we couldn't understand. Please try again.",
}

const STATUS: Record<ErrorCode, number> = {
  unauthorized: 401, forbidden: 403, not_found: 404, unreadable: 422, jobs_failed: 500, ai_unavailable: 503, ai_invalid: 502,
}

function errorResponse(code: ErrorCode) {
  return NextResponse.json({ error: MESSAGES[code], code }, { status: STATUS[code] })
}

// US-21: recommend open postings for one of the signed-in seeker's resumes.
// Nothing is stored: the resume text and profile are only sent to the local
// Ollama server for this request. Ownership comes from the session client + RLS.
export async function POST(request: Request) {
  let resumeId: unknown
  try {
    resumeId = ((await request.json()) as { resumeId?: unknown } | null)?.resumeId
  } catch {
    return errorResponse('not_found')
  }
  if (!isJobId(resumeId)) return errorResponse('not_found')

  const supabase = await createClient()
  const { data: claims } = await supabase.auth.getClaims()
  const userId = claims?.claims.sub
  if (!userId) return errorResponse('unauthorized')

  const { data: profile } = await supabase.from('profiles').select('role, headline, location, bio').eq('id', userId).maybeSingle()
  if (profile?.role !== 'job_seeker') return errorResponse('forbidden')

  const { data: resume, error: resumeError } = await supabase.from('resumes')
    .select('storage_path, mime_type').eq('id', resumeId).maybeSingle()
  if (resumeError || !resume) return errorResponse('not_found')

  const { data: file, error: downloadError } = await supabase.storage.from(RESUME_BUCKET).download(resume.storage_path)
  if (downloadError || !file) {
    console.error('Failed to download resume for job matching', downloadError)
    return errorResponse('not_found')
  }

  let resumeText: string
  try {
    resumeText = prepareResumeText(await extractResumeText(new Uint8Array(await file.arrayBuffer()), resume.mime_type))
  } catch (error) {
    if (error instanceof UnsupportedResumeTypeError || error instanceof ResumeTextExtractionError) {
      console.error('Failed to extract resume text for job matching', error)
      return errorResponse('unreadable')
    }
    throw error
  }
  if (resumeText.length < MIN_RESUME_TEXT_CHARS) return errorResponse('unreadable')

  // Open postings the seeker has not applied to yet.
  const [jobsResult, appliedResult] = await Promise.all([
    supabase.from('jobs')
      .select('id, title, company, location, category, employment_type, workplace_type, description')
      .is('deleted_at', null).is('archived_at', null).or(openDeadlineFilter())
      .order('created_at', { ascending: false }).limit(MAX_OPEN_JOBS),
    supabase.from('applications').select('job_id').eq('user_id', userId),
  ])
  if (jobsResult.error || appliedResult.error) {
    console.error('Failed to load jobs for matching', jobsResult.error ?? appliedResult.error)
    return errorResponse('jobs_failed')
  }
  const applied = new Set((appliedResult.data ?? []).map(row => row.job_id))
  const openJobs = ((jobsResult.data ?? []) as MatchableJob[]).filter(job => !applied.has(job.id))

  const seekerText = buildSeekerText(resumeText, profile)
  const candidates = selectCandidates(seekerText, openJobs)
  if (candidates.length === 0) {
    const empty: JobMatchesResponse = { matches: [], considered: openJobs.length, model: null }
    return NextResponse.json(empty)
  }

  const config = getOllamaConfig()
  let matches
  try {
    matches = await requestJobMatches(seekerText, candidates, config)
  } catch (error) {
    console.error('Job match request failed', error)
    if (error instanceof OllamaUnavailableError) return errorResponse('ai_unavailable')
    if (error instanceof OllamaInvalidResponseError) return errorResponse('ai_invalid')
    throw error
  }

  const byId = new Map(candidates.map(job => [job.id, job]))
  // weak fits are left out so the page shows the empty state instead of "matches" scored near 0
  const results: JobMatchResult[] = matches.filter(match => match.score >= MIN_MATCH_SCORE).map(match => {
    const job = byId.get(match.jobId)!
    return { ...match, title: job.title, company: job.company, location: job.location }
  })
  const body: JobMatchesResponse = { matches: results, considered: openJobs.length, model: config.model }
  return NextResponse.json(body)
}
