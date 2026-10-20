-- US-05: remove listings without destroying future application history.
-- Apply after 0006_jobs.sql. No existing job rows are removed or reassigned.
alter table public.jobs add column deleted_at timestamptz;

create function public.stamp_job_update()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
create trigger stamp_job_update before update on public.jobs
  for each row execute function public.stamp_job_update();

-- Deleted postings are hidden from seekers; their owner can retain history.
drop policy "Authenticated users can view jobs" on public.jobs;
create policy "Users can view active jobs or their own recruiter history"
  on public.jobs for select to authenticated
  using (deleted_at is null or (
    recruiter_id = (select auth.uid()) and
    (select role from public.profiles where id = (select auth.uid())) = 'recruiter'::public.user_role
  ));

create policy "Recruiters can create their own jobs"
  on public.jobs for insert to authenticated
  with check (
    recruiter_id = (select auth.uid()) and deleted_at is null and
    (select role from public.profiles where id = (select auth.uid())) = 'recruiter'::public.user_role
  );
create policy "Recruiters can update their own active jobs"
  on public.jobs for update to authenticated
  using (
    recruiter_id = (select auth.uid()) and deleted_at is null and
    (select role from public.profiles where id = (select auth.uid())) = 'recruiter'::public.user_role
  )
  with check (
    recruiter_id = (select auth.uid()) and
    (select role from public.profiles where id = (select auth.uid())) = 'recruiter'::public.user_role
  );

-- No hard deletes from the app: deletion is an authorized update to deleted_at.
revoke delete on public.jobs from authenticated;
