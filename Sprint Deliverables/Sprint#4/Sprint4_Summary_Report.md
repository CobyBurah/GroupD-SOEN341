# Sprint 4 Summary Report — Draft

**CareerConnect, GroupD-SOEN341**

November 17 to December 7, 2026. Progress recorded November 22. Final report owner, Eldar (#204).

## Objectives

Finalize and reverify the six feature areas, complete both AI features, address defects and dependency vulnerabilities, maintain automated checks, and prepare the team demonstration and individual contribution/AI reports.

## Features and team innovation

The integrated project provides account/profile and resume management, job search and saved jobs, application submission and chronological status history, recruiter posting/review tools, notifications and activity analytics. Sprint 4 added AI job matching alongside resume feedback. Matching ranks eligible postings and returns grounded reasons and skills to strengthen. The server filters unsupported job IDs and checks ownership and role before model calls. Both features use local Ollama.

## Quality and challenges

The team upgraded Next.js, split CI into nine workflows, added CodeQL and dependency audit, corrected authentication-link validation and hardened the AI feedback flow. Live AI testing exposed a recruiter-mode request that ran the model before a database refusal. The route now rejects that request earlier. Noah recorded live results for both AI features on November 21. Eldar recorded live notification results on November 22.

Deadline enforcement and search escaping remain open at this snapshot. The remaining feature verification, review settings, shared QA cleanup and final rehearsal are tracked in the workplan. Parsa's live application rerun is deferred. The final report should be refreshed after those results and reviewed PRs reach main.

## Team contributions

Noah completed AI matching, AI validation, CI/security work and supporting tests. Eldar completed repository organization and notification verification and owns QA cleanup and the final report. Coby owns review enforcement, Auth protection and account/resume verification. Sabrina owns deadline fixes, recruiter verification and meeting minutes. Nour owns search fixes, search verification and analytics checks. Parsa is preparing the app icon, sprint workplan, application verification evidence, demo package and personal logs.

[Workplan and issue evidence](Sprint4_Workplan.md) · [AI test results](../../docs/ai-validation/sprint4-acceptance-results.md) · [Notification test results](../../docs/notifications/acceptance/2026-11-22/README.md)

**Repository** [CobyBurah/GroupD-SOEN341](https://github.com/CobyBurah/GroupD-SOEN341)
