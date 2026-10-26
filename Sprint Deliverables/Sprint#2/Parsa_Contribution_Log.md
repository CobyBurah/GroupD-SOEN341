# Sprint 2 Individual Contribution Log

**Team member:** Parsa Morshedlou

**GitHub username:** bluwine

**Project:** CareerConnect — GroupD-SOEN341

**Sprint:** 2

## Contributions and time spent

| Activity | Contribution | Estimated time spent | Evidence |
|---|---|---|---|
| Recruiter Dashboard and Posting Management: preserve the resume submitted with an application | Selected and directed an AI-assisted improvement to application review. The implementation preserves the submitted resume when a job seeker later renames, replaces or deletes it, provides private application-specific downloads, and handles file retention and cleanup. The work also includes regression tests, deployment/demo documentation and publication through a pull request. | Approximately 2 hours | [User story #40](https://github.com/CobyBurah/GroupD-SOEN341/issues/40); [Received-applications acceptance test #98](https://github.com/CobyBurah/GroupD-SOEN341/issues/98); [PR #116](https://github.com/CobyBurah/GroupD-SOEN341/pull/116); [Implementation commit](https://github.com/CobyBurah/GroupD-SOEN341/commit/de8b8e64a718cf16a457b243d28433a43f59f4a4) |

**Total estimated time for the activity above: approximately 2 hours.**

The time estimate was supplied by Parsa for the resume-version work, including directing/reviewing the work and getting it published. It is approximate human effort, not automated execution time. No separate time estimates were supplied for individual steps.

## Additional documented contribution: regression coverage and demo preparation

The same contribution includes database, route, account-cleanup and browser regressions for submitted-resume retention, ownership/access checks, withdrawal and recruiter status updates. A six-step manual demo documents how to verify the feature after deployment.

- [Implementation, validation and manual demo notes](../../docs/recruiter/submitted-resume-versions.md)
- [Database retention and access regression](../../tests/submitted-resumes.test.mjs)
- [Submitted-resume browser regression](../../tests/browser/submitted-resumes.spec.mjs)
- [Application tracking story #78](https://github.com/CobyBurah/GroupD-SOEN341/issues/78)

**Time spent on regression coverage, documentation and publication:** included in the approximately 2-hour total above; no additional hours are claimed.

## Validation and AI assistance

Codex assisted with implementation, tests, documentation and publication. Parsa selected the improvement, requested implementation, provided the extracted handoff after the initial GitHub permission failure, and completed GitHub CLI authorization to publish the branch and PR.

- [Submitted-resume version AI log](../../AI_Log/Parsa_Sprint2/submitted-resume-versions.md)
- [Successful GitHub CI run](https://github.com/CobyBurah/GroupD-SOEN341/actions/runs/40358366736)

Local validation recorded 35 passing automated tests and 24 passing browser tests. Type checking, the production build and the browser-test build passed; lint reported no errors and one existing unused-parameter warning. Both GitHub CI jobs subsequently passed for commit `c04887e`.

These automated checks used PGlite and a local synthetic Supabase fixture. The shared Supabase migration and live manual acceptance scenario remain NOT RUN; they are not presented as completed personal testing by Parsa.
