# AI Log #1 - Sprint 2
Monday October 19th, 2026

**Task ID/Title:**
- Task: Forgot password / reset password with Supabase Auth

**Purpose of AI Use:**
- Help me understand how password recovery works in Supabase Auth
- Help me plan the pages and routes needed: a "Forgot your password?" page, the `/auth/confirm` route that the email link goes to, and a "Reset password" page
- Help me reuse the password rules we already had on the profile page so both forms check passwords the same way

**Claude Link to conversation:**
- https://claude.ai/code/session_01G8BH94rGYBSfNQbZs5s2uP

**AI-Suggested Content:**
- Claude planned out and built the flow: the user enters their email, Supabase sends a reset email, the link in the email goes to `/auth/confirm` which verifies the token and signs the user in, then sends them to `/reset-password` to choose a new password.

**Validation:**
- Ran `npm test` and all 6 unit tests passed

**Decision:**
- I kept the overall flow Claude generated as it made sense and worked with no issues
- Claude suggested setting up custom SMTP for email sending but I decided this was not necessary as we won't be sending out many emails, so the Supabase default email was fine
- I needed to manually add our dev server as a url redirect in the Supabase settings
  
**Reflection:**
- This helped me understand the way that Supabase auth handles password reset emails and flows and the security that goes with this when implementing it in the app.
  
**Responsible Person:**
- Coby, who conducted the interaction and completed the forgot password / reset password feature

## AI Log #2 - Sprint 2

**Saturday October 24th, 2026**

### Task ID/Title

Task: My Applications page for job seekers

### Purpose of AI Use

- Help me plan a page where job seekers can see every job they applied to and its current status
- Help me keep a history of each status change, since we only stored the current status
- Help me let seekers withdraw their own applications safely

### Claude Link to conversation

https://claude.ai/code/cshk_014uyYnBeXyoLX8iC41VQzprUwnppEDaYrsw1oTZ5JKTs5

### AI-Suggested Content

Claude Code built the `/applications` page with status badges, a status filter, a "View history" timeline and a Withdraw button. It also wrote a migration with a database trigger that records every status change automatically, plus unit and browser tests for the feature.

### Validation

- Ran `npm test` and all 23 unit tests passed

### Decision

- I kept the trigger approach Claude suggested since it records history automatically without recruiters doing anything extra
- I decided withdrawing should fully delete the application so seekers can reapply to the same job later

### Reflection

This helped me understand how database triggers and row-level security work together in Supabase, especially how the database can record history without users being allowed to write to it themselves.

### Responsible Person

Coby, who conducted the interaction and completed the My Applications feature and its tests
