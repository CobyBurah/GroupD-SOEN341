import { RESUME_FEEDBACK_SCHEMA, RESUME_FEEDBACK_SYSTEM_PROMPT, buildResumeFeedbackPrompt, parseResumeFeedback, type ResumeFeedback } from '@/lib/resume-feedback'

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

export async function requestResumeFeedback(
  resumeText: string,
  opts: { baseUrl: string; model: string; fetchImpl?: typeof fetch; timeoutMs?: number },
): Promise<ResumeFeedback> {
  const fetchImpl = opts.fetchImpl ?? fetch
  let response: Response
  try {
    response = await fetchImpl(`${opts.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: opts.model,
        stream: false,
        format: RESUME_FEEDBACK_SCHEMA,
        options: { temperature: 0.2 },
        messages: [
          { role: 'system', content: RESUME_FEEDBACK_SYSTEM_PROMPT },
          { role: 'user', content: buildResumeFeedbackPrompt(resumeText) },
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

  const content = (data as { message?: { content?: unknown } } | null)?.message?.content
  const feedback = parseResumeFeedback(content)
  if (!feedback) {
    throw new OllamaInvalidResponseError('Ollama response did not match the resume feedback schema')
  }
  return feedback
}
