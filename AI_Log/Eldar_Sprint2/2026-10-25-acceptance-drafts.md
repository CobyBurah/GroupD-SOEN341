# Sprint 2 AI Usage Log — Recruiter Features and Acceptance Tests

Date: October 25, 2026. Responsible member: Eldar Sadeghi. Tool: OpenAI Codex. The user initially requested local drafts and later authorized GitHub publication.

## Feature 4: Recruiter Dashboard and Posting Management

Eldar identified the following two requirements as his Sprint 2 contribution and estimated approximately one hour of human effort for each (approximately two hours total). These are Eldar's estimates, not AI runtime. This section consolidates the recruiter work with the acceptance-test work recorded below.

### Allow recruiters to create and manage job postings

- **Purpose and request:** Use Codex to plan and implement the recruiter dashboard and posting-management feature for US-05, initially locally for review and debugging. The earlier recorded instruction was to start after approval and not push until authorized.
- **AI-generated output:** Recruiter dashboard, posting creation/edit forms and server actions, confirmation-based soft deletion, session/role/ownership checks, migration 0007, shared signed-in navigation, tests and local preview tooling.
- **Decisions and modifications:** Derive ownership from the authenticated session; enforce ownership through server checks and database policies. Use soft deletion to preserve records for application history. Adjust shared navigation and profile formatting after user feedback.
- **Validation:** The original implementation log records four passing automated tests, TypeScript/build checks and local synthetic UI checks for creation, prefilled editing, confirmed deletion and navigation. The later acceptance audit also passed the recruiter browser flow. These checks do not establish completed real-Supabase acceptance testing.
- **Evidence:** [User story #40](https://github.com/CobyBurah/GroupD-SOEN341/issues/40), [PR #58](https://github.com/CobyBurah/GroupD-SOEN341/pull/58), [Eldar's implementation commit](https://github.com/CobyBurah/GroupD-SOEN341/commit/60c9b1de3bc70e2262a6ba059d82ffa5db80c082), and [original detailed AI log](2026-10-18-recruiter-management.md).
- **Human time reported:** Approximately 1 hour.

### Display applications received for a posting

- **Contribution reported by Eldar:** Worked on displaying received applications as part of the recruiter dashboard; approximately 1 hour of human effort.
- **Implemented behavior:** The posting owner can view applicants, submission dates, submitted-resume links and current application status. The integrated feature also provides status updates and scoped access to applicant information.
- **AI assistance documented in this session:** Inspected the received-applications page, status form and server actions; compared them with the Sprint 2 requirements; prepared and published the received-applications acceptance scenario and ownership/status checks. No separate prompt history for Eldar's earlier received-applications implementation was available, so it is not reconstructed here.
- **Shared-work attribution:** [PR #63](https://github.com/CobyBurah/GroupD-SOEN341/pull/63) contains the received-applications implementation; [commit 1a6a153](https://github.com/CobyBurah/GroupD-SOEN341/commit/1a6a153e8680b4a081d6045e07b819022b2332b8) is authored by Noah Dahan. This records Eldar's reported contribution without claiming sole authorship of that code.
- **Validation and remaining work:** Database policy tests passed during the local audit. The recruiter browser flow verified the empty applications state; populated recruiter UI and full real-Supabase acceptance execution remain pending in this session. PR #63 separately reports its author's live checks; those are not presented as checks performed by Eldar or Codex in this session.
- **Evidence:** [Received-applications acceptance test #98](https://github.com/CobyBurah/GroupD-SOEN341/issues/98) and [review task #82](https://github.com/CobyBurah/GroupD-SOEN341/issues/82).

The [individual contribution log](../../Sprint%20Deliverables/Sprint%232/Eldar_Contribution_Log.md) records these two approximately one-hour activities. Acceptance-test preparation time remains unspecified and is not added to the two-hour total.

## Requests and generated output

- User requested a review of acceptance-test requirements and current project coverage, then asked for help completing that part.
- Read Sprint 2 PDF requirements, repository tests/docs/stories, and connected GitHub issue bodies/labels/state.
- Prepared 22 local acceptance scenarios with steps, concrete data, expected results, story/task traceability, supporting automated coverage, and unfilled actual-result fields.
- Added an index, local verification record, proposed submission/tracking story corrections, missing implementation-task drafts and improvements for existing search acceptance issues.

Initial output: local drafts under docs/acceptance/sprint-2/. Publication occurred in the follow-up described below; application code was not changed. The local packet is not included in this AI-log commit.

## Validation and decisions

- Earlier in this session, 23 unit/database tests passed and build:test passed after enabling network access for Google Fonts.
- Installed Chrome ran the browser suite: 9 passed, 2 resume tests failed on final console-error assertions due to an unidentified resource 404. Reported failure without fabricating a root cause or weakening assertions.
- Real Supabase acceptance cases remain NOT RUN. Synthetic auth accepts arbitrary passwords and cannot establish real credential validation/email delivery.
- Initially, #44 combined a submission title with tracking criteria; publication clarified submission in #44 and added tracking story #78.
- Missing task issue links were initially marked pending; supporting tasks #79-84 were created during publication. Backlog scope must still be reconciled with committed sprint stories.
- Existing recruiter drafts are retained as historical material; the new index supersedes their integration-blocked assumptions for the current baseline.

## Human contribution record

Eldar requested/reviewed assistance and selected local drafts. Actual review, manual execution, changes adopted, time spent and published issue/commit links must be recorded by Eldar after they occur. Do not infer development credit for other members' existing implementation from these AI-authored acceptance drafts.

## User prompts and adopted changes

- “Check everything to do with the acceptance test and let me know.” Reviewed requirements and coverage before preparing scenarios.
- “Prepare local drafts.” Created 22 scenarios, result templates and traceability proposals.
- “publish the drafts to github” and “do this yourself.” Published approved scenarios after Eldar completed CLI authorization.
- “can you do my contribution log?” Used Eldar's approximate one-hour estimate for each of the two recruiter activities, kept acceptance preparation time unspecified, and credited shared implementation accurately.
- “push/commit it” and “can you merge it to the main?” Published the contribution log through PR #107 and merged it after both CI checks passed.
- “can you also put my ai backlog to the git.” Prepared this AI usage record for publication.

The user prompts above are excerpts; they describe the relevant instructions, not a complete transcript. No time estimates were generated by AI. Contribution-log wording was adjusted to acknowledge Noah's authorship of the received-applications implementation commit and to avoid claiming completed live acceptance testing.

## Published evidence

- [Acceptance-test issues assigned to Eldar](https://github.com/CobyBurah/GroupD-SOEN341/issues?q=is%3Aissue%20label%3A%22Acceptance%20Test%22%20assignee%3AEldarSadeghi): issues #85-106.
- [Application tracking story #78](https://github.com/CobyBurah/GroupD-SOEN341/issues/78).
- Supporting traceability tasks: [#79](https://github.com/CobyBurah/GroupD-SOEN341/issues/79), [#80](https://github.com/CobyBurah/GroupD-SOEN341/issues/80), [#81](https://github.com/CobyBurah/GroupD-SOEN341/issues/81), [#82](https://github.com/CobyBurah/GroupD-SOEN341/issues/82), [#83](https://github.com/CobyBurah/GroupD-SOEN341/issues/83), [#84](https://github.com/CobyBurah/GroupD-SOEN341/issues/84).
- [Clarified submission story #44](https://github.com/CobyBurah/GroupD-SOEN341/issues/44).
- [Contribution log PR #107](https://github.com/CobyBurah/GroupD-SOEN341/pull/107), merged after CI success; [contribution commit](https://github.com/CobyBurah/GroupD-SOEN341/commit/113e25418586a7d6a01b508b68a898bc595c55a9).

## Validation limits

The published issues were checked for open state, Acceptance Test label, assignment to EldarSadeghi, Sprint 2 milestone, parent/task links and NOT RUN live status. The earlier local browser audit had 9 passes and 2 console-404 failures; the later contribution-log PR's CI passed both checks. These are separate runs in different environments. Neither result establishes that the 22 real Supabase acceptance scenarios were executed. No shared database migrations or test-account mutations were performed during the acceptance audit/publication.

## Publication follow-up

The user subsequently authorized GitHub publication. The connector returned 403, so the official GitHub CLI was downloaded to a temporary directory; Eldar completed GitHub device authorization. After checking for duplicate issues, published 22 acceptance-test issues (#85-106), one tracking story (#78), six supporting traceability tasks (#79-84), and clarified #44 while preserving its state/assignees/milestone. All acceptance issues remain open and NOT RUN against real Supabase. Local index/cases now include published URLs. Existing search issues #70-72 were not rewritten. No application source or test assertions were changed; no local documentation commit/push was performed. Actual human time and execution remain to be recorded.
