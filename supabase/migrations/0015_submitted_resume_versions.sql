-- Apply before deploying the submitted-resume UI. Keep the file that was
-- selected at submission, independently of the editable resumes list.
begin;

-- Prevent replacement/storage cleanup while historical files are being pinned.
lock table public.resumes, storage.objects in share row exclusive mode;

alter table public.applications
  add column submitted_resume_name text,
  add column submitted_resume_path text,
  add column resume_snapshot_is_legacy boolean not null default false;

-- Historical originals cannot be reconstructed. Freeze only the currently
-- available file, and label it as captured during this upgrade in the UI.
update public.applications set resume_snapshot_is_legacy = true;
update public.applications a
set submitted_resume_name = r.file_name, submitted_resume_path = r.storage_path
from public.resumes r
where r.id = a.resume_id and r.user_id = a.user_id
  and split_part(r.storage_path, '/', 1) = a.user_id::text
  and exists (select 1 from storage.objects o
              where o.bucket_id = 'resumes' and o.name = r.storage_path);

create index applications_submitted_resume_path_idx
  on public.applications (submitted_resume_path)
  where submitted_resume_path is not null;

create function public.capture_submitted_resume()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  selected_resume public.resumes%rowtype;
begin
  if tg_op = 'UPDATE' then
    if new.submitted_resume_name is distinct from old.submitted_resume_name
       or new.submitted_resume_path is distinct from old.submitted_resume_path
       or new.resume_snapshot_is_legacy is distinct from old.resume_snapshot_is_legacy then
      raise exception 'Submitted resume versions are immutable' using errcode = '42501';
    end if;
    return new;
  end if;

  -- Serialize against resume replacement/deletion. Never trust snapshot fields
  -- supplied by the client; derive them from the applicant's selected resume.
  select * into selected_resume from public.resumes
    where id = new.resume_id and user_id = new.user_id for update;
  if not found then
    raise exception 'Choose an available resume you own' using errcode = '42501';
  end if;
  if split_part(selected_resume.storage_path, '/', 1) <> new.user_id::text then
    raise exception 'The selected resume file is not yours' using errcode = '42501';
  end if;
  if not exists (select 1 from storage.objects
                 where bucket_id = 'resumes' and name = selected_resume.storage_path) then
    raise exception 'The selected resume file is unavailable' using errcode = '23514';
  end if;
  new.submitted_resume_name := selected_resume.file_name;
  new.submitted_resume_path := selected_resume.storage_path;
  new.resume_snapshot_is_legacy := false;
  return new;
end
$$;
revoke execute on function public.capture_submitted_resume() from public, anon, authenticated;
create trigger capture_submitted_resume
  before insert or update on public.applications
  for each row execute function public.capture_submitted_resume();

-- A recruiter gets the submitted version, not future changes to the seeker's
-- editable resume row. The application row remains protected by existing RLS.
drop policy "Recruiters can view submitted resumes" on public.resumes;
create or replace function public.resume_file_in_my_applications(path text)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.applications a
    where a.submitted_resume_path = path and public.owns_job(a.job_id))
$$;

-- Protect both current and submitted files from direct Storage API deletion,
-- overwrite or move. The app first removes/changes metadata, then attempts file
-- cleanup. Files still referenced by any application or resume are retained.
create function public.resume_file_is_referenced(path text)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.resumes where storage_path = path)
      or exists (select 1 from public.applications where submitted_resume_path = path)
$$;
revoke execute on function public.resume_file_is_referenced(text) from public, anon;
grant execute on function public.resume_file_is_referenced(text) to authenticated;

create policy "Retain referenced resume files on delete"
  on storage.objects as restrictive for delete to authenticated
  using (bucket_id <> 'resumes' or not public.resume_file_is_referenced(name));
create policy "Keep referenced resume files immutable"
  on storage.objects as restrictive for update to authenticated
  using (bucket_id <> 'resumes' or not public.resume_file_is_referenced(name))
  with check (bucket_id <> 'resumes' or not public.resume_file_is_referenced(name));

commit;
