-- Store workplace type separately from geographic location.

alter table public.jobs
  add column if not exists workplace_type text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'jobs_workplace_type_check'
      and conrelid = 'public.jobs'::regclass
  ) then
    alter table public.jobs
      add constraint jobs_workplace_type_check
      check (workplace_type is null or workplace_type in ('onsite', 'hybrid', 'remote'));
  end if;
end;
$$;

update public.jobs
set
  workplace_type = 'remote',
  location = null,
  location_city = null,
  location_region = null,
  location_country = null
where lower(location) = 'remote';