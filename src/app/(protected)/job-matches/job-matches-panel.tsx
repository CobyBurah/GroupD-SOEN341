'use client'

import Link from 'next/link'
import { useState } from 'react'

import type { JobMatchesResponse, JobMatchResult } from '@/lib/job-matching'
import styles from '@/app/ui.module.css'

const NETWORK_ERROR = "Couldn't reach the server. Please try again."
const GENERIC_ERROR = 'Something went wrong while finding matches. Please try again.'

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(item => typeof item === 'string')
}

function isMatch(value: unknown): value is JobMatchResult {
  if (!value || typeof value !== 'object') return false
  const record = value as Record<string, unknown>
  return typeof record.jobId === 'string' && typeof record.title === 'string' && typeof record.company === 'string'
    && typeof record.score === 'number' && isStringArray(record.reasons) && isStringArray(record.missingSkills)
}

function isResponse(value: unknown): value is JobMatchesResponse {
  if (!value || typeof value !== 'object') return false
  const record = value as Record<string, unknown>
  return Array.isArray(record.matches) && record.matches.every(isMatch) && typeof record.considered === 'number'
}

type Result = { ok: true; data: JobMatchesResponse } | { ok: false; error: string }

async function requestMatches(resumeId: string): Promise<Result> {
  let response: Response
  try {
    response = await fetch('/api/job-matches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resumeId }),
    })
  } catch {
    return { ok: false, error: NETWORK_ERROR }
  }
  let body: unknown
  try {
    body = await response.json()
  } catch {
    return { ok: false, error: GENERIC_ERROR }
  }
  if (!response.ok) {
    const message = body && typeof body === 'object' ? (body as { error?: unknown }).error : null
    return { ok: false, error: typeof message === 'string' && message.trim() ? message : GENERIC_ERROR }
  }
  return isResponse(body) ? { ok: true, data: body } : { ok: false, error: GENERIC_ERROR }
}

function fitLabel(score: number) {
  if (score >= 75) return 'Strong fit'
  if (score >= 50) return 'Good fit'
  if (score >= 25) return 'Partial fit'
  return 'Weak fit'
}

export function JobMatchesPanel({ resumes }: { resumes: { id: string; file_name: string }[] }) {
  const [resumeId, setResumeId] = useState(resumes[0]?.id ?? '')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<JobMatchesResponse | null>(null)

  async function findMatches(event: React.FormEvent) {
    event.preventDefault()
    if (!resumeId) return
    setPending(true)
    setError(null)
    const outcome = await requestMatches(resumeId)
    setPending(false)
    if (outcome.ok) setResult(outcome.data)
    else setError(outcome.error)
  }

  return (
    <section aria-label="Find job matches">
      <form onSubmit={findMatches} className={styles.feedbackActions}>
        <label htmlFor="match-resume">Resume</label>
        <select id="match-resume" value={resumeId} onChange={event => setResumeId(event.target.value)} disabled={pending}>
          {resumes.map(resume => <option key={resume.id} value={resume.id}>{resume.file_name}</option>)}
        </select>
        <button type="submit" className={styles.primary} disabled={pending || !resumeId} aria-busy={pending}>
          {result ? 'Find matches again' : 'Find matches'}
        </button>
      </form>

      <p role="status" className={styles.muted}>
        {pending ? 'Matching your resume against open postings… this can take up to a minute.' : ''}
      </p>
      {error && <p role="alert">{error}</p>}

      {result && !pending && (
        result.matches.length === 0
          ? <section className={styles.card}>
              <h2>No matches yet</h2>
              <p>None of the {result.considered} open postings you have not applied to is a good fit for this resume. Try another resume or <Link href="/jobs">browse all jobs</Link>.</p>
            </section>
          : <>
              <p>{result.matches.length} {result.matches.length === 1 ? 'match' : 'matches'} from {result.considered} open postings.</p>
              <ul className={styles.list}>
                {result.matches.map(match => (
                  <li key={match.jobId} className={styles.row}>
                    <h2 className={styles.rowTitle}><Link href={`/jobs/${match.jobId}?returnTo=${encodeURIComponent('/job-matches')}`}>{match.title}</Link></h2>
                    <p className={styles.meta}>{match.company}{match.location ? ` · ${match.location}` : ''}</p>
                    <p><strong>{fitLabel(match.score)}</strong> ({match.score}/100)</p>
                    <h3>Why it fits</h3>
                    <ul>{match.reasons.map((reason, index) => <li key={index}>{reason}</li>)}</ul>
                    {match.missingSkills.length > 0 && <>
                      <h3>Skills to strengthen</h3>
                      <ul>{match.missingSkills.map((skill, index) => <li key={index}>{skill}</li>)}</ul>
                    </>}
                    <div className={styles.bottomRow}>
                      <Link className={styles.primary} href={`/jobs/${match.jobId}/apply?returnTo=${encodeURIComponent('/job-matches')}`}>Apply</Link>
                    </div>
                  </li>
                ))}
              </ul>
              {result.model && <p className={styles.muted}>Generated by {result.model}. AI suggestions can be wrong; read each posting before applying.</p>}
            </>
      )}
    </section>
  )
}
