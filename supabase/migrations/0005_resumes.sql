-- Private storage bucket for résumé files, plus the table tracking them.
-- Files live at {user_id}/{uuid}.{ext}, so the first path segment is the
-- owner — that's what the storage.objects policies below check.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'resumes',
  'resumes',
  false,
  5242880,
  array[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
);

create table public.resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  file_name text not null,
  storage_path text not null unique,
  mime_type text not null,
  size_bytes bigint not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.resumes enable row level security;

create policy "Users can view their own resumes"
  on public.resumes for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can delete their own resumes"
  on public.resumes for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- Only job seekers manage resumes; recruiters have no business reason to.
create policy "Job seekers can insert their own resumes"
  on public.resumes for insert
  to authenticated
  with check (
    (select auth.uid()) = user_id
    and (select role from public.profiles where id = (select auth.uid())) = 'job_seeker'::public.user_role
  );

create policy "Job seekers can update their own resumes"
  on public.resumes for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and (select role from public.profiles where id = (select auth.uid())) = 'job_seeker'::public.user_role
  );

create policy "Users can upload to their own resume folder"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'resumes'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

create policy "Users can view their own resume files"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'resumes'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

create policy "Users can delete their own resume files"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'resumes'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );
