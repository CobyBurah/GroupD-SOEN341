-- Recruiters review applications to their own postings and move them through
-- the Applied -> Interview -> Offered / Rejected statuses. Apply after 0008.

-- These helpers are security definer so policies on profiles/resumes can look
-- at applications (and vice versa) without recursing through each other's RLS.
create function public.owns_job(job uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.jobs j join public.profiles p on p.id = j.recruiter_id
    where j.id = job and j.recruiter_id = (select auth.uid()) and p.role = 'recruiter'::public.user_role
  )
$$;

create function public.applied_to_my_jobs(applicant uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.applications a
    where a.user_id = applicant and public.owns_job(a.job_id)
  )
$$;

create function public.resume_in_my_applications(resume uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.applications a
    where a.resume_id = resume and public.owns_job(a.job_id)
  )
$$;

create function public.resume_file_in_my_applications(path text)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.resumes r join public.applications a on a.resume_id = r.id
    where r.storage_path = path and public.owns_job(a.job_id)
  )
$$;

revoke execute on function public.owns_job(uuid), public.applied_to_my_jobs(uuid),
  public.resume_in_my_applications(uuid), public.resume_file_in_my_applications(text) from public, anon;
grant execute on function public.owns_job(uuid), public.applied_to_my_jobs(uuid),
  public.resume_in_my_applications(uuid), public.resume_file_in_my_applications(text) to authenticated;

create policy "Recruiters can read applications to their jobs"
  on public.applications for select to authenticated
  using (public.owns_job(job_id));

-- Recruiters may only change the status; seekers have no update policy at all.
create policy "Recruiters can update applications to their jobs"
  on public.applications for update to authenticated
  using (public.owns_job(job_id))
  with check (public.owns_job(job_id));
revoke update on public.applications from authenticated;
grant update (status) on public.applications to authenticated;

-- Recruiters see the applicant's public profile and the resume they submitted.
create policy "Recruiters can view applicant profiles"
  on public.profiles for select to authenticated
  using (public.applied_to_my_jobs(id));

create policy "Recruiters can view submitted resumes"
  on public.resumes for select to authenticated
  using (public.resume_in_my_applications(id));

create policy "Recruiters can view submitted resume files"
  on storage.objects for select to authenticated
  using (bucket_id = 'resumes' and public.resume_file_in_my_applications(name));
