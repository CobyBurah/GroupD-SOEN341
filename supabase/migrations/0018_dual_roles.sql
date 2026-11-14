-- Dual-role accounts: one account can be both a job seeker and a recruiter.
--
-- profiles.roles lists the roles an account may use. profiles.role keeps its
-- name but now means the *active* role, so every existing RLS policy and app
-- check that reads profiles.role keeps working unchanged and follows whichever
-- mode the user is currently in.
--
-- Users still cannot update either column directly (no column grant); they
-- change only through add_role() and set_active_role() below.

alter table public.profiles
  add column roles public.user_role[] not null default '{job_seeker}';

update public.profiles set roles = array[role];

alter table public.profiles
  add constraint profiles_active_role_owned check (role = any (roles));

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  chosen public.user_role;
begin
  -- Metadata comes from the client, so only accept known roles.
  chosen := case new.raw_user_meta_data ->> 'role'
    when 'recruiter' then 'recruiter'::public.user_role
    else 'job_seeker'::public.user_role
  end;

  insert into public.profiles (id, full_name, role, roles)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    chosen,
    array[chosen]
  );
  return new;
end;
$$;

-- Lets the signed-in user add the other role to their own account.
create function public.add_role(new_role public.user_role)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.profiles
  set roles = array_append(roles, new_role), updated_at = now()
  where id = (select auth.uid()) and not (new_role = any (roles));
$$;

-- Switches the signed-in user's active role. A role the account doesn't hold
-- is ignored (no error), so login can call this for single-role users.
-- Returns the user's resulting active role.
create function public.set_active_role(new_role public.user_role)
returns public.user_role
language plpgsql
security definer
set search_path = ''
as $$
declare
  result public.user_role;
begin
  update public.profiles
  set role = new_role, updated_at = now()
  where id = (select auth.uid()) and new_role = any (roles) and role <> new_role;

  select role into result from public.profiles where id = (select auth.uid());
  return result;
end;
$$;

revoke execute on function public.add_role(public.user_role) from public, anon;
revoke execute on function public.set_active_role(public.user_role) from public, anon;
grant execute on function public.add_role(public.user_role) to authenticated;
grant execute on function public.set_active_role(public.user_role) to authenticated;
