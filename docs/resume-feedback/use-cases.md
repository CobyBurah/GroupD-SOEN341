# Use cases — AI-assisted resume feedback

Parent story: [#119 US-18 — AI-assisted resume feedback](https://github.com/CobyBurah/GroupD-SOEN341/issues/119) (listed as US-10 in `User_Stories.md`; the GitHub board numbers it US-18).

Actors: **Job seeker** (primary), **Local AI model** (Ollama running `llama3.1:8b` on the demo machine), **Supabase** (auth, storage, database).

## UC-01 — Request AI feedback on a resume

- **Precondition:** The job seeker is signed in and has at least one uploaded PDF or DOCX resume. Ollama is running with the configured model pulled.
- **Trigger:** The job seeker clicks **Get AI feedback** under a resume on the Resumes page.
- **Main flow:**
  1. The system shows a progress message and disables the button.
  2. The server confirms the resume belongs to the signed-in user (RLS) and downloads the file from private storage.
  3. The server extracts the resume text (PDF via unpdf, DOCX via mammoth) and trims it to the model's input budget.
  4. The server sends the text to the local model with a JSON schema constraining the response to a summary, strengths, and suggested improvements.
  5. The server validates the response, saves it to `resume_feedback`, and returns it.
  6. The page shows the summary, strengths, suggested improvements, the model name, and the generation time.
- **Postcondition:** The feedback is stored and shown to the job seeker.

## UC-02 — View previously generated feedback

- **Precondition:** Feedback was generated earlier for the resume.
- **Main flow:** The job seeker opens the Resumes page, and the latest stored feedback for each resume is loaded without calling the model again. The button reads **Regenerate feedback**.
- **Alternate flow:** The job seeker clicks **Regenerate feedback**, and UC-01 runs again. A new row is stored; the latest row is shown.

## UC-03 — AI service unavailable

- **Trigger:** The job seeker requests feedback while Ollama is stopped, unreachable, or missing the configured model.
- **Main flow:** The server returns `503 ai_unavailable`. The page shows "The AI feedback service is unavailable right now. Please try again later." in an alert. No feedback is fabricated or stored, and previously shown feedback stays visible.

## UC-04 — Resume cannot be read

- **Trigger:** The resume is a scanned image, empty, corrupted, or yields fewer than 50 characters of text.
- **Main flow:** The server returns `422 unreadable` without calling the model. The page explains that the resume must be a text-based PDF or DOCX.

## UC-05 — Unauthorized feedback access

- **Trigger:** A signed-out user, a recruiter, or another job seeker calls `GET` or `POST /api/resumes/{id}/feedback` for a resume they do not own.
- **Main flow:** A signed-out request gets `401`. A resume not visible under RLS returns `404`. No resume content is read, no model call is made, and no feedback is returned or stored. Database policies also block inserting feedback for a resume the caller does not own.
