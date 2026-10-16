-- Job postings: one row per job, owned by the recruiter who posted it.
-- Backs the job list, job detail, search, and recruiter dashboard pages.
create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  recruiter_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  company text not null,
  location text,
  category text,
  employment_type text check (
    employment_type in ('full_time', 'part_time', 'contract', 'internship')
  ),
  salary text,
  description text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- The listing page shows newest jobs first; the recruiter dashboard filters by owner.
create index jobs_created_at_idx on public.jobs (created_at desc);
create index jobs_recruiter_id_idx on public.jobs (recruiter_id);

alter table public.jobs enable row level security;

create policy "Authenticated users can view jobs"
  on public.jobs for select
  to authenticated
  using (true);

-- No insert/update/delete policies yet: those come with the recruiter
-- job-posting story and should check recruiter_id and role = 'recruiter'.
