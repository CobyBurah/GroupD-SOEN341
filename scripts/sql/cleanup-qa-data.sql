-- READ-ONLY candidate preview for issue #203. Review exact IDs with the team.
-- Prefixes can match real data: no deletion is authorized by this query.
-- Run in Supabase SQL editor, where the operator has permission to inspect
-- public profiles. No auth credentials or tokens are selected.
select id, recruiter_id, title, company, created_at, deleted_at, archived_at
from public.jobs
where title ~* '^(QA-REC|QA-NOTIF|QA-S4|AT)([[:space:]-]|$)'
order by created_at, id;

select id, full_name, role, created_at
from public.profiles
where full_name ~* '^QA([[:space:]-]|$)'
order by created_at, id;
