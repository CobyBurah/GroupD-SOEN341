# Acceptance tests: AI job matching (US-21)

Label: `Acceptance Test`. Milestone: Sprint 4. Run these against the real Supabase project with Ollama running locally (`ollama pull llama3.1:8b`) before marking them passed. The automated tests mock the model and are supporting evidence:

- `tests/job-matching.test.mjs`: pre-ranking, prompt, parsing, Ollama client errors
- `tests/job-matches-route.test.mjs`: API route rules and every failure path
- `tests/browser/job-matches.spec.mjs`: the page in Chromium

## AT-US21-01: Get relevant matches for a resume
Given a signed-in job seeker with a text-based software developer resume and open software and non-software postings, when they open **AI matches**, pick the resume and click **Find matches**, then a progress message appears and the button is disabled. Within about a minute the page lists up to 6 matches, best first, each with a fit label and score, at least one reason, skills to strengthen (when any), and **Apply** and title links. Every reason refers to something in the resume or profile. No non-software posting appears unless the resume mentions its skills.

## AT-US21-02: Only open, not-yet-applied postings are suggested
Given the seeker already applied to one matching posting, and another matching posting is archived or past its deadline, when they find matches, then neither of those postings is listed.

## AT-US21-03: No suitable postings shows an empty state
Given no open posting shares skills or keywords with the selected resume, when the seeker finds matches, then **No matches yet** is shown with the number of postings checked, and the model is not called. Given postings that share a few words but are unrelated (e.g. a chef resume and a nursing posting), the model is called but every posting scored below 40 is dropped, and the same empty state is shown.

## AT-US21-04: AI failures show an error, never invented matches
Given Ollama is stopped (or the model is not pulled), when the seeker finds matches, then an alert shows "The AI matching service is unavailable right now. Please try again later." and no matches are shown.

## AT-US21-05: Unreadable resumes are rejected before matching
Given a scanned or empty PDF, when the seeker finds matches with it, then the page explains the resume must be text-based, and no matches are shown.

## AT-US21-06: Only job seekers can use matching, with their own resumes
Given a recruiter (or a dual-role account in recruiter mode), the header has no **AI matches** link and `/job-matches` says only job seekers can get matches. A `POST /api/job-matches` with another user's resume id returns 404, and signed out returns 401.
