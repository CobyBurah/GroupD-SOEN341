-- Adds the Under Review status between Applied and Interview. Apply after 0009.
alter table public.applications drop constraint applications_status_check;
alter table public.applications add constraint applications_status_check
  check (status in ('Applied', 'Under Review', 'Interview', 'Offered', 'Rejected'));
