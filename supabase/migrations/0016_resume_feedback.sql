-- AI-generated resume feedback (US-10). One row per feedback run; a resume
-- can be re-run ("regenerate"), so this is append-only, not one-per-resume.
create table public.resume_feedback (
  id uuid primary key default gen_random_uuid(),
  resume_id uuid not null references public.resumes (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  model_name text not null,
  feedback jsonb not null,
  created_at timestamptz not null default now()
);

create index resume_feedback_resume_id_idx on public.resume_feedback (resume_id, created_at desc);

alter table public.resume_feedback enable row level security;

create policy "Users can view their own resume feedback"
  on public.resume_feedback for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- Only job seekers request feedback; recruiters have no business reason to.
create policy "Job seekers can insert their own resume feedback"
  on public.resume_feedback for insert
  to authenticated
  with check (
    (select auth.uid()) = user_id
    and (select role from public.profiles where id = (select auth.uid())) = 'job_seeker'::public.user_role
    and exists (
      select 1 from public.resumes
      where resumes.id = resume_id and resumes.user_id = (select auth.uid())
    )
  );

create policy "Users can delete their own resume feedback"
  on public.resume_feedback for delete
  to authenticated
  using ((select auth.uid()) = user_id);
