import { extractText } from 'unpdf'
import mammoth from 'mammoth'

const PDF_MIME_TYPE = 'application/pdf'
const DOCX_MIME_TYPE = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

export class UnsupportedResumeTypeError extends Error {
  constructor(mimeType: string) {
    super(`Unsupported resume type: ${mimeType}`)
    this.name = 'UnsupportedResumeTypeError'
  }
}

export class ResumeTextExtractionError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options)
    this.name = 'ResumeTextExtractionError'
  }
}

// Pulls plain text out of a stored resume so it can be sent to the AI model.
// Image-only PDFs yield little or no text; callers check the length.
export async function extractResumeText(bytes: Uint8Array, mimeType: string): Promise<string> {
  if (mimeType === PDF_MIME_TYPE) {
    try {
      // unpdf (pdf.js) may detach the buffer it is given, so pass a copy.
      const { text } = await extractText(new Uint8Array(bytes), { mergePages: true })
      return text
    } catch (error) {
      throw new ResumeTextExtractionError('Could not read text from PDF', { cause: error })
    }
  }
  if (mimeType === DOCX_MIME_TYPE) {
    try {
      const { value } = await mammoth.extractRawText({ buffer: Buffer.from(bytes) })
      return value
    } catch (error) {
      throw new ResumeTextExtractionError('Could not read text from DOCX', { cause: error })
    }
  }
  throw new UnsupportedResumeTypeError(mimeType)
}
