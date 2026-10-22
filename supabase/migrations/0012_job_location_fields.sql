-- Add structured location information to job postings.
-- The existing location field stays as the formatted value shown in the UI.

alter table public.jobs
  add column if not exists location_city text,
  add column if not exists location_region text,
  add column if not exists location_country text;