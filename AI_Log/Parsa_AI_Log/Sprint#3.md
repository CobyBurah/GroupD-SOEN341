# AI Log #1 - Sprint 3

November 10, 2026

**Task ID/Title:**

- US-17 (#118) — Prototype a private notification inbox and unread bell.

**Purpose of AI Use:**

- Develop the inbox and unread count for the story Parsa shared with Eldar. Both job seekers and recruiters need to see their own updates.

**AI Tool and Link to conversation:**

- OpenAI Codex desktop. The [original session record](archive/2026-11-10-notification-inbox.md) preserves the prompt and links to the prototype.

**Prompt excerpts:**

- “I’ll take the inbox and unread bell.”

**AI-Suggested Content:**

- A recipient-scoped inbox ordered newest first, a header bell showing the total unread count, and an individual mark-as-read action. Codex supplied a prototype migration, database tests and browser tests.

**Validation:**

- All 36 unit/database tests and 26 browser tests passed on the prototype. They covered both roles, pagination, unread counts and read state after refresh. A browser test initially reloaded before navigation finished. Codex changed it to wait for the new page and added a second-tab count check.

**Decision:**

- Count unread alerts across the account’s entire inbox, including later pages. Parsa published the prototype on its own branch. The team subsequently integrated Eldar’s notifications implementation in PR #145.

**Reflection / review notes:**

- The database policy tests checked who could read and update a row. The two-tab browser check showed when the updated count became visible to someone already using the app.

**Evidence:**

- [Prototype commit](https://github.com/CobyBurah/GroupD-SOEN341/commit/5445e5529f2ec827237b6b0092730b82588c5729) · [Shared story #118](https://github.com/CobyBurah/GroupD-SOEN341/issues/118) · [Eldar’s integrated implementation](https://github.com/CobyBurah/GroupD-SOEN341/pull/145)

**Responsible Person:**

- Parsa Morshedlou (`bluwine`) selected the inbox and unread bell. Codex assisted with implementation and automated verification.

# AI Log #2 - Sprint 3

November 13, 2026

**Task ID/Title:**

- US-17 (#118) — Find older unread notifications in the integrated inbox.

**Purpose of AI Use:**

- Identify and implement a demonstrable improvement to the inbox already on the team’s main branch. The bell could count an unread interview invitation hidden beyond the newest 200 messages.

**AI Tool and Link to conversation:**

- OpenAI Codex desktop. The [original session record](archive/2026-11-13-unread-filter.md) documents the request, implementation and checks.

**Prompt excerpts:**

- “keep the current state of the project in mind and do some stuff related to my task and push.”

**AI-Suggested Content:**

- Add All and Unread views and filter the signed-in user’s rows before pagination. Store the view in the URL. Use the existing read actions so clearing one alert removes it from Unread and refreshes the bell.

**Validation:**

- Seeded 201 newer read messages and 21 older unread alerts. The browser test found the oldest invitation, marked it read and checked the bell dropped from 21 to 20. Marking all read cleared the badge. The test also exercised refresh, browser Back and pagination. All 64 unit/database tests and 29 browser tests passed in the feature’s GitHub CI run.

**Decision:**

- Build on Eldar’s inbox and reuse its notification table. Applying the filter in the database makes older unread alerts available even when the All view reaches its 200-message limit.

**Reflection / review notes:**

- A small inbox would hide the original problem. Seeding more read messages than the All view can show made the regression reproducible and gave the team a repeatable demo.

**Evidence:**

- [PR #146](https://github.com/CobyBurah/GroupD-SOEN341/pull/146) · [Feature CI results](https://github.com/CobyBurah/GroupD-SOEN341/actions/runs/43486986983) · [Local demo](../../docs/notifications/unread-inbox.md)

**Responsible Person:**

- Parsa Morshedlou (`bluwine`) requested the improvement and authorized publication. Codex assisted with the code, tests and demo. [Sprint 3 contribution log](../../Sprint%20Deliverables/Sprint%233/Parsa_Contribution_Log.md)

# AI Log #3 - Sprint 3

November 14, 2026

**Task ID/Title:**

- Organize Parsa’s AI usage records for the Sprint 3 submission.

**Purpose of AI Use:**

- Align the folder layout and entries with the team’s accepted format and make the evidence for each activity easy to locate.

**AI Tool and Link to conversation:**

- OpenAI Codex desktop. The request is quoted below.

**Prompt excerpts:**

- “I'm told to fix my AI log structure”

**AI-Suggested Content:**

- One personal folder with a file for each sprint. Each entry records the task, purpose, tool, prompt evidence, AI output, validation, decision, reflection and responsible person.

**Validation:**

- Compared the entries with Eldar’s merged example. Checked the recorded Sprint 1 backlog against issue #9 and the published commit, then verified that local evidence links and both contribution-log references resolve.

**Decision:**

- Keep the dated session records in the archive and retain the original Sprint 1 ChatGPT link. Where the original record contains only a link, refer to the published evidence and leave the exact prompt unspecified.

**Reflection / review notes:**

- The November 10 prototype and November 13 change need distinct entries. Their commits and test results refer to different implementations of the same user story.

**Evidence:**

- [Team format in PR #156](https://github.com/CobyBurah/GroupD-SOEN341/pull/156) · [Sprint index](readme.md)

**Responsible Person:**

- Parsa Morshedlou (`bluwine`) requested the correction. Codex reorganized the records and checked the references.
