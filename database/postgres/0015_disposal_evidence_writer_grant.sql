-- Test project only: allow the server-side evidence writer to create pending rows.
-- No member/anon privileges are added and RLS remains enabled.
begin;
grant insert on table public.disposal_evidence to service_role;
commit;
