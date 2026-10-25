# Sprint 2 Individual Contribution Log

**Team member:** Nour Belkacemi

**GitHub username:** NourBelka

**Project:** CareerConnect — GroupD-SOEN341

**Sprint:** 2

## Contributions and time spent

| Activity | Contribution | Estimated time spent | Evidence |
|---|---|---|---|
| Job listing structure | Separated each job listing into a reusable `JobCard` component while keeping the existing Supabase job retrieval logic. | ~30 min | [Commit 986786d](https://github.com/CobyBurah/GroupD-SOEN341/commit/986786db1bf563d75e5e345d13f091876521a72e); [Issue #53](https://github.com/CobyBurah/GroupD-SOEN341/issues/53) |
| Job listing interface and styling | Implemented the job card layout and styling, including the information pills, typography, icons and responsive adjustments. | ~1 hour | [Commit 09dd31b](https://github.com/CobyBurah/GroupD-SOEN341/commit/09dd31bed454f02ae0ac77d5f0e423d301825e56); [Issue #52](https://github.com/CobyBurah/GroupD-SOEN341/issues/52) |
| Job details page | Created the dynamic job details page and connected job listings to their individual posting pages. | ~1 hour | [Issue #55](https://github.com/CobyBurah/GroupD-SOEN341/issues/55); [PR #66](https://github.com/CobyBurah/GroupD-SOEN341/pull/66) |
| Job-search review | Reviewed the existing search implementation and suggested changes for company search, employment type filtering and the related search form behavior. | ~30 min | [PR #67](https://github.com/CobyBurah/GroupD-SOEN341/pull/67) |
| Multi-select job filtering | Added support for multiple selected categories, employment types and workplace types while keeping the active filters in the URL. | ~1 hour | [Issue #47](https://github.com/CobyBurah/GroupD-SOEN341/issues/47); [PR #74](https://github.com/CobyBurah/GroupD-SOEN341/pull/74) |
| Location search and recruiter autocomplete | Added location suggestions to job search and recruiter location autocomplete using Geoapify with structured location values. | ~1 hour | [PR #74](https://github.com/CobyBurah/GroupD-SOEN341/pull/74); [Commit ebc11fd](https://github.com/CobyBurah/GroupD-SOEN341/commit/ebc11fd4d64de1172aa037d57d7430f7ded9aa1b) |
| Categories and workplace type | Added predefined categories and workplace types and separated workplace type from the geographic location field. | ~30 min | [PR #74](https://github.com/CobyBurah/GroupD-SOEN341/pull/74); [Commit e4c8968](https://github.com/CobyBurah/GroupD-SOEN341/commit/e4c8968f8733668b6359f943139a9959625e230f) |
| Job listing pagination | Added pagination with a maximum of 10 jobs per page while keeping active search/filter values during navigation. | ~30 min | [PR #74](https://github.com/CobyBurah/GroupD-SOEN341/pull/74); [Commit a663c06](https://github.com/CobyBurah/GroupD-SOEN341/commit/a663c0616ee4a9c1a15bb377cfee63e49682e729) |
| Tests and browser-test setup | Added/updated tests for the job-search features and fixed the Playwright browser-test setup so it worked with the local mock environment. | ~20 mins | [PR #74](https://github.com/CobyBurah/GroupD-SOEN341/pull/74); [Commit 413c1fa](https://github.com/CobyBurah/GroupD-SOEN341/commit/413c1fa94bb0e5beaf43053a9497865584e62ac6); [Commit 337eab2](https://github.com/CobyBurah/GroupD-SOEN341/commit/337eab2fb1ddd45a2f829020fa8fd163e611797d) |

**Total estimated time: around 6 hours.**

The final checks included:

- `npm run lint`
- `npm run typecheck`
- `npm test`
- `npm run test:browser`
- production and test builds

The final local test results included 19 passing unit/integration tests and 8 passing Playwright browser tests.

## Validation and AI assistance

I used AI (Codex/ChatGPT) during Sprint 2 mainly for help with implementation, debugging and testing. I reviewed the suggestions before using them and made changes when they did not fit the project or behave correctly during testing.

AI was useful for the filtering logic, location autocomplete, job details page and browser-test setup. The final implementation was still tested and adjusted locally before merging.