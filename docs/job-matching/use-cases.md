# Use cases: AI job matching (US-21)

Parent story: US-21 AI job matching suggestions (GitHub issue created by `node scripts/github/sprint4-github.mjs`; each use case below is also a `use case` sub-issue of US-21).

Actors: **Job seeker** (primary), **Local AI model** (Ollama running `llama3.1:8b` on the demo machine), **Supabase** (auth, storage, database).

## UC-01: Get job matches for a resume

- **Precondition:** The job seeker is signed in, has at least one text-based PDF or DOCX resume, and Ollama is running with the configured model pulled.
- **Trigger:** The job seeker opens **AI matches** (header or dashboard), picks a resume and clicks **Find matches**.
- **Main flow:**
  1. The page shows a progress message and disables the button.
  2. The server checks the session and that the account is in job seeker mode.
  3. The server loads the resume through RLS, downloads it from private storage and extracts its text.
  4. The server loads the open postings (not deleted, not archived, deadline not passed) and removes the ones the seeker already applied to.
  5. The server combines the resume text with the profile headline, location and bio, and keeps the 6 postings with the highest keyword overlap.
  6. The server sends only those 6 postings and the seeker text to the local model, constrained by a JSON schema.
  7. The server keeps only matches for job ids it sent, clamps scores to 0-100, drops matches without a reason or scored below 40 (weak fits), and sorts by score.
  8. The page lists each match with its fit label and score, why it fits, the skills to strengthen, and links to the posting and the apply page.
- **Postcondition:** Nothing is stored. Running it again gives a fresh result.

## UC-02: No suitable postings

- **Trigger:** No open posting shares any skill or keyword with the resume and profile (for example a nursing resume when only software postings are open), or the seeker has applied to every open posting.
- **Main flow:** The server returns an empty result without calling the model. The page shows **No matches yet**, how many postings were checked, and a link to browse all jobs.
- **Alternate flow:** Some postings share keywords, but the model scores all of them below 40 (for example a chef resume and a nursing posting that both mention "French"). The model is called, the weak fits are dropped, and the same empty state is shown.

## UC-03: AI service unavailable or invalid output

- **Trigger:** Ollama is stopped, unreachable, missing the model, or returns output that does not match the schema.
- **Main flow:** The server returns `503 ai_unavailable` or `502 ai_invalid`. The page shows the error in an alert. No matches are shown or invented.

## UC-04: Resume cannot be read

- **Trigger:** The resume is a scanned image, empty or corrupted (fewer than 50 characters of text).
- **Main flow:** The server returns `422 unreadable` before loading postings or calling the model. The page explains that the resume must be a text-based PDF or DOCX.

## UC-05: Unauthorized use

- **Trigger:** A signed-out user, a recruiter, or a job seeker sending another user's resume id calls `POST /api/job-matches`.
- **Main flow:** Signed out gets `401`. Recruiter mode gets `403`. A resume not visible under RLS gets `404`. No resume is read and the model is not called. The page itself tells recruiters that only job seekers can get matches, and the header hides the link for them.

## UC-06: Apply from a match

- **Trigger:** The job seeker clicks **Apply** on a match.
- **Main flow:** The normal apply page opens (US-08), with a back link to **AI job matches**. All application rules still apply (one application per posting, archived or expired postings refuse applications).
