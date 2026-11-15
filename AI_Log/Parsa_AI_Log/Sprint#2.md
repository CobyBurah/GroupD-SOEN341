# AI Log #1 - Sprint 2

October 25–26, 2026

**Task ID/Title:**

- US-05 (#40) — Preserve the resume a recruiter receives with an application.

**Purpose of AI Use:**

- Find and implement an improvement related to Parsa’s recruiter work. A recruiter should be able to open the resume the applicant originally submitted, even after the applicant replaces or deletes their current resume.

**AI Tool and Link to conversation:**

- ChatGPT for the initial work and OpenAI Codex for the desktop continuation. [Shared web conversation](https://chatgpt.com/share/6adf7866-d39c-83e9-ab4c-b357a1d76e3f)

**Prompt excerpts:**

- “Your recommendation is exactly what I was going for. Implement.”
- “Continue work here.” Parsa provided the extracted project after the web session encountered a GitHub permissions error.

**AI-Suggested Content:**

- Capture the submitted file’s name and storage path when creating an application. Add application-specific downloads, file retention and cleanup, a migration for existing records, regression tests and a demo.

**Validation:**

- Codex ran 35 unit/database tests and 24 browser tests. All passed. Type checking and the production and fixture builds passed. Both GitHub CI jobs also passed. The recorded checks used PGlite and local synthetic accounts.

**Decision:**

- Capture the file reference in the database, keep referenced files intact, and check application access before issuing a 60-second download URL. Label older records as saved during the upgrade when their original contents cannot be recovered.

**Reflection / review notes:**

- A submitted resume has a different lifetime from the user’s current resume. Testing replacement, deletion and withdrawal made it possible to check both what the recruiter could still open and when access should end.

**Evidence:**

- [PR #116](https://github.com/CobyBurah/GroupD-SOEN341/pull/116) · [CI results](https://github.com/CobyBurah/GroupD-SOEN341/actions/runs/40358366736) · [Original session record](archive/2026-10-26-submitted-resume-versions.md)

**Responsible Person:**

- Parsa Morshedlou (`bluwine`) selected the improvement, directed the work and authorized publication. Parsa reported approximately two hours of human effort for the complete activity. [Sprint 2 contribution log](../../Sprint%20Deliverables/Sprint%232/Parsa_Contribution_Log.md)
