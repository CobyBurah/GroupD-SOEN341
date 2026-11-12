# AI Log #1 - Sprint 3
Sunday November 8th, 2026

**Task ID/Title:**
- Task: Plan the Sprint 3 feature AI-Powered Resume Feedback (#119 US-18, listed as US-10 in User_Stories.md), co-owned with Coby

**Purpose of AI Use:**
- Analyze the current state of the repo and the Sprint 3 meeting minutes to see what already exists and what this feature needs
- Write the user story, use cases and acceptance tests for the feature, following the format the team used in Sprint 2 (docs/recruiter)
- Pick an Ollama model I can run locally for the demo, and explain what has to be wired into our app for it to work
- Plan only, no code changes in this step

**AI Tool and Link to conversation:**
- Tool: Claude Code (desktop app). It used subagents to explore the repo in parallel.
- Link: https://claude.ai/share/b0c25f76-a8f5-4e97-bdf7-89f4ebf5e99a

**AI-Suggested Content:**
- Repo analysis:
  - Resumes are only stored as PDF/DOCX files in the private resumes bucket, with no text extraction.
  - There is no AI SDK, no table for storing feedback, and no API route for resumes.
  - The Geoapify route (src/app/api/locations/route.ts) is the existing pattern for calling an outside service from the server with an env var.
- Pointed out that the meeting minutes call the feature both US-18 and US-10, and that GitHub uses #119 "US-18"
- Model choice: llama3.1:8b in Ollama.
  - Reasons: good at following instructions, supports structured JSON output through the format option, and runs on a laptop with about 8 GB RAM and no GPU.
  - Fallbacks if it's too slow: qwen2.5:7b or llama3.2:3b.
- What needs to be wired in:
  - a PDF/DOCX text extraction library
  - plain fetch calls to the local Ollama API (no SDK, no API key)
  - server-only env vars OLLAMA_BASE_URL and OLLAMA_MODEL
  - migration 0016 for a resume_feedback table with RLS
  - an API route
  - a feedback panel on the Resumes page
  - unit and Playwright tests
- Draft use cases:
  - UC-01 request feedback
  - UC-02 view or regenerate feedback
  - UC-03 AI service unavailable
  - UC-04 unreadable resume
  - UC-05 unauthorized access
- Draft acceptance tests AT-US18-01 to 06, written in the same Given/When/Then style as the recruiter acceptance tests

**Validation:**
- Checked the plan against the acceptance criteria in #119 (including "show an error instead of fabricated feedback")
- Checked that the files and patterns it referenced exist: migration 0005, the resumes page, the locations route, and the test files
- Compared the use case and acceptance test format with docs/recruiter from Sprint 2

**Decision:**
- Kept llama3.1:8b as the demo model
- Kept #119 (US-18) as the parent issue, so it matches the GitHub board instead of creating a new US-10 issue
- Asked the AI for a plan first and reviewed it before letting it implement anything

**Reflection:**
- The repo analysis showed the feature is bigger than the user story suggests. Resumes are stored as files, so text extraction had to be built before any AI call could work.
- Running the model locally keeps the demo free and avoids handling API keys

**Responsible Person:**
- Noah, who conducted the interaction and co-owns the AI-Powered Resume Feedback feature with Coby

# AI Log #2 - Sprint 3
Sunday November 8th, 2026

**Task ID/Title:**
- Task: Implement and test AI-Powered Resume Feedback (#119 US-18) on the feature/ai-resume-feedback branch

**Purpose of AI Use:**
- Build the feature end to end using the plan from AI Log #1: text extraction, the Ollama client, the API route, the database table and the UI
- Write unit and browser tests and check that typecheck, lint, the tests and the build all pass
- Work on a branch without committing or pushing, so I could review everything first

**AI Tool and Link to conversation:**
- Tool: Claude Code. It ran separate subagents for the backend, the UI and the tests.
- Link: https://claude.ai/share/b0c25f76-a8f5-4e97-bdf7-89f4ebf5e99a

**AI-Suggested Content:**
- src/lib/resume-feedback.ts: the shared types, the JSON schema sent to Ollama, the system prompt (never invent experience), and a parser that rejects bad model output instead of showing partial feedback
- src/lib/resume-text.ts: PDF text with unpdf and DOCX text with mammoth, with typed errors for unsupported or unreadable files
- src/lib/ollama.ts:
  - calls http://127.0.0.1:11434/api/chat with structured output and a 120 second timeout
  - uses 127.0.0.1 instead of localhost, because Node on Windows can resolve localhost to IPv6 while Ollama listens on IPv4
  - separate errors for "unavailable" and "invalid response"
- src/app/api/resumes/[id]/feedback/route.ts:
  - GET returns the latest saved feedback
  - POST generates new feedback and saves it
  - Errors: 401, 404, 422 unreadable, 503 AI unavailable, 502 invalid output, 500 save failed
  - Never calls the model when the resume can't be read
- supabase/migrations/0016_resume_feedback.sql:
  - a resume_feedback table, private to the owner through RLS
  - only a job seeker who owns the resume can insert feedback
  - feedback is deleted along with its resume
- ResumeFeedbackPanel on the Resumes page:
  - Get AI feedback / Regenerate feedback button
  - a progress message, an error alert, and the summary, strengths and improvements
- Tests:
  - tests/resume-feedback.test.mjs and tests/resume-feedback-route.test.mjs: 11 new unit and PGlite RLS tests
  - tests/browser/resume-feedback.spec.mjs: 2 new Playwright tests
- README Ollama setup section, .env.example variables, docs/resume-feedback/use-cases.md and acceptance-tests.md

**Validation:**
- The AI ran npm run typecheck, lint, npm test (46/46), npm run build and npm run test:browser (26/26), and they all passed
- I reviewed the main backend files (route.ts and ollama.ts) to check that the error handling matches the acceptance criteria
- The AI was blocked from applying the migration to our shared Supabase project, so I applied 0016 myself in the Supabase SQL Editor. Then I checked through the Supabase MCP that the table and its 3 policies exist.

**Decision:**
- Kept "append-only" feedback, meaning each run saves a new row and the latest one is shown, so a resume can be regenerated
- Kept the error codes separate so the user sees a different message for "AI unavailable" and "can't read this resume"
- Kept the default model config (127.0.0.1:11434, llama3.1:8b) so the feature works without extra env setup

**Reflection:**
- Splitting the work between subagents and defining the shared contract file first kept the backend and UI consistent
- The tests mock the model, so passing tests don't prove the real AI works. I still had to test it manually with Ollama running (AI Log #3).

**Responsible Person:**
- Noah, who conducted the interaction, reviewed the code and applied the migration

# AI Log #3 - Sprint 3
Tuesday November 10th, 2026

**Task ID/Title:**
- Task: Split #119 into GitHub issues, manually test the feature with real Ollama, and open the PR

**Purpose of AI Use:**
- Check that my branch is up to date with main and won't conflict with other Sprint 3 work
- Split #119 into sub-issues the same way the team split other user stories
- Run the app and watch the server logs while I tested the feature myself
- Get the terminal commands to commit, push, create the issues and open the PR

**AI Tool and Link to conversation:**
- Tool: Claude Code (subagents for checking branches and GitHub issue conventions)
- Link: https://claude.ai/share/b0c25f76-a8f5-4e97-bdf7-89f4ebf5e99a

**AI-Suggested Content:**
- Branch check:
  - main was 1 commit ahead, and that commit only added an AI log file
  - no other Sprint 3 code had been pushed yet
  - migration number 0016 was still free
- Issue convention:
  - Sprint 3 stories (#117, #123) use plain-titled sub-issues with one assignee each
  - acceptance tests follow the Sprint 2 template (AT-USNN-0N, label Acceptance Test)
  - the team does not create use-case issues
- Issue plan:
  - 6 tasks: 4 for me (text extraction, Ollama client, API route, table and RLS) and 2 for Coby (UI panel, tests)
  - 6 acceptance tests assigned to both of us
  - all linked as sub-issues of #119, with #119 moved to In progress
- Started npm run dev and watched the logs while I tested. After each test it checked the resume_feedback table with read-only SQL.
- Bash scripts and gh commands for the issues and the PR. The PR body has "Closes" lines so the board moves the issues to Done on merge.

**Validation:**
- I tested the feature myself at localhost:3000 with Ollama running llama3.1:8b:
  - AT-US18-01: feedback was generated and saved (5 strengths, 5 improvements). The first request took 116 seconds because the model was loading.
  - AT-US18-02: the feedback was still there after reloading the page.
  - AT-US18-03: with Ollama stopped I got the "unavailable" error (503 in under 1 second), and no row was saved.
  - AT-US18-06: deleting the resume also deleted its feedback row.
- AT-US18-04 and AT-US18-05 are not tested manually yet. Automated tests cover them.

**Decision:**
- Chose the split myself: tasks plus acceptance tests, backend for me and UI and tests for Coby, and no use-case issues because the team doesn't use them
- Chose to run every git and gh command myself instead of letting the AI push or write to GitHub
- My first try failed because I pasted bash commands into PowerShell. The AI then gave me a single script to run through Git Bash, and it created #128 to #139 and PR #140.

**Reflection:**
- The 116 second first request is very close to the 120 second timeout, so before the demo I need to warm up the model with `ollama run llama3.1:8b "hi" --keepalive 60m`
- Watching the server logs and the database while testing made it easy to confirm each acceptance test actually passed

**Responsible Person:**
- Noah, who conducted the interaction, ran the manual acceptance tests and ran all git/gh commands

# AI Log #4 - Sprint 3
Tuesday November 10th, 2026

**Task ID/Title:**
- Task: Fix the failing CI checks on PR #140

**Purpose of AI Use:**
- Find out why both CI jobs (lint/typecheck/tests/build and Playwright) were failing on PR #140, and fix them

**AI Tool and Link to conversation:**
- Tool: Claude Code
- Link: https://claude.ai/share/b0c25f76-a8f5-4e97-bdf7-89f4ebf5e99a

**AI-Suggested Content:**
- Found that both jobs failed at the npm ci step before any of our code ran. The error was "Missing: @emnapi/runtime@1.11.3 / @emnapi/core@1.11.3 from lock file".
- Cause: npm on Windows (11.6.2) had removed those two optional packages from package-lock.json when unpdf and mammoth were added. CI uses npm 11.19.1, which is stricter.
- Fix:
  - rebuilt package-lock.json from main's lock file, which passes CI
  - added only the 25 packages that unpdf and mammoth need
- Reproduced it with CI's npm version: the old lock file failed and the new one installed
- Ran the full CI pipeline on a clean copy of the branch: lint, typecheck, 46/46 unit tests, build and 26/26 Playwright tests all passed

**Validation:**
- I committed and pushed the fix myself (commit 66f77d3), and both CI checks on PR #140 now pass

**Decision:**
- Kept the merged lock file instead of regenerating it on my machine, since my npm version would remove the packages again

**Reflection:**
- My local npm accepted a lock file that CI rejected, so passing locally didn't mean CI would pass
- Next time I add packages, I'll use CI's npm version (`npx npm@11.19.1 install <package>`)

**Responsible Person:**
- Noah, who conducted the interaction and pushed the fix
