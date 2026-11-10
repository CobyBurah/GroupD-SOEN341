# Acceptance tests — AI-assisted resume feedback

Parent story: [#119](https://github.com/CobyBurah/GroupD-SOEN341/issues/119). Label: `Acceptance Test`. Milestone: Sprint 3. Run these against the real configured environment, with migration `0016_resume_feedback.sql` applied and Ollama running locally, before marking them passed. Automated tests mock the model and are supporting evidence only.

## AT-US18-01 — Generate feedback for an owned resume
Given a signed-in job seeker with an uploaded, text-based PDF or DOCX resume and Ollama running with `llama3.1:8b` pulled, when they click **Get AI feedback**, then a progress message appears and the button is disabled. Within about a minute, the page shows an **AI feedback** section with a summary, at least one strength or suggested improvement, the model name, and the generation time. The feedback must refer to the resume's actual content.

## AT-US18-02 — Feedback persists and can be regenerated
Given feedback was generated for a resume, when the job seeker reloads the Resumes page, signs out, and signs back in, then the same feedback is shown without a new model call, and the button reads **Regenerate feedback**. When they regenerate, new feedback replaces the displayed result.

## AT-US18-03 — AI service unavailable shows an error, not fabricated feedback
Given Ollama is stopped, or the configured model is not pulled, when the job seeker requests feedback, then an alert shows "The AI feedback service is unavailable right now. Please try again later." No new feedback is displayed or stored, and any previously displayed feedback stays unchanged.

## AT-US18-04 — Unreadable resume is rejected before calling the model
Given a resume that is a scanned image, or a PDF with no extractable text, when the job seeker requests feedback, then an alert explains that the resume must be a text-based PDF or DOCX, the model is not called, and nothing is stored.

## AT-US18-05 — Feedback is private to the resume owner
Given job seeker A's resume ID, when job seeker B, a recruiter, or a signed-out client calls `GET` or `POST /api/resumes/{id}/feedback`, then the response is `404` (`401` when signed out), no feedback is generated or returned, and A's feedback never appears in B's Resumes page.

## AT-US18-06 — Deleting a resume removes its feedback
Given a resume with stored feedback, when the job seeker deletes the resume, then its feedback rows are removed (cascade) and do not reappear.
