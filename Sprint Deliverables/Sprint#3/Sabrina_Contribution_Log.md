# Sprint 3 Individual Contribution Log

**Team member:** Sabrina Marsillo  
**GitHub username:** sm3339  
**Project:** CareerConnect — GroupD-SOEN341  
**Sprint:** 3

## Contributions and time spent

| Activity | Contribution | Estimated time spent | Evidence |
|---|---|---:|---|
| Meeting minutes | Created and wrote the minutes for all three Sprint 3 meetings, including attendees, discussions, decisions and action items. | ~30 min | [Meeting-Sprint#3.md](https://github.com/CobyBurah/GroupD-SOEN341/blob/main/Meeting_Minutes/Meeting-Sprint%233.md); [Commit 4cb60c7](https://github.com/CobyBurah/GroupD-SOEN341/commit/4cb60c7737f44affc747c152d01883589307b6da); [Commit 16598a7](https://github.com/CobyBurah/GroupD-SOEN341/commit/16598a7d4a49e3447b0333aff37c15131518a430) |
| Recruiter application filtering (US-19) | Added status and date-applied filters to the recruiter's applications page, a "Show all applications" option, a message when no applications match, and kept the filters to the selected job posting. | ~2 hours | [Commit d2fac12](https://github.com/CobyBurah/GroupD-SOEN341/commit/d2fac126ddaba8c1fc40f1ad6b2a67b3b5e4e0d4); [Commit f57fba0](https://github.com/CobyBurah/GroupD-SOEN341/commit/f57fba001222f445d42487860d7530f2d3e8bac7); [PR #147](https://github.com/CobyBurah/GroupD-SOEN341/pull/147) |
| Filter interface reworking | Reworked the filter layout so the status and date filters is on one line, grouped the dates under "Date applied". | ~30 min | [Commit 1f3932d](https://github.com/CobyBurah/GroupD-SOEN341/commit/1f3932db14ab4eea695644479eb5fc002573d55a); [PR #147](https://github.com/CobyBurah/GroupD-SOEN341/pull/147) |
| US-19 Unit Testing | Added 11 unit tests for the filter logic (status, date range, combined filters, invalid values, no matches), tested every acceptance criteria. | ~1 hour 30 min | [PR #147](https://github.com/CobyBurah/GroupD-SOEN341/pull/147); [AT-US19-01 #148](https://github.com/CobyBurah/GroupD-SOEN341/issues/148); [AT-US19-02 #149](https://github.com/CobyBurah/GroupD-SOEN341/issues/149) |
| Job search bug fix | Fixed the Sprint 2 bug where searching "Hybrid", "Remote" or "On-site" returned no jobs by including the workplace type in the keyword search, and added a unit test for it. | ~45 min | [Bug #122](https://github.com/CobyBurah/GroupD-SOEN341/issues/122); [Commit ca80d4b](https://github.com/CobyBurah/GroupD-SOEN341/commit/ca80d4b418c0fe407a0962fd01e2cd20cab32248); [PR #150](https://github.com/CobyBurah/GroupD-SOEN341/pull/150) |
| AI usage log | Kept my Sprint 3 AI usage log updated with prompts, outputs, changes made and validation steps. | ~45 min | [Sabrina AI log, Sprint 3](https://github.com/CobyBurah/GroupD-SOEN341/blob/main/AI_Log/Sabrina_AI_logs/Sprint%20%233.md) |

**Total estimated time: around 9 hours 30 minutes.**

## Validation and AI assistance

I used AI (Claude) during Sprint 3 for implementation guidance, validating my code, debugging and testing. I reviewed and adjusted the suggestions before using them, and fixed issues found during testing.

The final implementations were tested locally (unit tests, lint, type check and manual testing in the browser) and checked through GitHub CI before merging.
