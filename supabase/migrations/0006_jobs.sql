-- Creating the Table for the jobs where every job posting is stored. 
-- 1 row is like = to 1 job 
-- Needed for the job list page, job detail page, search, recruiter dashboard, applications.


create table public.jobs ( -- creating table and its columns: Basically a table named "jobs" in the public place of the database
    id uuid primary key default gen_random_uuid(), -- Id for each id that is unique, 'primary key': meaning no 2 jobs can ever have the same Id 
                                                   -- 'gen_random_uuid()': default, meaning the database makes the ID automatically and the detail page will use this ID in its URL
    recruiter_id uuid references public.profiles (id) on delete cascade, -- states which recruiter posted that job 
                                                                         -- 'reference public.profiles (id)': taking a real user in the profile table (meaning it is always pointing to some user and not a user that doesnt exists)
                                                                         -- 'on delete cascade' : if the recruiter ends up deleting their account then their job postings will be deleted too
    job_title text not null, -- basically a job title of any length must be required because a job can't be saved without it
    company_name text not null, -- requires a company name 
    job_location text, -- the location of the job 
    job_category_field text, -- the field of the job or position 
    job_status text, -- full time status, part-time...
    job_salary text, -- the yearly salary of the job
    job_description text not null, -- required full job description shown on the detail page 
    date_of_job_posted timestamptz not null default now() -- the date and time the job was posted, 'timestamptz': is the date + the time, 
                                                          --'default now': filled in automatically with the current time
                                                          -- the newest jobs are shown first in the listing page 

);

-- RLS : Row level security which means protection for every row that not just anyone can change or be able to see it 
-- we dont want anyone being able to change the information or delete information 
-- must add rules that allows certain people 
alter table public.jobs enable row level security;
create policy "User's logged in, have access to view jobs"
    on public.jobs for select -- only focus on viewing the jobs --> 'for select'
    to authenticated -- applies to the policy of the users who are logged in only 
    using (true); --can view any job 
