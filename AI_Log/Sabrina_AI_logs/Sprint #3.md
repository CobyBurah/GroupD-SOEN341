# AI Log #1 - Sprint 3

November 13th, 2026

**Task ID/Title:**

- Task: Recruiter Application Filtering (sub-issues: Application status filter and Application date filter)

**Purpose of AI Use:**

- Help me organize the steps and sub tasks needed to complete the Recruiter Application Filtering user story, in order
- Help me understand which files I needed to create and which existing files I needed to edit
- Help me figure out how to check that the text in the URL is a real date written like 2026-11-13
- Give me steps on how I could write the filter functions, the page changes and the filter form myself
- Review the code I wrote and catch bugs, typos and edge cases
- Generate unit tests for the filter functions

**Claude Link to conversation:**
https://claude.ai/share/527ff885-9729-4344-b8bb-ef67b3fec7e1

**AI-Suggested Content:**

- Gave me an ordered walkthrough of the story: status filter, date filter, clear filters, empty-state message, regression check on the status update from Sprint 2, tests, then commit and pull request. 
- Suggested helper functions for reading the filters from the URL and showed a date check. Its first version of the date check had a bug: new Date("2026-02-31"). It caught and corrected this.
- Gave me step-by-step hints for hasActiveFilters, applicationDate and filterApplications<T>, and explained how the generic <T> works.
- Told me which lines to change in the recruiter applications page.tsx, and gave me steps to build the filter form with <form method="get"> so the filters go in the URL.


**Validation:**

- Tested my isDateInput function against a table of valid and invalid dates (leap years, 2026-02-31, wrong formats)
- Checked the three-application example against my filterApplications function
- Tested the filters in the browser: filter by status, filter by a date range with no matches, clear filters, and change a status while filtered
- Ran the unit tests 

**Decision:**

- I used the overall order of the steps of AI, but I chose my own design and stored the filters in the URL instead of using the AI's first in-memory helper. I also used our existing isApplicationStatus function instead of redefining the statuses.
- I wrote my own date check (isDateInput) using a toISOString() instead of the AI's version. Claude confirmed it was correct and suggested a type guard and a comment fix.
- I wrote parseApplicationFilters, the filter functions, the page changes and the filter form with AI help and walk through. I swapped the variable names so the list didn't need to change, fetched profiles only for the filtered applications, and showed dates in UTC to match the filter.
- When I put my own formKey, Claude pointed out that without separators two different filters could give the same key, so I added them.
- I wrote my own CSS and changed the labels to "Search status" and "Date applied" because I found them more professional.

**Reflection:**

- Asking for steps and hints helped me understand where to start and helped me especially TypeScript generics, type guards and how a GET form puts filters in the URL. The date bug in the AI's first answer showed me that AI code has to be checked and tested, because it isn't always right. Having my own code reviewed caught small mistakes I had missed, like the key and typos. Overall it worked in helping me and as a code reviewer, and it helped me finish both sub-issues in order.

**Responsible Person:**

- Sabrina, who conducted the interaction and completed the Recruiter Application Filtering story (Application status filter and Application date filter)




