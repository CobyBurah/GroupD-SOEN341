-- In-app alerts. Apply after 0016; no external service or service-role key needed.
alter table public.jobs add column application_deadline date;
create index jobs_application_deadline_idx on public.jobs(application_deadline)
  where deleted_at is null and application_deadline is not null;

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('application_status', 'interview', 'new_application', 'deadline')),
  message text not null,
  href text not null check (href like '/%' and href not like '//%'),
  created_at timestamptz not null default now(),
  read_at timestamptz,
  -- One reminder per user/job/deadline, including when a job is both saved and applied to.
  reminder_key text,
  unique (user_id, reminder_key)
);
create index notifications_user_created_idx on public.notifications(user_id, created_at desc, id desc);
create index notifications_unread_idx on public.notifications(user_id) where read_at is null;
alter table public.notifications enable row level security;
create policy "Users read their own notifications" on public.notifications
  for select to authenticated using (user_id = (select auth.uid()));
create policy "Users mark their own notifications read" on public.notifications
  for update to authenticated using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
-- Supabase's default privileges are broader; restrict writes to read_at only.
revoke all on public.notifications from public, anon, authenticated;
grant select, update(read_at) on public.notifications to authenticated;

create function public.notify_application_event()
returns trigger language plpgsql security definer set search_path = '' as $$
declare posting public.jobs%rowtype;
begin
  select * into posting from public.jobs where id = new.job_id;
  if tg_op = 'INSERT' then
    insert into public.notifications(user_id, kind, message, href)
    values (posting.recruiter_id, 'new_application',
      'New application for ' || posting.title || '.',
      '/recruiter/jobs/' || new.job_id::text || '/applications');
  elsif new.status is distinct from old.status then
    insert into public.notifications(user_id, kind, message, href)
    values (new.user_id, case when new.status = 'Interview' then 'interview' else 'application_status' end,
      case when new.status = 'Interview'
        then 'Interview invitation: your application for ' || posting.title || ' is now at Interview. Check the posting and contact the recruiter for details.'
        else 'Your application for ' || posting.title || ' is now ' || new.status || '.' end,
      '/applications');
  end if;
  return new;
end
$$;
revoke execute on function public.notify_application_event() from public, anon, authenticated;
create trigger notify_application_event after insert or update of status on public.applications
  for each row execute function public.notify_application_event();

-- Called while signed in (on opening the app, then every 30 seconds while visible).
-- Only the caller's reminders are generated; no caller-supplied user ID is accepted.
-- UTC date boundaries match the date-only posting form and detail view.
create function public.refresh_deadline_reminders()
returns void language plpgsql security definer set search_path = '' as $$
declare caller uuid := auth.uid(); today date := (now() at time zone 'UTC')::date;
begin
  if caller is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  if not exists (select 1 from public.profiles where id = caller and role = 'job_seeker') then return; end if;
  insert into public.notifications(user_id, kind, message, href, reminder_key)
  select caller, 'deadline', 'Application deadline for ' || j.title || ': ' || j.application_deadline::text || ' (UTC).',
    '/jobs/' || j.id::text, j.id::text || ':' || j.application_deadline::text
  from public.jobs j
  where j.deleted_at is null and j.application_deadline between today and today + 3
    and (exists (select 1 from public.favourites f where f.user_id = caller and f.job_id = j.id)
      or exists (select 1 from public.applications a where a.user_id = caller and a.job_id = j.id))
  on conflict (user_id, reminder_key) do nothing;
end
$$;
revoke execute on function public.refresh_deadline_reminders() from public, anon;
grant execute on function public.refresh_deadline_reminders() to authenticated;
