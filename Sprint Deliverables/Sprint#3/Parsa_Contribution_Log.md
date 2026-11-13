# Sprint 3 Individual Contribution Log

**Team member:** Parsa Morshedlou

**GitHub username:** bluwine

**Project:** CareerConnect — GroupD-SOEN341

**Sprint:** 3

## Contributions and time spent

| Activity | Contribution | Estimated time spent | Evidence |
|---|---|---|---|
| US-17 inbox and unread bell prototype, Nov 10 | Selected the inbox and bell portion of the shared story and developed an AI-assisted prototype on a separate branch. The team’s integrated notification system came from Eldar’s PR #145. | Not yet supplied | [Prototype commit](https://github.com/CobyBurah/GroupD-SOEN341/commit/5445e5529f2ec827237b6b0092730b82588c5729) · [Eldar’s merged implementation](https://github.com/CobyBurah/GroupD-SOEN341/pull/145) |
| US-17 unread inbox filter, Nov 13 | Built on the merged inbox with Codex assistance. Added an Unread view that finds alerts older than the 200 newest inbox items. Marking an alert read removes it from the view and updates the bell. Added a browser regression test and a local demo using the same sample inbox. | Not yet supplied | [Inbox](../../src/app/%28protected%29/notifications/notification-inbox.tsx) · [Browser test](../../tests/browser/notification-filter.spec.mjs) · [Demo steps](../../docs/notifications/unread-inbox.md) |

**Total estimated time:** awaiting Parsa’s Sprint 3 estimate.

## Validation and AI assistance

Codex ran the automated checks against the local browser fixture and database tests. The filter scenario demonstrates a bell count of 21, then 20 after marking the oldest invitation read, then zero after marking all read. [Nov 13 AI log](../../AI_Log/Parsa_Sprint3/2026-11-13-unread-filter.md) · [Nov 10 prototype AI log](https://github.com/CobyBurah/GroupD-SOEN341/blob/5445e5529f2ec827237b6b0092730b82588c5729/AI_Log/Parsa_Sprint3/2026-11-10-notification-inbox.md)
