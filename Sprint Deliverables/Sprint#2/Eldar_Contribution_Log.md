# Sprint 2 Individual Contribution Log

**Team member:** Eldar Sadeghi

**GitHub username:** EldarSadeghi

**Project:** CareerConnect — GroupD-SOEN341

**Sprint:** 2

## Contributions and time spent

| Activity | Contribution | Estimated time spent | Evidence |
|---|---|---|---|
| Recruiter Dashboard and Posting Management: create and manage job postings | Worked on the recruiter dashboard and the ability for recruiters to create, edit and remove their own postings. The implementation includes validation, role/ownership checks, confirmed soft deletion and shared signed-in navigation. | Approximately 1 hour | [User story #40](https://github.com/CobyBurah/GroupD-SOEN341/issues/40); [PR #58](https://github.com/CobyBurah/GroupD-SOEN341/pull/58); [Eldar's implementation commit](https://github.com/CobyBurah/GroupD-SOEN341/commit/60c9b1de3bc70e2262a6ba059d82ffa5db80c082) |
| Recruiter Dashboard and Posting Management: display applications received for a posting | Worked on the received-applications feature as part of the recruiter dashboard. The current feature displays applicants for a posting, submission dates, submitted-resume links and application statuses. This was shared work: the received-applications implementation commit is credited to Noah Dahan; its link documents the integrated feature rather than claiming sole code authorship for Eldar. | Approximately 1 hour | [Received-applications PR #63](https://github.com/CobyBurah/GroupD-SOEN341/pull/63); [Shared implementation commit, authored by Noah](https://github.com/CobyBurah/GroupD-SOEN341/commit/1a6a153e8680b4a081d6045e07b819022b2332b8); [Review task #82](https://github.com/CobyBurah/GroupD-SOEN341/issues/82) |

**Total estimated time for the two activities above: approximately 2 hours.**

The time estimates were supplied by Eldar. They are approximate human effort, not automated execution time. Exact work dates were not supplied and have not been inferred from commit timestamps.

## Additional documented contribution: acceptance-test preparation

Prepared, reviewed and published 22 acceptance-test scenarios covering the main implemented Sprint 1 and Sprint 2 features, including recruiter posting management and received applications. The issues include steps, expected results, story/task links and result-recording fields.

- [Published acceptance tests assigned to Eldar](https://github.com/CobyBurah/GroupD-SOEN341/issues?q=is%3Aissue%20label%3A%22Acceptance%20Test%22%20assignee%3AEldarSadeghi)
- [Recruiter create/edit acceptance test #96](https://github.com/CobyBurah/GroupD-SOEN341/issues/96)
- [Recruiter deletion/ownership acceptance test #97](https://github.com/CobyBurah/GroupD-SOEN341/issues/97)
- [Received-applications acceptance test #98](https://github.com/CobyBurah/GroupD-SOEN341/issues/98)

**Time spent on acceptance-test preparation:** not yet supplied; excluded from the approximately 2-hour total above.

## Validation and AI assistance

Codex assisted with implementation, documentation and acceptance-test preparation. Eldar's AI usage records describe the generated work and validation activities:

- [Recruiter posting-management AI log](../../AI_Log/Eldar_Sprint2/2026-10-18-recruiter-management.md)
- Acceptance-test preparation/publication AI notes are saved locally and await separate publication; the published acceptance issues linked above provide the current GitHub evidence.

The local acceptance audit recorded 23 passing unit/database tests and 9 passing browser tests, with 2 browser tests failing on console-resource 404 errors. These automated checks were run with AI assistance and do not constitute Eldar's completed manual acceptance testing. The published real-Supabase acceptance scenarios remain NOT RUN; this log does not claim that all acceptance tests passed.
