-- Lets a signed-in user permanently delete their own account. Runs as the
-- function owner (bypassing RLS) because deleting from auth.users requires
-- elevated privileges the authenticated role doesn't have. The profiles row
-- cleans up on its own via its "on delete cascade" foreign key.
create function public.delete_own_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from auth.users where id = (select auth.uid());
end;
$$;

grant execute on function public.delete_own_account() to authenticated;
