-- EXAMPLE ONLY: separate user approval required before execution on Cloud.
-- First create/verify the intended account through Supabase Auth, then review its UUID.
-- This placeholder is intentionally not a valid UUID and cannot silently grant access.
begin;
insert into private.user_roles(user_id,role_code)
values ('REPLACE_WITH_APPROVED_AUTH_USER_UUID'::uuid,'admin');
commit;
