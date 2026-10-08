-- Keeps auth.users.raw_user_meta_data.full_name (the "Display name" in the
-- Supabase dashboard) in sync when a user renames themselves in public.profiles.
-- Runs as the function owner because the authenticated role can't write auth.users.
create function public.sync_profile_name_to_auth()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update auth.users
     set raw_user_meta_data =
           coalesce(raw_user_meta_data, '{}'::jsonb)
           || jsonb_build_object('full_name', new.full_name)
   where id = new.id;
  return new;
end;
$$;

create trigger on_profile_name_updated
  after update of full_name on public.profiles
  for each row
  when (old.full_name is distinct from new.full_name)
  execute function public.sync_profile_name_to_auth();

-- One-time backfill for users who renamed themselves before this migration.
update auth.users u
   set raw_user_meta_data =
         coalesce(u.raw_user_meta_data, '{}'::jsonb)
         || jsonb_build_object('full_name', p.full_name)
  from public.profiles p
 where p.id = u.id
   and u.raw_user_meta_data ->> 'full_name' is distinct from p.full_name;
