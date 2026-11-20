import { RESUME_FEEDBACK_SCHEMA, RESUME_FEEDBACK_SYSTEM_PROMPT, buildResumeFeedbackPrompt, parseResumeFeedback, type ResumeFeedback } from '@/lib/resume-feedback'
import { JOB_MATCH_SCHEMA, JOB_MATCH_SYSTEM_PROMPT, buildJobMatchPrompt, parseJobMatches, type JobMatch, type MatchableJob } from '@/lib/job-matching'

// 127.0.0.1 rather than localhost: Node on Windows may resolve localhost to
// ::1 while Ollama listens on IPv4 only.
const DEFAULT_OLLAMA_BASE_URL = 'http://127.0.0.1:11434'
const DEFAULT_OLLAMA_MODEL = 'llama3.1:8b'
const DEFAULT_TIMEOUT_MS = 120_000

export function getOllamaConfig(): { baseUrl: string; model: string } {
  const baseUrl = (process.env.OLLAMA_BASE_URL?.trim() || DEFAULT_OLLAMA_BASE_URL).replace(/\/+$/, '')
  const model = process.env.OLLAMA_MODEL?.trim() || DEFAULT_OLLAMA_MODEL
  return { baseUrl, model }
}

export class OllamaUnavailableError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options)
    this.name = 'OllamaUnavailableError'
  }
}

export class OllamaInvalidResponseError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options)
    this.name = 'OllamaInvalidResponseError'
  }
}

type OllamaOptions = { baseUrl: string; model: string; fetchImpl?: typeof fetch; timeoutMs?: number }

// One non-streaming /api/chat call constrained to a JSON schema. Returns the
// raw message content; callers validate it. Network, HTTP and JSON failures
// become typed errors so routes can show a clear message instead of output.
async function chatJson(opts: OllamaOptions, format: object, system: string, user: string): Promise<unknown> {
  const fetchImpl = opts.fetchImpl ?? fetch
  let response: Response
  try {
    response = await fetchImpl(`${opts.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: opts.model,
        stream: false,
        format,
        options: { temperature: 0.2 },
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
      }),
      cache: 'no-store',
      signal: AbortSignal.timeout(opts.timeoutMs ?? DEFAULT_TIMEOUT_MS),
    })
  } catch (error) {
    throw new OllamaUnavailableError(`Could not reach Ollama at ${opts.baseUrl}`, { cause: error })
  }

  if (!response.ok) {
    const body = await response.text().catch(() => '')
    if (response.status === 404 && /model.*not found/i.test(body)) {
      throw new OllamaUnavailableError(`Ollama model "${opts.model}" is not pulled. Run: ollama pull ${opts.model}`)
    }
    throw new OllamaUnavailableError(`Ollama responded with ${response.status}: ${body.slice(0, 300)}`)
  }

  let data: unknown
  try {
    data = await response.json()
  } catch (error) {
    throw new OllamaInvalidResponseError('Ollama returned a non-JSON response', { cause: error })
  }

  return (data as { message?: { content?: unknown } } | null)?.message?.content
}

export async function requestResumeFeedback(resumeText: string, opts: OllamaOptions): Promise<ResumeFeedback> {
  const content = await chatJson(opts, RESUME_FEEDBACK_SCHEMA, RESUME_FEEDBACK_SYSTEM_PROMPT, buildResumeFeedbackPrompt(resumeText))
  const feedback = parseResumeFeedback(content)
  if (!feedback) {
    throw new OllamaInvalidResponseError('Ollama response did not match the resume feedback schema')
  }
  return feedback
}

// US-21: score the candidate postings for one seeker. Only ids that were sent
// survive parsing; an unusable response is an error, never an empty "no match".
export async function requestJobMatches(seekerText: string, jobs: MatchableJob[], opts: OllamaOptions): Promise<JobMatch[]> {
  const content = await chatJson(opts, JOB_MATCH_SCHEMA, JOB_MATCH_SYSTEM_PROMPT, buildJobMatchPrompt(seekerText, jobs))
  const matches = parseJobMatches(content, jobs.map(job => job.id))
  if (!matches) {
    throw new OllamaInvalidResponseError('Ollama response did not match the job match schema')
  }
  return matches
}
