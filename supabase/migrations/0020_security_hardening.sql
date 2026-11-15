-- Fixes from the Supabase security and performance advisors. Apply after 0019.
-- No data changes.

-- SECURITY DEFINER functions are executable by PUBLIC by default.
-- delete_own_account is meant for signed-in users only.
revoke execute on function public.delete_own_account() from public, anon;
grant execute on function public.delete_own_account() to authenticated;

-- Trigger-only functions must not be callable through /rest/v1/rpc.
-- Triggers still fire: EXECUTE is not checked when a trigger runs.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.sync_profile_name_to_auth() from public, anon, authenticated;

-- Cover foreign keys used by RLS checks and cascades.
create index if not exists applications_user_id_idx on public.applications (user_id);
create index if not exists applications_resume_id_idx on public.applications (resume_id);
create index if not exists resume_feedback_user_id_idx on public.resume_feedback (user_id);
create index if not exists resumes_user_id_idx on public.resumes (user_id);
