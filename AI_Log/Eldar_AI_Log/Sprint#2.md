# AI Log #1 - Sprint 2
October 18, 2026

**Task ID/Title:**
- US-05 — Recruiter Dashboard and Posting Management (#40)

**Purpose of AI Use:**
- Plan and implement recruiter posting management using the existing Next.js/Supabase app.
- Keep the first implementation local for debugging and review.

**AI Tool and Link to conversation:**
- Tool: OpenAI Codex (desktop app).
- Public conversation link: not supplied. Recorded prompt excerpts and evidence are included below.

**Prompt excerpts:**
- “Perfect, start working … Do not push anything yet.” (excerpt preserved in the dated implementation log).

**AI-Suggested Content:**
- Recruiter dashboard, create/edit forms, confirmed soft deletion, validation and server actions.
- Session/role/ownership checks, migration 0007, shared signed-in navigation, tests and synthetic preview tooling.

**Validation:**
- Original implementation: four automated tests, TypeScript/build and local synthetic UI checks passed.
- Checks covered creation, prefilled editing, deletion, navigation and database ownership restrictions. Live Supabase was not verified in that run.

**Decision:**
- Derive posting ownership from the session and enforce it again in database policies.
- Use soft deletion to preserve records for application history.
- Adjust shared navigation/profile formatting after user feedback; publish only after authorization.

**Reflection / review notes:**
- UI behavior and database authorization need separate checks. A working synthetic preview does not prove the deployed Supabase policies are configured.

**Evidence:**
- [Story #40](https://github.com/CobyBurah/GroupD-SOEN341/issues/40); [PR #58](https://github.com/CobyBurah/GroupD-SOEN341/pull/58).
- [Detailed dated record](archive/2026-10-18-recruiter-management.md).

**Responsible Person:**
- Eldar Sadeghi, who requested the AI assistance. AI-assisted execution and shared implementation credit are identified explicitly.

# AI Log #2 - Sprint 2
October 25, 2026

**Task ID/Title:**
- Recruiter received-applications review and integration evidence

**Purpose of AI Use:**
- Check the received-applications requirement against the integrated project.
- Document Eldar's reported recruiter contribution with accurate shared-work attribution.

**AI Tool and Link to conversation:**
- Tool: OpenAI Codex (desktop app).
- Public conversation link: not supplied. Recorded prompt excerpts and evidence are included below.

**Prompt excerpts:**
- “Is this done for this project?” (with the recruiter requirement screenshot).
- “can you do my contribution log?” Eldar reported approximately one hour for posting management and one hour for received applications.

**AI-Suggested Content:**
- Reviewed applicant names, submission dates, submitted-resume links, statuses and recruiter status-update controls.
- Prepared contribution-log wording and received-applications acceptance checks.

**Validation:**
- Inspected the implemented page, form and server actions.
- Database tests passed; the synthetic recruiter browser flow checked the empty applications screen. Full populated recruiter/live verification was not performed in that session.

**Decision:**
- Link PR #63 as integrated feature evidence while crediting Noah Dahan for its implementation commit.
- Do not reconstruct missing earlier prompt history or claim sole authorship for Eldar.
- Use only Eldar's supplied time estimates; do not invent acceptance-preparation hours.

**Reflection / review notes:**
- A contribution log should distinguish a member's reported involvement from commit authorship and from validation performed by AI.

**Evidence:**
- [PR #63](https://github.com/CobyBurah/GroupD-SOEN341/pull/63); [contribution log PR #107](https://github.com/CobyBurah/GroupD-SOEN341/pull/107).
- [Consolidated dated record](archive/2026-10-25-acceptance-drafts.md).

**Responsible Person:**
- Eldar Sadeghi, who requested the AI assistance. AI-assisted execution and shared implementation credit are identified explicitly.

# AI Log #3 - Sprint 2
October 25, 2026

**Task ID/Title:**
- Sprint 1/2 acceptance-test preparation, publication and documentation

**Purpose of AI Use:**
- Compare assignment requirements with stories, test code and existing GitHub issues.
- Prepare missing scenarios and publish them after user approval.

**AI Tool and Link to conversation:**
- Tool: OpenAI Codex (desktop app).
- Public conversation link: not supplied. Recorded prompt excerpts and evidence are included below.

**Prompt excerpts:**
- “Check everything to do with the acceptance test and let me know.”
- “Prepare local drafts.”
- “publish the drafts to github” and “do this yourself.”

**AI-Suggested Content:**
- Prepared 22 scenarios with steps, expected results, story/task traceability and result fields.
- Published tests #85–106, tracking story #78 and supporting tasks #79–84; clarified submission story #44.
- Prepared the contribution log and AI usage record.

**Validation:**
- Local audit: 23 unit/database tests passed; production test build passed.
- Installed-Chrome browser run: 9 passed, 2 failed on console-resource 404 assertions.
- Published issues checked for labels, assignee, milestone and story/task links. Later contribution-log CI passed both checks.

**Decision:**
- Keep local automated results separate from live acceptance results; the 22 live scenarios remained NOT RUN at publication.
- Preserve failures instead of weakening assertions.
- Use GitHub CLI after connector write access failed; Eldar completed device authorization himself.

**Reflection / review notes:**
- Publishing scenarios and executing them are separate activities. Evidence must state the actual environment and results rather than inferring a pass from issue closure or a mock backend.

**Evidence:**
- [Tests assigned to Eldar](https://github.com/CobyBurah/GroupD-SOEN341/issues?q=is%3Aissue%20label%3A%22Acceptance%20Test%22%20assignee%3AEldarSadeghi).
- [AI log PR #114](https://github.com/CobyBurah/GroupD-SOEN341/pull/114); [detailed dated record](archive/2026-10-25-acceptance-drafts.md).

**Responsible Person:**
- Eldar Sadeghi, who requested the AI assistance. AI-assisted execution and shared implementation credit are identified explicitly.
