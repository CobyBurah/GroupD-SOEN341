-- US-20: recruiters can archive (close) a posting and restore it later.
-- Apply after 0018_dual_roles.sql. Existing rows stay active (archived_at is null).
--
-- Archived postings:
--   * stay visible to their recruiter, with every application still reachable;
--   * are hidden from job search, filters and listings (the app filters on archived_at);
--   * stay readable by seekers who already applied, so their history keeps the job;
--   * cannot receive new applications or favourites, and send no deadline reminders.
-- Deleting (deleted_at) is unchanged and still final.
alter table public.jobs add column archived_at timestamptz;

create index jobs_recruiter_archived_idx on public.jobs (recruiter_id, archived_at)
  where deleted_at is null;

-- New applications and favourites only for postings that are neither deleted nor archived.
drop policy "Seekers can apply with their own resume to active jobs" on public.applications;
create policy "Seekers can apply with their own resume to active jobs"
  on public.applications for insert to authenticated
  with check (
    user_id = (select auth.uid()) and status = 'Applied'
    and (select role from public.profiles where id = (select auth.uid())) = 'job_seeker'::public.user_role
    and exists (select 1 from public.jobs where id = job_id and deleted_at is null and archived_at is null)
    and exists (select 1 from public.resumes where id = resume_id and user_id = (select auth.uid()))
  );

drop policy "Seekers can favourite active jobs" on public.favourites;
create policy "Seekers can favourite active jobs"
  on public.favourites for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and (select role from public.profiles where id = (select auth.uid())) = 'job_seeker'::public.user_role
    and exists (select 1 from public.jobs where id = job_id and deleted_at is null and archived_at is null)
  );

-- Deadline reminders: skip archived postings, and use the roles the account holds
-- (0018) rather than the active mode, so a dual-role user in recruiter mode still
-- gets reminders for jobs they saved or applied to as a seeker.
create or replace function public.refresh_deadline_reminders()
returns void language plpgsql security definer set search_path = '' as $$
declare caller uuid := auth.uid(); today date := (now() at time zone 'UTC')::date;
begin
  if caller is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  if not exists (
    select 1 from public.profiles where id = caller and 'job_seeker'::public.user_role = any (roles)
  ) then return; end if;
  insert into public.notifications(user_id, kind, message, href, reminder_key)
  select caller, 'deadline', 'Application deadline for ' || j.title || ': ' || j.application_deadline::text || ' (UTC).',
    '/jobs/' || j.id::text, j.id::text || ':' || j.application_deadline::text
  from public.jobs j
  where j.deleted_at is null and j.archived_at is null
    and j.application_deadline between today and today + 3
    and (exists (select 1 from public.favourites f where f.user_id = caller and f.job_id = j.id)
      or exists (select 1 from public.applications a where a.user_id = caller and a.job_id = j.id))
  on conflict (user_id, reminder_key) do nothing;
end
$$;
revoke execute on function public.refresh_deadline_reminders() from public, anon;
grant execute on function public.refresh_deadline_reminders() to authenticated;
