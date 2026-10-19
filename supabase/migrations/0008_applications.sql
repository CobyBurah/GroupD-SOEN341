-- Applications retain the selected resume reference and start as Applied.
create table public.applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id),
  user_id uuid not null references auth.users(id) on delete cascade,
  resume_id uuid references public.resumes(id) on delete set null,
  status text not null default 'Applied' check (status in ('Applied', 'Interview', 'Offered', 'Rejected')),
  created_at timestamptz not null default now(),
  unique (job_id, user_id)
);
alter table public.applications enable row level security;
create policy "Seekers can read their applications"
  on public.applications for select to authenticated
  using (user_id = (select auth.uid()));
create policy "Seekers can apply with their own resume to active jobs"
  on public.applications for insert to authenticated
  with check (
    user_id = (select auth.uid()) and status = 'Applied'
    and (select role from public.profiles where id = (select auth.uid())) = 'job_seeker'::public.user_role
    and exists (select 1 from public.jobs where id = job_id and deleted_at is null)
    and exists (select 1 from public.resumes where id = resume_id and user_id = (select auth.uid()))
  );
