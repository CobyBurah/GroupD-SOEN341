-- US-17 inbox. Event producers supply user_id, title and message.
begin;

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  message text not null,
  created_at timestamptz not null default now(),
  is_read boolean not null default false
);
create index notifications_inbox_idx on public.notifications (user_id, created_at desc, id desc);
create index notifications_unread_idx on public.notifications (user_id) where not is_read;

alter table public.notifications enable row level security;
revoke all on public.notifications from public, anon, authenticated;
grant select, update (is_read) on public.notifications to authenticated;

create policy "Recipients can read their notifications"
  on public.notifications for select to authenticated
  using (user_id = (select auth.uid()));
create policy "Recipients can mark their notifications read"
  on public.notifications for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()) and is_read);

commit;
