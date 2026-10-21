-- Favourites: job seekers bookmark jobs to revisit later. Apply after 0010.
-- One row per (seeker, job); removing either side removes the bookmark.
create table public.favourites (
  user_id uuid not null references auth.users(id) on delete cascade,
  job_id uuid not null references public.jobs(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, job_id)
);

-- The favourites page lists a seeker's bookmarks newest first.
create index favourites_user_created_idx on public.favourites (user_id, created_at desc);
create index favourites_job_id_idx on public.favourites (job_id);

alter table public.favourites enable row level security;

create policy "Seekers can read their favourites"
  on public.favourites for select to authenticated
  using (user_id = (select auth.uid()));

create policy "Seekers can favourite active jobs"
  on public.favourites for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and (select role from public.profiles where id = (select auth.uid())) = 'job_seeker'::public.user_role
    and exists (select 1 from public.jobs where id = job_id and deleted_at is null)
  );

create policy "Seekers can remove their favourites"
  on public.favourites for delete to authenticated
  using (user_id = (select auth.uid()));

-- Bookmarks are added or removed, never edited.
revoke update on public.favourites from authenticated;
