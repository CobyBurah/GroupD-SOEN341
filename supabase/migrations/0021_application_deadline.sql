-- Sprint 4 bug fix: postings stop accepting applications after their deadline.
-- Apply after 0020_security_hardening.sql. No data changes.
--
-- application_deadline is a UTC calendar date. A posting stays open through
-- its deadline day and closes the day after, matching isPastDeadline() in
-- src/lib/job-posting.ts. The app already hides past-deadline postings from
-- listings; this policy makes the database reject direct API inserts too.
drop policy "Seekers can apply with their own resume to active jobs" on public.applications;
create policy "Seekers can apply with their own resume to active jobs"
  on public.applications for insert to authenticated
  with check (
    user_id = (select auth.uid()) and status = 'Applied'
    and (select role from public.profiles where id = (select auth.uid())) = 'job_seeker'::public.user_role
    and exists (
      select 1 from public.jobs
      where id = job_id and deleted_at is null and archived_at is null
        and (application_deadline is null
             or application_deadline >= (now() at time zone 'UTC')::date)
    )
    and exists (select 1 from public.resumes where id = resume_id and user_id = (select auth.uid()))
  );
