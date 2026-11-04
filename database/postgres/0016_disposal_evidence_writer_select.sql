-- Test project only: INSERT ... RETURNING id also requires SELECT privilege.
begin;
grant select, insert on table public.disposal_evidence to service_role;
commit;
