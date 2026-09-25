-- Profiles: one row per auth user, holding app-level data such as the user's role.
-- Rows are created by the on_auth_user_created trigger from the metadata passed
-- to supabase.auth.signUp() (see src/app/signup/actions.ts).

create type public.user_role as enum ('job_seeker', 'recruiter');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  role public.user_role not null default 'job_seeker',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Users may edit their name but not their role.
revoke update on public.profiles from authenticated;
grant update (full_name, updated_at) on public.profiles to authenticated;

-- No insert policy: only the trigger below creates profiles.

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    -- Metadata comes from the client, so only accept known roles.
    case new.raw_user_meta_data ->> 'role'
      when 'recruiter' then 'recruiter'::public.user_role
      else 'job_seeker'::public.user_role
    end
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
