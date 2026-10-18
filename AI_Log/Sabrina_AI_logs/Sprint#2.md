# AI Log #1 - Sprint 2 
Wednesday October 14th, 2026

**Task ID/Title:** 
- Task: Job table in Supabase and learning SQL/PostgreSQL

**Purpose of AI Use:** 
- Help me understand about SQL and PostgreSQL that is used and runned with Supabase (the database we are using)
- Help me organize the sub tasks needed to be complete with the feature of Job Listing, Job searching and filtering
- Help me understand RLS (row level secruity) and why it is needed
- Helped me to run the SQL to Supabase and debug 1 issue and to push/commit it to GitHub
- Github organization for the features

**Claude Link to conversation:**
https://claude.ai/share/f15a9475-49e9-4435-b206-9cca29a6e26d

**AI-Suggested Content:** 
- Briefly gave me a list of the sub taks needed to complete job listing, job searching and filtering which helps to better divide the work between me and my teamate completing this feature, showed me how to run my code SQL file to Supabase, explained me SQL and PostgreSQL. Also gave me steps on how to push/commit it safely to github for review from my teamates before merging.

**Validation:** 
- Ran the SQL in the Supabase SQL Editor and confirmed the 'jobs' table and columns in the table editor
- Tested the connection with 'SELECT 1;' while debugging the timeout error
- Compared the RLS explanation against Supabase information
- Reviewed the task breakdown with my teamate before I created the issues

**Decision:** 
- There was a couple of things that I changed like choosing the SQL editor over the CLI migrations, but the overall knowledge that Claude AI output gave me as sub tasks, I did use for the Job listing, searching and filtering. I did write each sub task in my own words and description since I didn't really like the way it briefly and not clearly explained each sub task. It definitely helped organize my thoughts on where to begin and how to divide the work.
- Explanations and learning SQL and PostgreSQL and why we need RLS helped big time and helped me dive deeper in the understanding of the language
- Push/commit my code to github step by step explanation definitely helped as well


**Reflection:** 
- This part still took me awhile since I was validating through internet research and with Supabase but it definitely made it easier to organize my thoughts for the feature I was assigned to complete for Sprint 2 and helped me learn and answer my questions on the SQL, PostgreSQL, RLS which allowed me to have alittle more of a solid understanding behind how it can be created. Basically helped be a tutor for a language in which I never worked with before and database supabase, answer my question, and reflect on how to view the organization of a feature and it's subtasks which makes it easier to divide amongst teammates. 

**Responsible Person:** 
- Sabrina who conducted the interaction and completed task 1. Job Table in Supabase ('US-06 Job Search, Filering and Job Listing Interface')

---
# AI Log #2 - Sprint 2 
Friday October 17th, 2026

**Task ID/Title:**
- Task: Sample job data for the Job Listing display (US-06 Job Search, Filtering and Job Listing Interface)

**Purpose of AI Use:**
- Generate fake/sample job listing data to test the job display while I code the feature myself
- Reformat the sample data to match the columns of our jobs table in Supabase (recruiter_id, title, company, location, category, employment_type, salary, description, created_at)
- Get test data with enough variety (locations, categories, employment types, remote jobs) to also test searching and filtering
- Get a second opinion on how to handle recruiter_id since recruiter accounts haven't yet been created

**Claude Link to conversation:**
- https://claude.ai/share/a18c4215-8b17-47a5-87c3-42272bd04888

**AI-Suggested Content:**
- First gave me a list of 12 fake jobs in JSON format with fields like id, title, company, location, category, type, salary, postedDate, description and requirements
- After I gave it the exact columns from our jobs table, it reformatted the 12 jobs to match: recruiter_id, title, company, location, category, employment_type, salary, description, created_at
- When I asked whether attaching all jobs to the first existing account (until teammates build recruiter accounts) was a good approach, it said yes as a temporary fix, and suggested: using a dedicated placeholder recruiter account instead of a real teammate's account and putting the data in a script/migration so it can be updated in one place

**Validation:**
- Checked that every field matched the column names and types in our jobs table
- Inserted the data into Supabase and the rows appeared in the Table Editor

**Decision:**
- Only used the AI for generating fake test data and I wrote all the code for displaying the jobs myself
- The first version didn't match our database columns, so I asked for it to be reformatted to our exact table fields and used that version
- Temporarily attached all jobs to the first existing account; my teammates working on the recruiter account feature will reassign them later
- Did not take the suggestion to put the data in a script/migration; I inserted the data directly in Supabase since it's only temporary test data 

**Reflection:**
- Saved time writing realistic test data by hand, so I could focus on coding the job display feature itself

**Responsible Person:**
- Sabrina, who conducted the interaction and is completing the 2. Add jobs data (US-06 Job Search, Filtering and Job Listing Interface)


---
# AI Log #3 - Sprint 2 
Sunday October 18th, 2026

**Task ID/Title:**
- Task: Load jobs from the Supabase jobs table and display them on the Job Listing page (US-06 Job Search, Filtering and Job Listing Interface)

**Purpose of AI Use:**
- Get guidance (not code) on how to load data from our Supabase jobs table into a Next.js server component using TypeScript
- Learn TypeScript basics, since I know JavaScript but am new to TypeScript (learning alongside W3Schools)
- Understand async/await and why the data loading functions need it
- Get my own code reviewed for the getJobs() and getJob(id) functions in src/lib/

**Claude Link to conversation:**
https://claude.ai/share/9bd7fa2f-67b3-45c0-a3c3-9fa4e890d7b3

**AI-Suggested Content:**
- Explained the overall: Supabase jobs table → data loading function in src/lib/ → async server component page that awaits the data and renders it
- Explained TypeScript concepts as they applied to my task
- Explained async/await (Promises, why await is needed for network requests, and that forgetting await is a common bug)
- Walked me through how to build the query in steps without giving me the code
- Reviewed my getJobs() code: confirmed the query, Job type, and error handling were correct; pointed out the missing return statement, missing return type annotation, and suggested the ?? operator to fall back to an empty array when data is null
- Reviewed my getJob(id) code: confirmed .eq() and .maybeSingle() were good choices; corrected my comment about Postgres error code 22P02 (it means the input isn't valid for the column type, e.g. the id isn't a valid UUID); suggested adding the return type

**Validation:**
- Compared my Job type with the columns and types in our jobs table migration
- validated my learning with online resourches like W3schools, PostgreSQL.org documentation for the error codes list https://www.postgresql.org/docs/current/errcodes-appendix.html

**Decision:**
- Asked for guidance only, not code; I wrote all the code for getJobs() and getJob(id) myself
- Used .order('created_at', { ascending: false }) to sort newest first
- Used ?? [] so the page always receives an array, as suggested

**Reflection:**
- Learned TypeScript concepts directly in the context of my feature instead of only through generic examples, which made them easier to understand
- Getting my code reviewed step by step caught a missing return statement before it caused a bug on the page

**Responsible Person:**
- Sabrina, who conducted the interaction and is completing 3.Displaying the jobs from supabase to website display for US-06 Job Search, Filtering and Job Listing Interface


