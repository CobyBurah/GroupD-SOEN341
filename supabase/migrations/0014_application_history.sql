-- Records every status an application moves through so seekers can see its
-- history, and lets seekers withdraw (delete) their own applications. Apply after 0013.

create table public.application_status_history (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  status text not null check (status in ('Applied', 'Under Review', 'Interview', 'Offered', 'Rejected')),
  changed_at timestamptz not null default now()
);
create index application_status_history_application_id_idx on public.application_status_history (application_id);

alter table public.application_status_history enable row level security;

-- Seekers read the history of their own applications. Nobody writes rows
-- directly; the trigger below is the only writer.
create policy "Seekers can read their application history"
  on public.application_status_history for select to authenticated
  using (exists (
    select 1 from public.applications a
    where a.id = application_id and a.user_id = (select auth.uid())
  ));
revoke insert, update, delete on public.application_status_history from authenticated, anon;

-- Security definer so the insert succeeds even though neither seekers nor
-- recruiters may write history rows themselves.
create function public.log_application_status()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'INSERT' then
    insert into public.application_status_history (application_id, status, changed_at)
    values (new.id, new.status, new.created_at);
  elsif new.status is distinct from old.status then
    insert into public.application_status_history (application_id, status)
    values (new.id, new.status);
  end if;
  return new;
end
$$;
revoke execute on function public.log_application_status() from public, anon, authenticated;

create trigger log_application_status
  after insert or update of status on public.applications
  for each row execute function public.log_application_status();

-- Backfill applications made before this migration. When a status was changed
-- earlier, the real time of the change is unknown, so it is recorded at migration time.
insert into public.application_status_history (application_id, status, changed_at)
select id, 'Applied', created_at from public.applications;
insert into public.application_status_history (application_id, status)
select id, status from public.applications where status <> 'Applied';

-- Withdrawing removes the application (and its history, via the cascade),
-- so the seeker can apply to the same job again later.
create policy "Seekers can withdraw their applications"
  on public.applications for delete to authenticated
  using (user_id = (select auth.uid()));
grant delete on public.applications to authenticated;
