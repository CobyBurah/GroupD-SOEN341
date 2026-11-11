# Sprint 3 AI Usage Log — Notification Inbox and Unread Bell

**Date:** November 10, 2026

**Responsible member:** Parsa Morshedlou (`bluwine`)

**Tool:** OpenAI Codex

## US-17 · In-app notifications and reminders

- **User request.** Parsa chose his part of the shared story with Eldar: “I’ll take the inbox and unread bell.” [Story #118](https://github.com/CobyBurah/GroupD-SOEN341/issues/118)
- **Generated output.** A signed-in header bell and a private, paginated inbox for recruiters and seekers. Recipients can mark individual notifications read and see the count change. Codex also prepared a storage migration, a database test and browser acceptance cases.
- **Integration decision.** The branch started from main at `8c7d98b`. Since main had no notification table, Codex added a minimal consumer contract in [migration 0017](../../supabase/migrations/0017_notification_inbox.sql). Trusted event producers insert a recipient (`user_id`), a display title and message. The database supplies an ID, creation timestamp and unread state. Authenticated clients can select their own rows and update the read flag. Notification generation remains a separate part of US-17.
- **Design decision.** The badge counts all unread rows, including older pages. Marking an item read refreshes the inbox and header. While a tab is visible, the header also checks for changes on navigation, on return to the tab and every minute.
- **Validation and modifications.** PGlite exercised the actual migration. Browser tests covered signed-out access, two account roles, an empty inbox, ordering, pagination and persisted read state. The first browser run exposed a test that reloaded before a page transition completed. Codex updated it to wait for the newer page and added a second-tab count check. [Database test](../../tests/notification-inbox.test.mjs) · [Browser tests](../../tests/browser/notification-inbox.spec.mjs)
- **Local results.** All 36 unit/database tests and all 26 browser tests passed. Type checking and the production build using the test configuration passed. Lint reported one existing unused-parameter warning. Automated visual checks verified the controls at 1280px and 375px.
- **Validation limits.** Browser tests used seeded notifications in the local Supabase fixture. Live Supabase deployment and delivery from application events or deadline reminders remain pending.
- **Human contribution.** Parsa selected the scope. His Sprint 3 time and personal demo results are awaiting his own record. [Contribution log](../../Sprint%20Deliverables/Sprint%233/Parsa_Contribution_Log.md)
