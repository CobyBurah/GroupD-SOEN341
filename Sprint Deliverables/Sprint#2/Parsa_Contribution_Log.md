# Parsa — submitted resume version retention

**GitHub:** `bluwine`
**Related assigned work:** recruiter posting management #40 and received-applications acceptance scenario #98.
**Pull request:** [#116 — Preserve submitted resume versions for application review](https://github.com/CobyBurah/GroupD-SOEN341/pull/116).

Parsa selected and requested an AI-assisted improvement to application review: keep the resume actually submitted when the applicant subsequently renames, replaces or deletes a resume from their list.

The contribution contains a database migration with snapshot/retention rules, private application-specific download links for seekers and recruiters, cleanup behavior, regression tests, and a reproducible demo. See [implementation and demo notes](../../docs/recruiter/submitted-resume-versions.md) for evidence. After an initial GitHub integration permission failure, Parsa moved the work to the desktop app; the handoff was applied to current `main` on `feature/submitted-resume-versions` and all local automated checks were rerun successfully.

See the [AI assistance log](../../AI_Log/Parsa_Sprint2/submitted-resume-versions.md) for the division of work. Automated validation is recorded in the implementation notes; deployment and personal manual verification remain separate. No human time total or live-test result is claimed here.
